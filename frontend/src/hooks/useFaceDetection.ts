import { useEffect, useRef, useState, useCallback } from 'react'
import { useWebcam } from './useWebcam'
import { useSocketIO } from './useSocketIO'
import type { AppSettings } from '../types'

export function useFaceDetection() {
  const webcam = useWebcam()
  const socketIO = useSocketIO()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [settings, setSettings] = useState<AppSettings>({
    showLandmarks: false,
    detectEmotions: false,
    threshold: 75,
    isStreaming: false,
  })

  const startStreaming = useCallback(() => {
    if (!webcam.isActive || intervalRef.current) return

    intervalRef.current = setInterval(() => {
      const frame = webcam.captureFrame(0.7)
      if (frame) {
        socketIO.sendFrame(frame)
      }
    }, 100) // ~10 FPS send rate

    setIsStreaming(true)
  }, [webcam, socketIO])

  const stopStreaming = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsStreaming(false)
  }, [])

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      socketIO.updateSettings({
        show_landmarks: next.showLandmarks,
        detect_emotions: next.detectEmotions,
        threshold: next.threshold,
      })
      return next
    })
  }, [socketIO])

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    ...webcam,
    ...socketIO,
    isStreaming,
    settings,
    startStreaming,
    stopStreaming,
    updateSetting,
  }
}
