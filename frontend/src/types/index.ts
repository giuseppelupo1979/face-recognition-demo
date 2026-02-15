export interface FaceData {
  box: number[] // [x, y, width, height]
  name: string
  confidence: number
  color: string
  profile_id: string | null
  emotion?: string
  landmarks?: Record<string, [number, number][]>
}

export interface FrameResult {
  faces: FaceData[]
  fps: number
  latency: number
  timestamp: number
  face_count: number
  pipeline_timing: PipelineTiming
  challenge?: string
}

export interface PipelineTiming {
  decode?: number
  preprocess?: number
  detection?: number
  encoding?: number
  recognition?: number
  landmarks?: number
  total?: number
}

export interface Profile {
  id: string
  name: string
  color: string
  samples_count: number
  created_at: number
  thumbnail: string | null
}

export interface EnrollmentStatus {
  active: boolean
  id?: string
  name?: string
  progress?: Record<string, { captured: number; required: number }>
  total_captured?: number
  total_required?: number
}

export interface EnrollmentResult {
  status: string
  step?: string
  step_progress?: number
  step_required?: number
  total_progress?: number
  total_required?: number
  thumbnail?: string | null
  error?: string
}

export interface QualityFeedback {
  is_good: boolean
  brightness?: string
  blur?: string
  size?: string
  centered?: string
  message: string
}

export interface EnrollmentFeedback {
  quality: QualityFeedback
  face_count?: number
  face_box?: number[]
}

export interface SessionStats {
  session_id: string
  duration: number
  total_detections: number
  unique_faces: number
  detection_counts: Record<string, number>
  fps: {
    current: number
    avg: number
    min: number
    max: number
  }
  latency: {
    avg: number
  }
  confidence: {
    avg: number
    min: number
    max: number
  }
}

export interface ChallengeScore {
  score: number
  max_score: number
  timestamp: number
  details: Record<string, unknown>
}

export type ChallengeType =
  | 'lighting'
  | 'angle'
  | 'occlusion'
  | 'distance'
  | 'speed'
  | 'multi-face'

export interface AppSettings {
  showLandmarks: boolean
  detectEmotions: boolean
  threshold: number
  isStreaming: boolean
}
