import ChallengeRunner from './ChallengeRunner'
import type { FaceData } from '../../types'

interface Props { onClose: () => void }

export default function AngleChallenge({ onClose }: Props) {
  const calculateScore = (history: FaceData[][]) => {
    if (history.length === 0) return 0
    // Score basato su continuità del tracking durante rotazione
    let consecutiveDetections = 0
    let maxConsecutive = 0
    let recognizedFrames = 0

    for (const frame of history) {
      const recognized = frame.filter(f => f.name !== 'Unknown')
      if (recognized.length > 0) {
        consecutiveDetections++
        recognizedFrames++
        maxConsecutive = Math.max(maxConsecutive, consecutiveDetections)
      } else {
        consecutiveDetections = 0
      }
    }

    const continuity = maxConsecutive / Math.max(history.length, 1)
    const recognitionRate = recognizedFrames / Math.max(history.length, 1)

    return Math.min(10, (continuity * 6 + recognitionRate * 4))
  }

  return (
    <ChallengeRunner
      title="Angle Challenge"
      description="Testa la continuità del tracking durante la rotazione della testa."
      instructions={[
        'Guarda dritto verso la camera per 10 secondi',
        'Ruota lentamente la testa a destra (fino a 90 gradi)',
        'Torna al centro',
        'Ruota lentamente la testa a sinistra',
        'Prova anche inclinazioni su/giù',
      ]}
      challengeType="angle"
      duration={60}
      calculateScore={calculateScore}
      onClose={onClose}
    />
  )
}
