import ChallengeRunner from './ChallengeRunner'
import type { FaceData } from '../../types'

interface Props { onClose: () => void }

export default function DistanceChallenge({ onClose }: Props) {
  const calculateScore = (history: FaceData[][]) => {
    if (history.length === 0) return 0
    // Score basato sulla varietà di dimensioni face box + recognition
    const faceSizes: number[] = []
    let recognizedFrames = 0

    for (const frame of history) {
      for (const face of frame) {
        faceSizes.push(face.box[2] * face.box[3]) // width * height
        if (face.name !== 'Unknown') recognizedFrames++
      }
    }

    if (faceSizes.length === 0) return 0

    // Varietà di dimensioni (buono se ha testato diverse distanze)
    const minSize = Math.min(...faceSizes)
    const maxSize = Math.max(...faceSizes)
    const sizeVariety = maxSize > 0 ? (maxSize - minSize) / maxSize : 0

    const recognitionRate = recognizedFrames / Math.max(faceSizes.length, 1)

    return Math.min(10, sizeVariety * 5 + recognitionRate * 5)
  }

  return (
    <ChallengeRunner
      title="Distance Challenge"
      description="Testa il riconoscimento a diverse distanze dalla camera."
      instructions={[
        'Inizia a distanza normale (~60cm)',
        'Avvicinati lentamente alla camera',
        'Torna alla distanza iniziale',
        'Allontanati progressivamente (fino a ~2-3m)',
        'Il sistema misura detection range e confidence vs distanza',
      ]}
      challengeType="distance"
      duration={60}
      calculateScore={calculateScore}
      onClose={onClose}
    />
  )
}
