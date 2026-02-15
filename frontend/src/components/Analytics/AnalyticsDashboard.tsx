import { motion } from 'framer-motion'
import { Activity, Clock, Users, TrendingUp, RefreshCw } from 'lucide-react'
import { useAnalytics } from '../../hooks/useAnalytics'
import { formatDuration, formatLatency } from '../../utils/formatters'
import TimelineChart from './TimelineChart'
import ConfidenceChart from './ConfidenceChart'
import SessionHistory from './SessionHistory'
import ExportPanel from './ExportPanel'

export default function AnalyticsDashboard() {
  const { stats, timeline, confidenceDistribution, heatmap, recentEvents, loading, refresh } = useAnalytics()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 bg-dark-800 rounded-lg hover:text-white transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Users size={18} />}
          label="Detections Totali"
          value={stats?.total_detections?.toString() || '0'}
          subtitle={`${stats?.unique_faces || 0} volti unici`}
          color="text-accent-cyan"
        />
        <StatCard
          icon={<Activity size={18} />}
          label="FPS Medio"
          value={stats?.fps?.avg?.toFixed(1) || '0'}
          subtitle={`Min: ${stats?.fps?.min?.toFixed(0) || 0} / Max: ${stats?.fps?.max?.toFixed(0) || 0}`}
          color={
            (stats?.fps?.avg || 0) >= 15
              ? 'text-accent-green'
              : (stats?.fps?.avg || 0) >= 8
              ? 'text-accent-yellow'
              : 'text-accent-red'
          }
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Latenza Media"
          value={formatLatency(stats?.latency?.avg || 0)}
          subtitle={`Sessione: ${formatDuration(stats?.duration || 0)}`}
          color="text-gray-300"
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Confidence Media"
          value={`${((stats?.confidence?.avg || 0) * 100).toFixed(1)}%`}
          subtitle={`Min: ${((stats?.confidence?.min || 0) * 100).toFixed(0)}% / Max: ${((stats?.confidence?.max || 0) * 100).toFixed(0)}%`}
          color="text-accent-green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TimelineChart data={timeline} />
        <ConfidenceChart data={confidenceDistribution} />
      </div>

      {/* Detection Counts + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Detection counts per persona */}
        <div className="bg-dark-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Detections per Persona</h3>
          {stats?.detection_counts && Object.keys(stats.detection_counts).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.detection_counts)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => {
                  const maxCount = Math.max(...Object.values(stats.detection_counts))
                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">{name}</span>
                        <span className="font-mono text-gray-400">{count}</span>
                      </div>
                      <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-accent-cyan rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">Nessun dato</p>
          )}
        </div>

        {/* Heatmap */}
        <div className="bg-dark-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Heatmap Posizioni</h3>
          {heatmap.length > 0 ? (
            <div className="aspect-video bg-dark-700 rounded-lg overflow-hidden p-2">
              <div className="grid grid-cols-10 grid-rows-10 gap-0.5 h-full">
                {heatmap.flat().map((value, i) => {
                  const maxVal = Math.max(...heatmap.flat(), 1)
                  const intensity = value / maxVal
                  return (
                    <div
                      key={i}
                      className="rounded-sm"
                      style={{
                        backgroundColor: `rgba(0, 217, 255, ${intensity * 0.8})`,
                      }}
                    />
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-dark-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 text-sm">Nessun dato</p>
            </div>
          )}
        </div>

        {/* Export */}
        <div className="space-y-4">
          <ExportPanel />
          <SessionHistory events={recentEvents} />
        </div>
      </div>
    </motion.div>
  )
}

function StatCard({ icon, label, value, subtitle, color }: {
  icon: React.ReactNode; label: string; value: string; subtitle: string; color: string
}) {
  return (
    <motion.div
      className="bg-dark-800 rounded-xl p-4"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-500">{icon}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className={`text-2xl font-mono font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </motion.div>
  )
}
