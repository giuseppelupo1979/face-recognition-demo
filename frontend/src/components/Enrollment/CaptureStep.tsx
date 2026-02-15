import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, RotateCcw, SkipForward, CheckCircle } from 'lucide-react'
import { useWebcam } from '../../hooks/useWebcam'
import { useSocketIO } from '../../hooks/useSocketIO'
import QualityIndicator from './QualityIndicator'
import * as api from '../../services/api'
import type { EnrollmentResult } from '../../types'

interface CaptureStepProps {
  step: string
  stepLabel: string
  instruction: string
  required: number
  onComplete: (result: EnrollmentResult) => void
  onSkip: () => void
}

const STEP_GUIDES: Record<string, string> = {
  front: 'Guarda dritto verso la camera',
  right: 'Ruota leggermente la testa a destra',
  left: 'Ruota leggermente la testa a sinistra',
  up: 'Alza leggermente il mento',
  down: 'Abbassa leggermente il mento',
}

export default function CaptureStep({
  step, stepLabel, instruction, required, onComplete, onSkip,
}: CaptureStepProps) {
  const { videoRef, canvasRef, isActive, startCamera, captureFrame } = useWebcam()
  const { enrollmentFeedback, sendEnrollmentFrame } = useSocketIO()
  const [captured, setCaptured] = useState(0)
  const [capturing, setCapturing] = useState(false)
  const [lastThumbnail, setLastThumbnail] = useState<string | null>(null)
  const feedbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Avvia camera e feedback loop
  useEffect(() => {
    startCamera()
  }, [startCamera])

  useEffect(() => {
    if (!isActive) return

    feedbackIntervalRef.current = setInterval(() => {
      const frame = captureFrame(0.5)
      if (frame) sendEnrollmentFrame(frame)
    }, 500) // Feedback ogni 500ms

    return () => {
      if (feedbackIntervalRef.current) clearInterval(feedbackIntervalRef.current)
    }
  }, [isActive, captureFrame, sendEnrollmentFrame])

  const handleCapture = useCallback(async () => {
    if (capturing) return
    setCapturing(true)

    const frame = captureFrame(0.9)
    if (!frame) {
      setCapturing(false)
      return
    }

    try {
      const result = await api.captureEnrollment(frame, step)
      if (result.error) {
        // Mostra feedback errore (gestito da quality indicator)
      } else {
        setCaptured(result.step_progress || captured + 1)
        if (result.thumbnail) setLastThumbnail(result.thumbnail)

        if ((result.step_progress || 0) >= required) {
          onComplete(result)
        }
      }
    } catch {
      // Errore rete
    }
    setCapturing(false)
  }, [capturing, captureFrame, step, required, captured, onComplete])

  const isQualityGood = enrollmentFeedback?.quality?.is_good

  return (
    <div className="space-y-4">
      {/* Step header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{stepLabel}</h3>
          <p className="text-sm text-gray-400">{instruction || STEP_GUIDES[step]}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-mono font-bold text-accent-cyan">{captured}</span>
          <span className="text-gray-500">/{required}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent-cyan rounded-full"
          animate={{ width: `${(captured / required) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Video feed */}
      <div className="relative bg-dark-800 rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full aspect-video object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas ref={canvasRef} className="hidden" width={640} height={480} />

        {/* Face guide overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Guida ovale al centro */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-48 h-64 border-2 border-dashed rounded-[50%] transition-colors duration-300 ${
                isQualityGood ? 'border-accent-green' : 'border-gray-500'
              }`}
            />
          </div>

          {/* Face box dal server */}
          {enrollmentFeedback?.face_box && (
            <div
              className="absolute border-2 border-accent-cyan rounded-sm"
              style={{
                left: `${(enrollmentFeedback.face_box[0] / 640) * 100}%`,
                top: `${(enrollmentFeedback.face_box[1] / 480) * 100}%`,
                width: `${(enrollmentFeedback.face_box[2] / 640) * 100}%`,
                height: `${(enrollmentFeedback.face_box[3] / 480) * 100}%`,
                transform: 'scaleX(-1)',
              }}
            />
          )}
        </div>
      </div>

      {/* Quality indicator */}
      <QualityIndicator quality={enrollmentFeedback?.quality || null} />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCapture}
          disabled={capturing || !isQualityGood}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
            isQualityGood
              ? 'bg-accent-cyan text-black hover:bg-accent-cyan/90'
              : 'bg-dark-600 text-gray-500 cursor-not-allowed'
          }`}
        >
          {capturing ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : captured >= required ? (
            <>
              <CheckCircle size={18} />
              Completato!
            </>
          ) : (
            <>
              <Camera size={18} />
              Cattura ({captured}/{required})
            </>
          )}
        </motion.button>

        <button
          onClick={onSkip}
          className="flex items-center gap-1 px-4 py-3 text-gray-400 hover:text-white bg-dark-600 rounded-xl transition-colors"
        >
          <SkipForward size={16} />
          <span className="text-sm">Skip</span>
        </button>
      </div>

      {/* Thumbnails catturate */}
      {captured > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Samples:</span>
          {Array.from({ length: captured }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 bg-accent-cyan/20 border border-accent-cyan/30 rounded flex items-center justify-center"
            >
              <CheckCircle size={12} className="text-accent-cyan" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
