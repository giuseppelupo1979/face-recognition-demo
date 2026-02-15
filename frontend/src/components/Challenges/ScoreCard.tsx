import { motion } from 'framer-motion'
import { Star, RotateCcw } from 'lucide-react'

interface ScoreCardProps {
  title: string
  score: number
  maxScore: number
  details?: Record<string, unknown>
  onRetry: () => void
  onClose: () => void
}

export default function ScoreCard({ title, score, maxScore, details, onRetry, onClose }: ScoreCardProps) {
  const stars = Math.round((score / maxScore) * 5)
  const percentage = Math.round((score / maxScore) * 100)

  let rating = 'Eccellente!'
  let ratingColor = 'text-accent-green'
  if (percentage < 40) { rating = 'Da migliorare'; ratingColor = 'text-accent-red' }
  else if (percentage < 60) { rating = 'Sufficiente'; ratingColor = 'text-accent-yellow' }
  else if (percentage < 80) { rating = 'Buono'; ratingColor = 'text-accent-cyan' }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-dark-800 rounded-2xl p-8 text-center max-w-md mx-auto"
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-6">Challenge completata!</p>

      {/* Score circle */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="42"
            fill="none" stroke="#252b4a" strokeWidth="8"
          />
          <motion.circle
            cx="50" cy="50" r="42"
            fill="none" stroke="url(#scoreGradient)" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - score / maxScore) }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d9ff" />
              <stop offset="100%" stopColor="#00ff88" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold font-mono text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score.toFixed(1)}
          </motion.span>
          <span className="text-xs text-gray-500">/ {maxScore}</span>
        </div>
      </div>

      {/* Stars */}
      <div className="flex justify-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + i * 0.15 }}
          >
            <Star
              size={24}
              className={i < stars ? 'text-accent-yellow fill-accent-yellow' : 'text-gray-600'}
            />
          </motion.div>
        ))}
      </div>

      <p className={`text-lg font-medium ${ratingColor} mb-6`}>{rating}</p>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors"
        >
          <RotateCcw size={16} />
          Riprova
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-black font-medium rounded-lg"
        >
          Torna alle Challenge
        </motion.button>
      </div>
    </motion.div>
  )
}
