import { useState, useEffect, useCallback } from 'react'
import * as api from '../services/api'
import type { SessionStats } from '../types'

export function useAnalytics(autoRefresh = true) {
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [timeline, setTimeline] = useState<unknown[]>([])
  const [confidenceDistribution, setConfidenceDistribution] = useState<unknown[]>([])
  const [heatmap, setHeatmap] = useState<number[][]>([])
  const [recentEvents, setRecentEvents] = useState<unknown[]>([])
  const [challengeScores, setChallengeScores] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [statsData, timelineData, confData, heatData, eventsData, scoresData] = await Promise.all([
        api.getSessionStats(),
        api.getTimeline(),
        api.getConfidenceDistribution(),
        api.getHeatmap(),
        api.getRecentEvents(),
        api.getChallengeScores(),
      ])
      setStats(statsData)
      setTimeline(timelineData as unknown[])
      setConfidenceDistribution(confData as unknown[])
      setHeatmap(heatData as number[][])
      setRecentEvents(eventsData as unknown[])
      setChallengeScores(scoresData as Record<string, unknown>)
    } catch {
      // Silently fail - backend potrebbe non essere avviato
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    refresh()
    const interval = setInterval(refresh, 5000) // Aggiorna ogni 5s
    return () => clearInterval(interval)
  }, [autoRefresh, refresh])

  return {
    stats,
    timeline,
    confidenceDistribution,
    heatmap,
    recentEvents,
    challengeScores,
    loading,
    refresh,
  }
}
