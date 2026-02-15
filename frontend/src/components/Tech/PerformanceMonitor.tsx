import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useSocketIO } from '../../hooks/useSocketIO'

export default function PerformanceMonitor() {
  const { fps, latency } = useSocketIO()
  const [fpsHistory, setFpsHistory] = useState<{ time: string; fps: number }[]>([])
  const [latencyHistory, setLatencyHistory] = useState<{ time: string; latency: number }[]>([])

  useEffect(() => {
    const time = new Date().toLocaleTimeString('it-IT', { minute: '2-digit', second: '2-digit' })
    setFpsHistory(prev => [...prev.slice(-30), { time, fps }])
    setLatencyHistory(prev => [...prev.slice(-30), { time, latency }])
  }, [fps, latency])

  return (
    <div className="space-y-4">
      {/* FPS Chart */}
      <div className="bg-dark-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">FPS Timeline</h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={fpsHistory}>
            <XAxis dataKey="time" tick={{ fill: '#666', fontSize: 9 }} />
            <YAxis tick={{ fill: '#666', fontSize: 10 }} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #252b4a', borderRadius: 8 }}
            />
            <Line type="monotone" dataKey="fps" stroke="#00ff88" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Latency Chart */}
      <div className="bg-dark-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Latency Timeline (ms)</h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={latencyHistory}>
            <XAxis dataKey="time" tick={{ fill: '#666', fontSize: 9 }} />
            <YAxis tick={{ fill: '#666', fontSize: 10 }} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #252b4a', borderRadius: 8 }}
            />
            <Line type="monotone" dataKey="latency" stroke="#ffd700" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
