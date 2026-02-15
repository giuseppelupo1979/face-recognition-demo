const API_BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Errore sconosciuto' }))
    throw new Error(err.error || `HTTP ${response.status}`)
  }
  return response.json()
}

// Profiles
export const getProfiles = () => request<{ profiles: import('../types').Profile[]; max_profiles: number }>('/profiles')

// Enrollment
export const startEnrollment = (name: string, color: string) =>
  request('/enrollment/start', {
    method: 'POST',
    body: JSON.stringify({ name, color }),
  })

export const captureEnrollment = (frame: string, step: string) =>
  request<import('../types').EnrollmentResult>('/enrollment/capture', {
    method: 'POST',
    body: JSON.stringify({ frame, step }),
  })

export const completeEnrollment = () =>
  request('/enrollment/complete', { method: 'POST' })

export const cancelEnrollment = () =>
  request('/enrollment/cancel', { method: 'POST' })

export const getEnrollmentStatus = () =>
  request<import('../types').EnrollmentStatus>('/enrollment/status')

export const deleteProfile = (id: string) =>
  request(`/enrollment/profile/${id}`, { method: 'DELETE' })

// Analytics
export const getSessionStats = () =>
  request<import('../types').SessionStats>('/analytics/session')

export const getTimeline = (seconds = 600) =>
  request(`/analytics/timeline?seconds=${seconds}`)

export const getConfidenceDistribution = () =>
  request('/analytics/confidence')

export const getHeatmap = () =>
  request('/analytics/heatmap')

export const getRecentEvents = (limit = 50) =>
  request(`/analytics/events?limit=${limit}`)

export const getChallengeScores = () =>
  request('/analytics/challenges')

export const exportJson = () =>
  request('/analytics/export/json')

export const exportCsv = async () => {
  const response = await fetch(`${API_BASE}/analytics/export/csv`)
  return response.text()
}

// Performance
export const getPerformance = () =>
  request('/performance')

// Health
export const healthCheck = () =>
  fetch('/health').then(r => r.json())
