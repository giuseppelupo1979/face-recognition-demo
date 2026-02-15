import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface TimelineChartProps {
  data: unknown[]
}

const COLORS = ['#00d9ff', '#00ff88', '#ffd700', '#ff4444', '#a855f7', '#ff8c00']

export default function TimelineChart({ data }: TimelineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-dark-800 rounded-xl p-6 text-center">
        <p className="text-gray-500 text-sm">Nessun dato timeline disponibile</p>
      </div>
    )
  }

  // Estrai nomi unici dalle chiavi dei dati
  const allKeys = new Set<string>()
  for (const entry of data as Record<string, unknown>[]) {
    Object.keys(entry).filter(k => k !== 'timestamp').forEach(k => allKeys.add(k))
  }
  const names = Array.from(allKeys)

  // Formatta timestamp
  const formattedData = (data as Record<string, unknown>[]).map(d => ({
    ...d,
    time: new Date((d.timestamp as number) * 1000).toLocaleTimeString('it-IT', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }),
  }))

  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Detection Timeline</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={formattedData}>
          <XAxis dataKey="time" tick={{ fill: '#666', fontSize: 10 }} />
          <YAxis tick={{ fill: '#666', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #252b4a', borderRadius: 8 }}
            labelStyle={{ color: '#999' }}
          />
          <Legend />
          {names.map((name, i) => (
            <Bar
              key={name}
              dataKey={name}
              stackId="a"
              fill={COLORS[i % COLORS.length]}
              radius={i === names.length - 1 ? [4, 4, 0, 0] : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
