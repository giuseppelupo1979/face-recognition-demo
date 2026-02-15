import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ConfidenceChartProps {
  data: unknown[]
}

export default function ConfidenceChart({ data }: ConfidenceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-dark-800 rounded-xl p-6 text-center">
        <p className="text-gray-500 text-sm">Nessun dato confidence disponibile</p>
      </div>
    )
  }

  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Confidence Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data as Record<string, unknown>[]}>
          <XAxis
            dataKey="range"
            tick={{ fill: '#666', fontSize: 9 }}
            interval={1}
          />
          <YAxis tick={{ fill: '#666', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #252b4a', borderRadius: 8 }}
          />
          <Bar dataKey="count" fill="#00d9ff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
