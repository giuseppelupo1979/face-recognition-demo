import ChallengeRunner from './ChallengeRunner'
import type { FaceData } from '../../types'

interface Props { onClose: () => void }

export default function OcclusionChallenge({ onClose }: Props) {
  const calculateScore = (history: FaceData[][]) => {
    if (history.length === 0) return 0
    // Score basato su % di riconoscimento anche con occlusioni
    const framesWithRecognition = history.filter(h =>
      h.some(f => f.name !== 'Unknown' && f.confidence > 0.5)
    )
    const rate = framesWithRecognition.length / history.length
    const avgConf = framesWithRecognition.reduce((sum, h) => {
      return sum + Math.max(...h.map(f => f.confidence), 0)
    }, 0) / Math.max(framesWithRecognition.length, 1)

    return Math.min(10, rate * 6 + avgConf * 4)
  }

  return (
    <ChallengeRunner
      title="Occlusion Challenge"
      description="Testa la robustezza del riconoscimento con occlusioni parziali del volto."
      instructions={[
        'Inizia senza occlusioni (baseline)',
        'Copri parzialmente il volto con una mano',
        'Prova con occhiali da sole (se disponibili)',
        'Prova con una mascherina o sciarpa',
        'Prova con un cappello',
      ]}
      challengeType="occlusion"
      duration={60}
      calculateScore={calculateScore}
      onClose={onClose}
    />
  )
}
