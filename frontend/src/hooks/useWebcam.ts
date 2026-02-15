import { useRef, useState, useCallback, useEffect } from 'react'

interface UseWebcamOptions {
  width?: number
  height?: number
  facingMode?: string
}

export function useWebcam(options: UseWebcamOptions = {}) {
  const { width = 640, height = 480, facingMode = 'user' } = options
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width, height, facingMode },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setIsActive(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore accesso webcam'
      setError(msg)
      setIsActive(false)
    }
  }, [width, height, facingMode])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsActive(false)
  }, [])

  const captureFrame = useCallback((quality = 0.8): string | null => {
    if (!canvasRef.current || !videoRef.current || !isActive) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(video, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg', quality)
  }, [isActive, width, height])

  const takeScreenshot = useCallback((): string | null => {
    return captureFrame(0.95)
  }, [captureFrame])

  // Cleanup quando si smonta il componente
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return {
    videoRef,
    canvasRef,
    isActive,
    error,
    startCamera,
    stopCamera,
    captureFrame,
    takeScreenshot,
  }
}
