import ChallengeRunner from './ChallengeRunner'
import type { FaceData } from '../../types'

interface Props { onClose: () => void }

export default function LightingChallenge({ onClose }: Props) {
  const calculateScore = (history: FaceData[][]) => {
    if (history.length === 0) return 0
    // Score basato su quanti frame hanno detection con confidence buona
    const framesWithFace = history.filter(h => h.length > 0)
    const avgConfidence = framesWithFace.reduce((sum, h) => {
      const maxConf = Math.max(...h.map(f => f.confidence), 0)
      return sum + maxConf
    }, 0) / Math.max(framesWithFace.length, 1)

    const detectionRate = framesWithFace.length / history.length
    return Math.min(10, (detectionRate * 5 + avgConfidence * 5))
  }

  return (
    <ChallengeRunner
      title="Lighting Challenge"
      description="Testa come il sistema gestisce diverse condizioni di illuminazione."
      instructions={[
        'Inizia con la luce normale',
        'Copri/scopri la fonte di luce principale',
        'Prova con luce laterale (es. lampada da un lato)',
        'Prova in controluce',
        'Il sistema misurerà la robustezza del riconoscimento',
      ]}
      challengeType="lighting"
      duration={60}
      calculateScore={calculateScore}
      onClose={onClose}
    />
  )
}
