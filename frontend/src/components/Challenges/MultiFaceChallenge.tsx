import ChallengeRunner from './ChallengeRunner'
import type { FaceData } from '../../types'

interface Props { onClose: () => void }

export default function MultiFaceChallenge({ onClose }: Props) {
  const calculateScore = (history: FaceData[][]) => {
    if (history.length === 0) return 0
    // Score basato su quanti volti distinti riconosciuti contemporaneamente
    let maxSimultaneous = 0
    let totalRecognized = 0
    const uniqueNames = new Set<string>()

    for (const frame of history) {
      const recognized = frame.filter(f => f.name !== 'Unknown')
      maxSimultaneous = Math.max(maxSimultaneous, recognized.length)
      totalRecognized += recognized.length
      recognized.forEach(f => uniqueNames.add(f.name))
    }

    const avgRecognized = totalRecognized / Math.max(history.length, 1)
    const uniqueCount = uniqueNames.size

    // Score: bonus per più volti simultanei + accuracy
    return Math.min(10, uniqueCount * 2 + maxSimultaneous * 1.5 + avgRecognized * 1.5)
  }

  return (
    <ChallengeRunner
      title="Multi-Face Challenge"
      description="Testa il riconoscimento simultaneo di più volti nel frame."
      instructions={[
        'Posiziona tutti i profili enrollati davanti alla camera',
        'Il sistema tenterà di riconoscere tutti simultaneamente',
        'Misura accuracy e capacità multi-face',
        'Più persone riconosciute = score migliore',
      ]}
      challengeType="multi-face"
      duration={60}
      calculateScore={calculateScore}
      onClose={onClose}
    />
  )
}
