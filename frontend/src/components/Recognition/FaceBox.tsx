import { motion } from 'framer-motion'
import type { FaceData } from '../../types'
import { getConfidenceColor } from '../../utils/canvas'
import { formatConfidence, getEmotionEmoji } from '../../utils/formatters'

interface FaceBoxProps {
  face: FaceData
  style: React.CSSProperties
  showLandmarks?: boolean
  videoWidth: number
  videoHeight: number
}

export default function FaceBox({ face, style, showLandmarks, videoWidth, videoHeight }: FaceBoxProps) {
  const confColor = getConfidenceColor(face.confidence)

  return (
    <motion.div
      className="absolute"
      style={style}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      {/* Bounding box */}
      <div
        className="absolute inset-0 border-2 rounded-sm"
        style={{ borderColor: face.color }}
      >
        {/* Corner accents */}
        <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 rounded-tl-sm" style={{ borderColor: face.color }} />
        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 rounded-tr-sm" style={{ borderColor: face.color }} />
        <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 rounded-bl-sm" style={{ borderColor: face.color }} />
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 rounded-br-sm" style={{ borderColor: face.color }} />
      </div>

      {/* Label */}
      <motion.div
        className="absolute -top-8 left-0 flex items-center gap-2 px-2 py-1 rounded-t text-xs font-medium whitespace-nowrap"
        style={{
          backgroundColor: face.color,
          color: '#000',
          transform: 'scaleX(-1)', // Un-mirror il testo
        }}
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <span>{face.name}</span>
        <span style={{ color: confColor }} className="font-mono font-bold">
          {formatConfidence(face.confidence)}
        </span>
        {face.emotion && (
          <span>{getEmotionEmoji(face.emotion)}</span>
        )}
      </motion.div>

      {/* Confidence bar sotto il box */}
      <div
        className="absolute -bottom-2 left-0 right-0 h-1 rounded-full overflow-hidden bg-dark-900/50"
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: confColor }}
          initial={{ width: 0 }}
          animate={{ width: `${face.confidence * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Landmarks */}
      {showLandmarks && face.landmarks && (
        <svg className="absolute inset-0 w-full h-full overflow-visible" style={{ transform: 'scaleX(-1)' }}>
          {Object.entries(face.landmarks).map(([part, points]) => (
            (points as [number, number][]).map(([px, py], i) => {
              const relX = ((px - face.box[0]) / face.box[2]) * 100
              const relY = ((py - face.box[1]) / face.box[3]) * 100
              return (
                <circle
                  key={`${part}-${i}`}
                  cx={`${relX}%`}
                  cy={`${relY}%`}
                  r={1.5}
                  fill={face.color}
                  opacity={0.8}
                />
              )
            })
          ))}
        </svg>
      )}
    </motion.div>
  )
}
