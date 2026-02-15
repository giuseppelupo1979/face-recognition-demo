import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Timer, X } from 'lucide-react'
import { useWebcam } from '../../hooks/useWebcam'
import { useSocketIO } from '../../hooks/useSocketIO'
import LiveFeed from '../Webcam/LiveFeed'
import ScoreCard from './ScoreCard'
import type { FaceData } from '../../types'

interface ChallengeRunnerProps {
  title: string
  description: string
  instructions: string[]
  challengeType: string
  duration: number // secondi
  calculateScore: (history: FaceData[][], fps: number) => number
  renderOverlay?: (faces: FaceData[], timeLeft: number) => React.ReactNode
  onClose: () => void
}

export default function ChallengeRunner({
  title, description, instructions, challengeType, duration,
  calculateScore, renderOverlay, onClose,
}: ChallengeRunnerProps) {
  const webcam = useWebcam()
  const { faces, fps, sendChallengeFrame, saveChallengeScore } = useSocketIO()
  const [phase, setPhase] = useState<'intro' | 'running' | 'result'>('intro')
  const [timeLeft, setTimeLeft] = useState(duration)
  const [score, setScore] = useState(0)
  const historyRef = useRef<FaceData[][]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startChallenge = useCallback(async () => {
    await webcam.startCamera()
    setPhase('running')
    setTimeLeft(duration)
    historyRef.current = []

    // Invia frame al server
    intervalRef.current = setInterval(() => {
      const frame = webcam.captureFrame(0.7)
      if (frame) sendChallengeFrame(frame, challengeType)
    }, 100)

    // Timer countdown
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endChallenge()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [webcam, sendChallengeFrame, challengeType, duration])

  const endChallenge = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    webcam.stopCamera()

    const finalScore = calculateScore(historyRef.current, fps)
    setScore(finalScore)
    saveChallengeScore(challengeType, finalScore)
    setPhase('result')
  }, [webcam, calculateScore, fps, challengeType, saveChallengeScore])

  // Registra faces nella history
  useEffect(() => {
    if (phase === 'running' && faces.length > 0) {
      historyRef.current.push([...faces])
    }
  }, [faces, phase])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  if (phase === 'result') {
    return (
      <ScoreCard
        title={title}
        score={score}
        maxScore={10}
        onRetry={() => { setPhase('intro'); setTimeLeft(duration) }}
        onClose={onClose}
      />
    )
  }

  if (phase === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-800 rounded-2xl p-8 max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-400 mb-6">{description}</p>

        <div className="bg-dark-700 rounded-xl p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Istruzioni:</h4>
          <ul className="space-y-2">
            {instructions.map((inst, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="text-accent-cyan mt-0.5">{i + 1}.</span>
                {inst}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Timer size={16} className="text-gray-400" />
          <span className="text-sm text-gray-400">Durata: {duration} secondi</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startChallenge}
          className="w-full py-3 bg-accent-cyan text-black font-medium rounded-xl"
        >
          Inizia Challenge
        </motion.button>
      </motion.div>
    )
  }

  // Running phase
  return (
    <div className="space-y-4">
      {/* Timer bar */}
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Timer size={16} className={timeLeft <= 10 ? 'text-accent-red' : 'text-accent-cyan'} />
          <span className={`text-xl font-mono font-bold ${
            timeLeft <= 10 ? 'text-accent-red' : 'text-accent-cyan'
          }`}>
            {timeLeft}s
          </span>
        </div>
        <button
          onClick={endChallenge}
          className="px-3 py-1 text-sm text-gray-400 bg-dark-600 rounded-lg hover:bg-dark-500"
        >
          Stop
        </button>
      </div>

      {/* Progress bar timer */}
      <div className="h-1 bg-dark-600 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent-cyan rounded-full"
          animate={{ width: `${(timeLeft / duration) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Video */}
      <LiveFeed
        videoRef={webcam.videoRef}
        canvasRef={webcam.canvasRef}
        faces={faces}
        isActive={webcam.isActive}
      >
        {renderOverlay?.(faces, timeLeft)}
      </LiveFeed>
    </div>
  )
}
