import { motion } from 'framer-motion'
import { Activity, Clock, Zap, Users } from 'lucide-react'
import type { FaceData, PipelineTiming } from '../../types'
import ConfidenceBar from './ConfidenceBar'
import { formatLatency } from '../../utils/formatters'

interface StatsPanelProps {
  faces: FaceData[]
  fps: number
  latency: number
  pipelineTiming: PipelineTiming
}

export default function StatsPanel({ faces, fps, latency, pipelineTiming }: StatsPanelProps) {
  const recognizedFaces = faces.filter(f => f.name !== 'Unknown')
  const unknownFaces = faces.filter(f => f.name === 'Unknown')

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Users size={16} />}
          label="Detected"
          value={faces.length.toString()}
          color="text-accent-cyan"
        />
        <StatCard
          icon={<Activity size={16} />}
          label="FPS"
          value={fps.toFixed(0)}
          color={fps >= 15 ? 'text-accent-green' : fps >= 8 ? 'text-accent-yellow' : 'text-accent-red'}
        />
        <StatCard
          icon={<Clock size={16} />}
          label="Latency"
          value={formatLatency(latency)}
          color="text-gray-300"
        />
        <StatCard
          icon={<Zap size={16} />}
          label="Recognized"
          value={recognizedFaces.length.toString()}
          color="text-accent-green"
        />
      </div>

      {/* Confidence Bars */}
      {faces.length > 0 && (
        <div className="bg-dark-800 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Confidence Levels</h3>
          {faces.map((face, idx) => (
            <ConfidenceBar
              key={`${face.name}-${idx}`}
              name={face.name}
              confidence={face.confidence}
              color={face.color}
            />
          ))}
        </div>
      )}

      {/* Pipeline Timing */}
      {pipelineTiming.total && (
        <div className="bg-dark-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Pipeline Timing</h3>
          <div className="space-y-2">
            {Object.entries(pipelineTiming).filter(([k]) => k !== 'total').map(([step, ms]) => (
              <div key={step} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-20 capitalize">{step}</span>
                <div className="flex-1 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent-cyan/60 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((ms as number) / (pipelineTiming.total || 1)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-400 w-12 text-right">{ms}ms</span>
              </div>
            ))}
            <div className="border-t border-dark-600 pt-2 mt-2 flex justify-between">
              <span className="text-xs text-gray-400">Total</span>
              <span className="text-xs font-mono text-accent-cyan">{pipelineTiming.total}ms</span>
            </div>
          </div>
        </div>
      )}

      {/* No faces message */}
      {faces.length === 0 && (
        <div className="bg-dark-800 rounded-xl p-6 text-center">
          <p className="text-gray-500 text-sm">Nessun volto rilevato</p>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: string
}) {
  return (
    <div className="bg-dark-800 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-500">{icon}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <span className={`text-xl font-mono font-bold ${color}`}>{value}</span>
    </div>
  )
}
