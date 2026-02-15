import { motion } from 'framer-motion'
import { getConfidenceColor } from '../../utils/canvas'
import { formatConfidence } from '../../utils/formatters'

interface ConfidenceBarProps {
  name: string
  confidence: number
  color: string
}

export default function ConfidenceBar({ name, confidence, color }: ConfidenceBarProps) {
  const confColor = getConfidenceColor(confidence)

  return (
    <div className="flex items-center gap-3">
      {/* Color dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Name */}
      <span className="text-sm text-gray-300 w-24 truncate">{name}</span>

      {/* Bar */}
      <div className="flex-1 h-2 bg-dark-600 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: confColor }}
          initial={{ width: 0 }}
          animate={{ width: `${confidence * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Percentage */}
      <span className="text-sm font-mono w-14 text-right" style={{ color: confColor }}>
        {formatConfidence(confidence)}
      </span>
    </div>
  )
}
