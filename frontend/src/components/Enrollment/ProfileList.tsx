import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, User, Clock } from 'lucide-react'
import * as api from '../../services/api'
import type { Profile } from '../../types'

interface ProfileListProps {
  onRefresh?: () => void
}

export default function ProfileList({ onRefresh }: ProfileListProps) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [maxProfiles, setMaxProfiles] = useState(4)
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadProfiles = async () => {
    try {
      const data = await api.getProfiles()
      setProfiles(data.profiles)
      setMaxProfiles(data.max_profiles)
    } catch {
      // Backend non disponibile
    }
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminare questo profilo?')) return
    setDeleting(id)
    try {
      await api.deleteProfile(id)
      await loadProfiles()
      onRefresh?.()
    } catch {
      alert('Errore eliminazione profilo')
    }
    setDeleting(null)
  }

  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">
          Profili Enrollati ({profiles.length}/{maxProfiles})
        </h3>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-8">
          <User size={40} className="mx-auto mb-3 text-gray-600" />
          <p className="text-gray-500 text-sm">Nessun profilo</p>
          <p className="text-gray-600 text-xs mt-1">Crea il primo profilo per iniziare</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {profiles.map((profile) => (
              <motion.div
                key={profile.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 bg-dark-700 rounded-lg"
              >
                {/* Thumbnail */}
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold"
                  style={{
                    backgroundColor: profile.color + '20',
                    color: profile.color,
                    border: `2px solid ${profile.color}`,
                  }}
                >
                  {profile.thumbnail ? (
                    <img
                      src={`data:image/jpeg;base64,${profile.thumbnail}`}
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    profile.name[0].toUpperCase()
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: profile.color }}>
                    {profile.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{profile.samples_count} samples</span>
                    <span className="text-gray-600">|</span>
                    <Clock size={10} />
                    <span>{new Date(profile.created_at * 1000).toLocaleDateString('it-IT')}</span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(profile.id)}
                  disabled={deleting === profile.id}
                  className="p-2 text-gray-500 hover:text-accent-red transition-colors rounded-lg hover:bg-dark-600"
                >
                  <Trash2 size={16} className={deleting === profile.id ? 'animate-spin' : ''} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
