import { motion } from 'framer-motion'
import {
  Video, VideoOff, Camera, Download, Eye, EyeOff, Sliders,
} from 'lucide-react'

interface CameraControlsProps {
  isActive: boolean
  isStreaming: boolean
  showLandmarks: boolean
  threshold: number
  onStartCamera: () => void
  onStopCamera: () => void
  onStartStreaming: () => void
  onStopStreaming: () => void
  onToggleLandmarks: () => void
  onThresholdChange: (value: number) => void
  onScreenshot?: () => void
}

export default function CameraControls({
  isActive, isStreaming, showLandmarks, threshold,
  onStartCamera, onStopCamera, onStartStreaming, onStopStreaming,
  onToggleLandmarks, onThresholdChange, onScreenshot,
}: CameraControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-dark-800 rounded-xl">
      {/* Camera toggle */}
      {!isActive ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartCamera}
          className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-black font-medium rounded-lg hover:bg-accent-cyan/90 transition-colors"
        >
          <Video size={18} />
          Start Camera
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStopCamera}
          className="flex items-center gap-2 px-4 py-2 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors"
        >
          <VideoOff size={18} />
          Stop Camera
        </motion.button>
      )}

      {/* Stream toggle */}
      {isActive && (
        !isStreaming ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartStreaming}
            className="flex items-center gap-2 px-4 py-2 bg-accent-green text-black font-medium rounded-lg"
          >
            <Video size={18} />
            Start Detection
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStopStreaming}
            className="flex items-center gap-2 px-4 py-2 bg-accent-red/20 text-accent-red rounded-lg border border-accent-red/30"
          >
            <VideoOff size={18} />
            Stop Detection
          </motion.button>
        )
      )}

      {/* Separator */}
      <div className="w-px h-8 bg-dark-600" />

      {/* Landmarks toggle */}
      <button
        onClick={onToggleLandmarks}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          showLandmarks
            ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
            : 'bg-dark-600 text-gray-400 hover:text-white'
        }`}
      >
        {showLandmarks ? <Eye size={18} /> : <EyeOff size={18} />}
        <span className="text-sm">Landmarks</span>
      </button>

      {/* Screenshot */}
      {onScreenshot && isActive && (
        <button
          onClick={onScreenshot}
          className="flex items-center gap-2 px-3 py-2 bg-dark-600 text-gray-400 hover:text-white rounded-lg transition-colors"
        >
          <Camera size={18} />
          <span className="text-sm">Screenshot</span>
        </button>
      )}

      {/* Threshold slider */}
      <div className="flex items-center gap-3 ml-auto">
        <Sliders size={16} className="text-gray-400" />
        <span className="text-sm text-gray-400">Threshold:</span>
        <input
          type="range"
          min={50}
          max={99}
          value={threshold}
          onChange={(e) => onThresholdChange(Number(e.target.value))}
          className="w-24 accent-accent-cyan"
        />
        <span className="text-sm font-mono text-accent-cyan w-10">{threshold}%</span>
      </div>
    </div>
  )
}
