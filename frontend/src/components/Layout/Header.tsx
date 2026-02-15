import { motion } from 'framer-motion'
import { Activity, Wifi, WifiOff, Clock } from 'lucide-react'
import { formatLatency } from '../../utils/formatters'

interface HeaderProps {
  fps: number
  latency: number
  connected: boolean
  faceCount: number
}

export default function Header({ fps, latency, connected, faceCount }: HeaderProps) {
  return (
    <header className="h-14 bg-dark-800 border-b border-dark-600 flex items-center justify-between px-6">
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">
          <span className="text-accent-cyan">Face</span> Recognition Demo
        </h1>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-5">
        {/* Faces detected */}
        <div className="flex items-center gap-2 text-sm">
          <Activity size={14} className="text-accent-green" />
          <span className="text-gray-400">Faces:</span>
          <motion.span
            key={faceCount}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="font-mono font-medium text-white"
          >
            {faceCount}
          </motion.span>
        </div>

        {/* FPS */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">FPS:</span>
          <span className={`font-mono font-medium ${
            fps >= 15 ? 'text-accent-green' : fps >= 8 ? 'text-accent-yellow' : 'text-accent-red'
          }`}>
            {fps.toFixed(0)}
          </span>
        </div>

        {/* Latency */}
        <div className="flex items-center gap-2 text-sm">
          <Clock size={14} className="text-gray-400" />
          <span className="font-mono text-gray-300">{formatLatency(latency)}</span>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {connected ? (
            <motion.div
              className="flex items-center gap-1.5 text-accent-green text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Wifi size={14} />
              <span>Connected</span>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center gap-1.5 text-accent-red text-sm"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <WifiOff size={14} />
              <span>Disconnected</span>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  )
}
