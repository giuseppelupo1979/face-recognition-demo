import { useEffect, useState, useCallback, useRef } from 'react'
import { getSocket } from '../services/websocket'
import type { FaceData, FrameResult, EnrollmentFeedback } from '../types'
import type { Socket } from 'socket.io-client'

export function useSocketIO() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [faces, setFaces] = useState<FaceData[]>([])
  const [fps, setFps] = useState(0)
  const [latency, setLatency] = useState(0)
  const [pipelineTiming, setPipelineTiming] = useState<FrameResult['pipeline_timing']>({})
  const [enrollmentFeedback, setEnrollmentFeedback] = useState<EnrollmentFeedback | null>(null)
  const lastResultRef = useRef<FrameResult | null>(null)

  useEffect(() => {
    const s = getSocket()
    setSocket(s)

    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))

    s.on('frame_processed', (data: FrameResult) => {
      setFaces(data.faces)
      setFps(data.fps)
      setLatency(data.latency)
      setPipelineTiming(data.pipeline_timing)
      lastResultRef.current = data
    })

    s.on('enrollment_feedback', (data: EnrollmentFeedback) => {
      setEnrollmentFeedback(data)
    })

    s.on('challenge_result', (data: FrameResult) => {
      setFaces(data.faces)
      setFps(data.fps)
      setLatency(data.latency)
      setPipelineTiming(data.pipeline_timing)
      lastResultRef.current = data
    })

    return () => {
      s.off('connect')
      s.off('disconnect')
      s.off('frame_processed')
      s.off('enrollment_feedback')
      s.off('challenge_result')
    }
  }, [])

  const sendFrame = useCallback((frameData: string) => {
    socket?.emit('video_frame', { frame: frameData })
  }, [socket])

  const sendEnrollmentFrame = useCallback((frameData: string) => {
    socket?.emit('enrollment_frame', { frame: frameData })
  }, [socket])

  const sendChallengeFrame = useCallback((frameData: string, challenge: string) => {
    socket?.emit('challenge_frame', { frame: frameData, challenge })
  }, [socket])

  const updateSettings = useCallback((settings: Record<string, unknown>) => {
    socket?.emit('update_settings', settings)
  }, [socket])

  const saveChallengeScore = useCallback((challenge: string, score: number, details?: Record<string, unknown>) => {
    socket?.emit('save_challenge_score', { challenge, score, details })
  }, [socket])

  return {
    socket,
    connected,
    faces,
    fps,
    latency,
    pipelineTiming,
    enrollmentFeedback,
    lastResult: lastResultRef,
    sendFrame,
    sendEnrollmentFrame,
    sendChallengeFrame,
    updateSettings,
    saveChallengeScore,
  }
}
