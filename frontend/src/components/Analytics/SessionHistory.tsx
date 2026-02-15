import { formatTime, formatConfidence } from '../../utils/formatters'
import { getConfidenceColor } from '../../utils/canvas'

interface SessionHistoryProps {
  events: unknown[]
}

export default function SessionHistory({ events }: SessionHistoryProps) {
  const typedEvents = events as Array<{
    timestamp: number
    name: string
    confidence: number
    box: number[]
  }>

  if (typedEvents.length === 0) {
    return (
      <div className="bg-dark-800 rounded-xl p-6 text-center">
        <p className="text-gray-500 text-sm">Nessun evento registrato</p>
      </div>
    )
  }

  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-4">
        Ultimi Eventi ({typedEvents.length})
      </h3>
      <div className="overflow-y-auto max-h-64 space-y-1">
        {typedEvents.map((event, i) => (
          <div
            key={`${event.timestamp}-${i}`}
            className="flex items-center gap-3 px-3 py-2 bg-dark-700 rounded-lg text-sm"
          >
            <span className="text-gray-500 font-mono text-xs w-20">
              {formatTime(event.timestamp)}
            </span>
            <span className="text-gray-300 flex-1 truncate">{event.name}</span>
            <span
              className="font-mono text-xs"
              style={{ color: getConfidenceColor(event.confidence) }}
            >
              {formatConfidence(event.confidence)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
