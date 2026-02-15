import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import type { QualityFeedback } from '../../types'

interface QualityIndicatorProps {
  quality: QualityFeedback | null
}

export default function QualityIndicator({ quality }: QualityIndicatorProps) {
  if (!quality) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-dark-600 rounded-lg">
        <div className="w-3 h-3 rounded-full bg-gray-500 animate-pulse" />
        <span className="text-sm text-gray-400">In attesa del volto...</span>
      </div>
    )
  }

  const isGood = quality.is_good

  return (
    <motion.div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
        isGood
          ? 'bg-accent-green/10 border-accent-green/30'
          : 'bg-accent-red/10 border-accent-red/30'
      }`}
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      key={quality.message}
    >
      {isGood ? (
        <CheckCircle size={18} className="text-accent-green" />
      ) : (
        <AlertCircle size={18} className="text-accent-red" />
      )}
      <span className={`text-sm font-medium ${isGood ? 'text-accent-green' : 'text-accent-red'}`}>
        {quality.message}
      </span>
    </motion.div>
  )
}
