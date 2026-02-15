import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useSocketIO } from '../../hooks/useSocketIO'
import PerformanceMonitor from './PerformanceMonitor'
import ModelInfo from './ModelInfo'
import * as api from '../../services/api'

const PIPELINE_STEPS = [
  { key: 'decode', label: 'Input', desc: 'Base64 Decode', color: '#666' },
  { key: 'preprocess', label: 'Pre-process', desc: 'Resize 640px', color: '#a855f7' },
  { key: 'detection', label: 'Detection', desc: 'HOG Face Detect', color: '#00d9ff' },
  { key: 'encoding', label: 'Encoding', desc: '128-d Embedding', color: '#ffd700' },
  { key: 'recognition', label: 'Recognition', desc: 'Distance Compare', color: '#00ff88' },
]

export default function PipelineViz() {
  const { pipelineTiming } = useSocketIO()
  const [performanceData, setPerformanceData] = useState<Record<string, unknown> | null>(null)
  const [profileCount, setProfileCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [perf, profiles] = await Promise.all([
          api.getPerformance() as Promise<Record<string, unknown>>,
          api.getProfiles(),
        ])
        setPerformanceData(perf)
        setProfileCount(profiles.profiles.length)
      } catch {
        // Backend non disponibile
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
      <h2 className="text-2xl font-bold mb-2">Tech Showcase</h2>
      <p className="text-gray-400 mb-6">Behind the scenes: pipeline, performance e architettura.</p>

      {/* Pipeline Visualization */}
      <div className="bg-dark-800 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-6">Processing Pipeline</h3>

        {/* Pipeline steps */}
        <div className="flex items-center justify-between gap-2 mb-8 overflow-x-auto pb-2">
          {PIPELINE_STEPS.map((step, i) => {
            const timing = (pipelineTiming as Record<string, number>)?.[step.key]
            return (
              <div key={step.key} className="flex items-center gap-2">
                <motion.div
                  className="flex flex-col items-center min-w-[100px]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                >
                  {/* Step box */}
                  <motion.div
                    className="w-24 h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1 relative overflow-hidden"
                    style={{ borderColor: step.color }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {/* Animated fill basato su timing */}
                    {timing && pipelineTiming.total && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 opacity-20"
                        style={{ backgroundColor: step.color }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(timing / (pipelineTiming.total as number)) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                    <span className="text-xs font-medium relative z-10" style={{ color: step.color }}>
                      {step.label}
                    </span>
                    <span className="text-[10px] text-gray-500 relative z-10">{step.desc}</span>
                  </motion.div>

                  {/* Timing */}
                  <motion.span
                    className="text-xs font-mono mt-2"
                    style={{ color: step.color }}
                    key={timing}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    {timing ? `${timing}ms` : '—'}
                  </motion.span>
                </motion.div>

                {/* Arrow */}
                {i < PIPELINE_STEPS.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.15 + 0.1 }}
                  >
                    <ArrowRight size={16} className="text-gray-600" />
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>

        {/* Total timing */}
        {pipelineTiming.total && (
          <div className="flex items-center justify-center gap-3 p-3 bg-dark-700 rounded-lg">
            <span className="text-sm text-gray-400">Total Pipeline:</span>
            <span className="text-lg font-mono font-bold text-accent-cyan">
              {pipelineTiming.total}ms
            </span>
            <span className="text-sm text-gray-500">
              ({Math.round(1000 / (pipelineTiming.total as number))} max FPS)
            </span>
          </div>
        )}
      </div>

      {/* Performance + Model Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceMonitor />
        <ModelInfo
          profileCount={profileCount}
          settings={performanceData?.settings as { threshold: number; show_landmarks: boolean; detect_emotions: boolean } || null}
        />
      </div>
    </motion.div>
  )
}
