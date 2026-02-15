import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import LiveFeed from '../Webcam/LiveFeed'
import CameraControls from '../Webcam/CameraControls'
import StatsPanel from './StatsPanel'
import { useFaceDetection } from '../../hooks/useFaceDetection'

export default function LiveRecognition() {
  const {
    videoRef, canvasRef, isActive, error, faces, fps, latency, pipelineTiming,
    isStreaming, settings,
    startCamera, stopCamera, startStreaming, stopStreaming,
    captureFrame, updateSetting, takeScreenshot,
  } = useFaceDetection()

  // Auto-start streaming quando camera è attiva
  useEffect(() => {
    if (isActive && !isStreaming) {
      startStreaming()
    }
  }, [isActive, isStreaming, startStreaming])

  const handleScreenshot = useCallback(() => {
    const dataUrl = takeScreenshot()
    if (dataUrl) {
      const link = document.createElement('a')
      link.download = `face-recognition-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    }
  }, [takeScreenshot])

  const handleStopCamera = useCallback(() => {
    stopStreaming()
    stopCamera()
  }, [stopStreaming, stopCamera])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">Live Recognition Arena</h2>
        {isStreaming && (
          <motion.div
            className="flex items-center gap-2 px-3 py-1 bg-accent-red/20 rounded-full"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <div className="w-2 h-2 bg-accent-red rounded-full" />
            <span className="text-xs text-accent-red font-medium">LIVE</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Feed - 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          <LiveFeed
            videoRef={videoRef}
            canvasRef={canvasRef}
            faces={faces}
            isActive={isActive}
            showLandmarks={settings.showLandmarks}
            error={error}
          />

          <CameraControls
            isActive={isActive}
            isStreaming={isStreaming}
            showLandmarks={settings.showLandmarks}
            threshold={settings.threshold}
            onStartCamera={startCamera}
            onStopCamera={handleStopCamera}
            onStartStreaming={startStreaming}
            onStopStreaming={stopStreaming}
            onToggleLandmarks={() => updateSetting('showLandmarks', !settings.showLandmarks)}
            onThresholdChange={(v) => updateSetting('threshold', v)}
            onScreenshot={handleScreenshot}
          />
        </div>

        {/* Stats Panel - 1/3 */}
        <div className="lg:col-span-1">
          <StatsPanel
            faces={faces}
            fps={fps}
            latency={latency}
            pipelineTiming={pipelineTiming}
          />
        </div>
      </div>
    </motion.div>
  )
}
