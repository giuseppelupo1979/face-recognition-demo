import type { FaceData } from '../types'

/**
 * Disegna overlay detection su canvas sopra il video.
 * Utilizzato come fallback se non si usa il DOM overlay.
 */
export function drawDetectionOverlay(
  ctx: CanvasRenderingContext2D,
  faces: FaceData[],
  videoWidth: number,
  videoHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  showLandmarks = false,
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  const scaleX = canvasWidth / videoWidth
  const scaleY = canvasHeight / videoHeight

  for (const face of faces) {
    const [x, y, w, h] = face.box
    const sx = x * scaleX
    const sy = y * scaleY
    const sw = w * scaleX
    const sh = h * scaleY

    // Bounding box
    ctx.strokeStyle = face.color
    ctx.lineWidth = 2
    ctx.strokeRect(sx, sy, sw, sh)

    // Corner accents
    const cornerLen = 15
    ctx.lineWidth = 3
    ctx.strokeStyle = face.color

    // Top-left
    ctx.beginPath()
    ctx.moveTo(sx, sy + cornerLen)
    ctx.lineTo(sx, sy)
    ctx.lineTo(sx + cornerLen, sy)
    ctx.stroke()

    // Top-right
    ctx.beginPath()
    ctx.moveTo(sx + sw - cornerLen, sy)
    ctx.lineTo(sx + sw, sy)
    ctx.lineTo(sx + sw, sy + cornerLen)
    ctx.stroke()

    // Bottom-left
    ctx.beginPath()
    ctx.moveTo(sx, sy + sh - cornerLen)
    ctx.lineTo(sx, sy + sh)
    ctx.lineTo(sx + cornerLen, sy + sh)
    ctx.stroke()

    // Bottom-right
    ctx.beginPath()
    ctx.moveTo(sx + sw - cornerLen, sy + sh)
    ctx.lineTo(sx + sw, sy + sh)
    ctx.lineTo(sx + sw, sy + sh - cornerLen)
    ctx.stroke()

    // Label background
    const label = `${face.name} ${(face.confidence * 100).toFixed(1)}%`
    ctx.font = '14px Inter, sans-serif'
    const labelWidth = ctx.measureText(label).width + 16
    ctx.fillStyle = face.color
    ctx.fillRect(sx, sy - 28, labelWidth, 24)

    // Label text
    ctx.fillStyle = '#000000'
    ctx.fillText(label, sx + 8, sy - 10)

    // Landmarks
    if (showLandmarks && face.landmarks) {
      ctx.fillStyle = face.color
      for (const [, points] of Object.entries(face.landmarks)) {
        for (const [px, py] of points as [number, number][]) {
          ctx.beginPath()
          ctx.arc(px * scaleX, py * scaleY, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }
}

/**
 * Colore confidence: verde >90%, giallo 70-90%, rosso <70%
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return '#00ff88'
  if (confidence >= 0.7) return '#ffd700'
  return '#ff4444'
}

/**
 * Scarica canvas come immagine PNG.
 */
export function downloadCanvasAsImage(canvas: HTMLCanvasElement, filename = 'screenshot.png') {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}
