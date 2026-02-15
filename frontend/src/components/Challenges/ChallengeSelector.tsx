import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, RotateCw, Shield, Ruler, Zap, Users } from 'lucide-react'
import type { ChallengeType } from '../../types'
import LightingChallenge from './LightingChallenge'
import AngleChallenge from './AngleChallenge'
import OcclusionChallenge from './OcclusionChallenge'
import DistanceChallenge from './DistanceChallenge'
import SpeedChallenge from './SpeedChallenge'
import MultiFaceChallenge from './MultiFaceChallenge'

const CHALLENGES = [
  {
    type: 'lighting' as ChallengeType,
    icon: Sun,
    title: 'Lighting Challenge',
    description: 'Diverse condizioni di illuminazione',
    color: '#ffd700',
  },
  {
    type: 'angle' as ChallengeType,
    icon: RotateCw,
    title: 'Angle Challenge',
    description: 'Rotazione testa: frontale, 45, 90',
    color: '#00d9ff',
  },
  {
    type: 'occlusion' as ChallengeType,
    icon: Shield,
    title: 'Occlusion Challenge',
    description: 'Mani, occhiali, mascherina, cappello',
    color: '#a855f7',
  },
  {
    type: 'distance' as ChallengeType,
    icon: Ruler,
    title: 'Distance Challenge',
    description: 'Avvicinati e allontanati dalla camera',
    color: '#00ff88',
  },
  {
    type: 'speed' as ChallengeType,
    icon: Zap,
    title: 'Speed Challenge',
    description: 'Movimenti rapidi e tracking stability',
    color: '#ff8c00',
  },
  {
    type: 'multi-face' as ChallengeType,
    icon: Users,
    title: 'Multi-Face Challenge',
    description: 'Tutti i profili contemporaneamente',
    color: '#ff4444',
  },
]

export default function ChallengeSelector() {
  const [activeChallenge, setActiveChallenge] = useState<ChallengeType | null>(null)

  const handleClose = () => setActiveChallenge(null)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
      <AnimatePresence mode="wait">
        {activeChallenge ? (
          <motion.div
            key={activeChallenge}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {activeChallenge === 'lighting' && <LightingChallenge onClose={handleClose} />}
            {activeChallenge === 'angle' && <AngleChallenge onClose={handleClose} />}
            {activeChallenge === 'occlusion' && <OcclusionChallenge onClose={handleClose} />}
            {activeChallenge === 'distance' && <DistanceChallenge onClose={handleClose} />}
            {activeChallenge === 'speed' && <SpeedChallenge onClose={handleClose} />}
            {activeChallenge === 'multi-face' && <MultiFaceChallenge onClose={handleClose} />}
          </motion.div>
        ) : (
          <motion.div
            key="selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-2xl font-bold mb-2">Stress Test Challenges</h2>
            <p className="text-gray-400 mb-6">
              Metti alla prova il sistema di riconoscimento con scenari diversi.
              Ogni challenge dura 60 secondi e produce un punteggio 0-10.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CHALLENGES.map((challenge, i) => {
                const Icon = challenge.icon
                return (
                  <motion.button
                    key={challenge.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveChallenge(challenge.type)}
                    className="bg-dark-800 rounded-2xl p-6 text-left border border-dark-600 hover:border-opacity-50 transition-all"
                    style={{ '--hover-border': challenge.color } as React.CSSProperties}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: challenge.color + '20' }}
                    >
                      <Icon size={24} style={{ color: challenge.color }} />
                    </div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: challenge.color }}>
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-gray-400">{challenge.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <span>60s</span>
                      <span className="text-gray-600">|</span>
                      <span>Score 0-10</span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
