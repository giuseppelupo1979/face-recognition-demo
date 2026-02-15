import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Video, UserPlus, Target, BarChart3, Cpu, ArrowRight, CheckCircle, XCircle } from 'lucide-react'
import * as api from '../services/api'
import type { Profile } from '../types'

export default function HomePage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [serverOnline, setServerOnline] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        await api.healthCheck()
        setServerOnline(true)
        const data = await api.getProfiles()
        setProfiles(data.profiles)
      } catch {
        setServerOnline(false)
      }
    }
    check()
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: UserPlus,
      title: 'Face Enrollment',
      desc: 'Registra fino a 4 profili con cattura multi-angolo',
      path: '/enrollment',
      color: '#00d9ff',
    },
    {
      icon: Video,
      title: 'Live Recognition',
      desc: 'Riconoscimento facciale in tempo reale via webcam',
      path: '/recognition',
      color: '#00ff88',
    },
    {
      icon: Target,
      title: 'Stress Test',
      desc: '6 challenge per testare la robustezza del sistema',
      path: '/challenges',
      color: '#ffd700',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      desc: 'Dashboard con grafici, timeline e metriche',
      path: '/analytics',
      color: '#a855f7',
    },
    {
      icon: Cpu,
      title: 'Tech Showcase',
      desc: 'Pipeline visualizzata, performance monitor',
      path: '/tech',
      color: '#ff8c00',
    },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero */}
      <div className="text-center mb-10">
        <motion.div
          className="inline-block mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center text-3xl font-bold mx-auto">
            FR
          </div>
        </motion.div>
        <h1 className="text-4xl font-bold mb-3">
          <span className="text-accent-cyan">Face</span> Recognition Demo
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Demo interattiva che mostra le potenzialita del riconoscimento facciale
          in tempo reale. Registra volti, testa il sistema e analizza le performance.
        </p>

        {/* Server status */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-full">
          {serverOnline ? (
            <>
              <CheckCircle size={14} className="text-accent-green" />
              <span className="text-sm text-accent-green">Server Online</span>
              <span className="text-gray-500 text-sm">| {profiles.length} profili</span>
            </>
          ) : (
            <>
              <XCircle size={14} className="text-accent-red" />
              <span className="text-sm text-accent-red">Server Offline</span>
              <span className="text-gray-500 text-sm">| Avvia il backend</span>
            </>
          )}
        </div>
      </div>

      {/* Quick start */}
      {profiles.length === 0 && serverOnline && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800 border border-accent-cyan/20 rounded-2xl p-6 mb-8 text-center"
        >
          <p className="text-gray-300 mb-3">Per iniziare, registra il tuo primo profilo!</p>
          <Link
            to="/enrollment"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-cyan text-black font-medium rounded-xl hover:bg-accent-cyan/90 transition-colors"
          >
            <UserPlus size={18} />
            Inizia Enrollment
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      )}

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, i) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={feature.path}
                className="block bg-dark-800 rounded-2xl p-6 border border-dark-600 hover:border-opacity-50 transition-all group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: feature.color + '15' }}
                >
                  <Icon size={24} style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold mb-1 group-hover:text-accent-cyan transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm text-gray-500 group-hover:text-accent-cyan transition-colors">
                  <span>Apri</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Tech stack */}
      <div className="mt-10 text-center">
        <p className="text-xs text-gray-600">
          React + TypeScript + TailwindCSS | Flask + Socket.IO | face_recognition + OpenCV + dlib
        </p>
      </div>
    </motion.div>
  )
}
