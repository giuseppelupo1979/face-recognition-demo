import { motion, AnimatePresence } from 'framer-motion'
import type { FaceData } from '../../types'
import FaceBox from '../Recognition/FaceBox'

interface DetectionOverlayProps {
  faces: FaceData[]
  videoWidth: number
  videoHeight: number
  showLandmarks?: boolean
}

export default function DetectionOverlay({
  faces, videoWidth, videoHeight, showLandmarks,
}: DetectionOverlayProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ transform: 'scaleX(-1)' }} // Match video mirror
    >
      <AnimatePresence>
        {faces.map((face, idx) => {
          const [x, y, w, h] = face.box
          // Converti coordinate da video space a percentuale
          const left = (x / videoWidth) * 100
          const top = (y / videoHeight) * 100
          const width = (w / videoWidth) * 100
          const height = (h / videoHeight) * 100

          return (
            <FaceBox
              key={`${face.name}-${idx}`}
              face={face}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
              }}
              showLandmarks={showLandmarks}
              videoWidth={videoWidth}
              videoHeight={videoHeight}
            />
          )
        })}
      </AnimatePresence>

      {/* Scan line effect */}
      {faces.length > 0 && (
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent-cyan to-transparent opacity-30"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </div>
  )
}
