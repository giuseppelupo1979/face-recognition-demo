import ChallengeRunner from './ChallengeRunner'
import type { FaceData } from '../../types'

interface Props { onClose: () => void }

export default function SpeedChallenge({ onClose }: Props) {
  const calculateScore = (history: FaceData[][]) => {
    if (history.length === 0) return 0
    // Score basato su stabilità tracking con movimenti rapidi
    let transitions = 0
    let stableFrames = 0

    for (let i = 1; i < history.length; i++) {
      const prevNames = new Set(history[i - 1].map(f => f.name))
      const currNames = new Set(history[i].map(f => f.name))

      // Frame stabile = stessi volti riconosciuti
      const intersection = [...currNames].filter(n => prevNames.has(n) && n !== 'Unknown')
      if (intersection.length > 0) stableFrames++

      // Conta transizioni (false positives)
      if (history[i].some(f => f.name !== 'Unknown') !== history[i - 1].some(f => f.name !== 'Unknown')) {
        transitions++
      }
    }

    const stability = stableFrames / Math.max(history.length - 1, 1)
    const lowTransitions = 1 - Math.min(transitions / Math.max(history.length * 0.3, 1), 1)

    return Math.min(10, stability * 6 + lowTransitions * 4)
  }

  return (
    <ChallengeRunner
      title="Speed Challenge"
      description="Testa la stabilità del tracking con movimenti rapidi."
      instructions={[
        'Muovi la testa rapidamente da un lato all\'altro',
        'Entra e esci dal frame rapidamente',
        'Fai movimenti imprevedibili',
        'Il sistema misura stabilità e false positives',
      ]}
      challengeType="speed"
      duration={60}
      calculateScore={calculateScore}
      onClose={onClose}
    />
  )
}
