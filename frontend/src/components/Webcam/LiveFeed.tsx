import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { FaceData } from '../../types'
import DetectionOverlay from './DetectionOverlay'

interface LiveFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  faces: FaceData[]
  isActive: boolean
  showLandmarks?: boolean
  error?: string | null
  children?: React.ReactNode
}

export default function LiveFeed({
  videoRef, canvasRef, faces, isActive, showLandmarks, error, children,
}: LiveFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative bg-dark-800 rounded-2xl overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full aspect-video object-cover"
        style={{ transform: 'scaleX(-1)' }} // Specchia come selfie
      />

      {/* Canvas nascosto per cattura frame */}
      <canvas ref={canvasRef} className="hidden" width={640} height={480} />

      {/* Overlay detection */}
      {isActive && (
        <DetectionOverlay
          faces={faces}
          videoWidth={640}
          videoHeight={480}
          showLandmarks={showLandmarks}
        />
      )}

      {/* Stato inattivo */}
      {!isActive && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-900/80">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center">
              <span className="text-3xl">📷</span>
            </div>
            <p className="text-gray-400">Camera non attiva</p>
            <p className="text-gray-500 text-sm mt-1">Clicca Start per iniziare</p>
          </motion.div>
        </div>
      )}

      {/* Errore */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-900/90">
          <motion.div
            className="text-center p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-accent-red font-medium">Errore Webcam</p>
            <p className="text-gray-400 text-sm mt-2 max-w-xs">{error}</p>
          </motion.div>
        </div>
      )}

      {/* Children slot per controlli aggiuntivi */}
      {children}
    </div>
  )
}
