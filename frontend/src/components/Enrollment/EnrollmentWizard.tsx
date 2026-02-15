import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, ArrowRight, ArrowLeft, Check, X } from 'lucide-react'
import CaptureStep from './CaptureStep'
import ProfileList from './ProfileList'
import * as api from '../../services/api'
import { PROFILE_COLORS } from '../../utils/formatters'

type WizardPhase = 'idle' | 'setup' | 'capturing' | 'complete'

const STEPS = [
  { key: 'front', label: 'Frontale', instruction: 'Guarda dritto verso la camera', required: 5 },
  { key: 'right', label: 'Profilo Destro', instruction: 'Ruota leggermente la testa a destra', required: 5 },
  { key: 'left', label: 'Profilo Sinistro', instruction: 'Ruota leggermente la testa a sinistra', required: 5 },
  { key: 'up', label: 'Dall\'alto', instruction: 'Alza leggermente il mento', required: 3 },
  { key: 'down', label: 'Dal basso', instruction: 'Abbassa leggermente il mento', required: 3 },
]

export default function EnrollmentWizard() {
  const [phase, setPhase] = useState<WizardPhase>('idle')
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(PROFILE_COLORS[0])
  const [currentStep, setCurrentStep] = useState(0)
  const [totalCaptured, setTotalCaptured] = useState(0)
  const totalRequired = STEPS.reduce((sum, s) => sum + s.required, 0)
  const [error, setError] = useState<string | null>(null)

  const handleStartSetup = () => {
    setPhase('setup')
    setName('')
    setSelectedColor(PROFILE_COLORS[0])
    setError(null)
  }

  const handleBeginCapture = async () => {
    if (!name.trim()) {
      setError('Inserisci un nome')
      return
    }
    try {
      const result = await api.startEnrollment(name.trim(), selectedColor) as { error?: string }
      if (result.error) {
        setError(result.error)
        return
      }
      setPhase('capturing')
      setCurrentStep(0)
      setTotalCaptured(0)
      setError(null)
    } catch (e) {
      setError('Errore connessione al server')
    }
  }

  const handleStepComplete = useCallback((result: { total_progress?: number }) => {
    setTotalCaptured(result.total_progress || totalCaptured)
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }, [currentStep, totalCaptured])

  const handleSkipStep = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }, [currentStep])

  const handleComplete = async () => {
    try {
      const result = await api.completeEnrollment() as { error?: string }
      if (result.error) {
        setError(result.error)
        return
      }
      setPhase('complete')
    } catch {
      setError('Errore completamento enrollment')
    }
  }

  const handleCancel = async () => {
    try {
      await api.cancelEnrollment()
    } catch {
      // Ignore
    }
    setPhase('idle')
    setCurrentStep(0)
    setTotalCaptured(0)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
      <h2 className="text-2xl font-bold mb-6">Face Enrollment</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Idle - Start button */}
            {phase === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-dark-800 rounded-2xl p-8 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-cyan/10 border-2 border-dashed border-accent-cyan/30 flex items-center justify-center">
                  <UserPlus size={32} className="text-accent-cyan" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nuovo Profilo</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Enroll un nuovo volto catturando diverse pose. Il sistema apprenderà
                  a riconoscere il volto da varie angolazioni.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartSetup}
                  className="px-6 py-3 bg-accent-cyan text-black font-medium rounded-xl inline-flex items-center gap-2"
                >
                  <UserPlus size={18} />
                  Inizia Enrollment
                </motion.button>
              </motion.div>
            )}

            {/* Setup - Name + Color */}
            {phase === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-dark-800 rounded-2xl p-8"
              >
                <h3 className="text-xl font-semibold mb-6">Configurazione Profilo</h3>

                {/* Nome */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-2">Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Es. Giuseppe"
                    className="w-full px-4 py-3 bg-dark-700 border border-dark-500 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan transition-colors"
                    maxLength={30}
                    autoFocus
                  />
                </div>

                {/* Colore */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-2">Colore Label</label>
                  <div className="flex gap-3">
                    {PROFILE_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? 'border-white scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-accent-red text-sm mb-4">{error}</p>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setPhase('idle')}
                    className="px-4 py-3 bg-dark-600 text-gray-300 rounded-xl hover:bg-dark-500 transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleBeginCapture}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent-cyan text-black font-medium rounded-xl"
                  >
                    Inizia Cattura
                    <ArrowRight size={18} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Capturing */}
            {phase === 'capturing' && (
              <motion.div
                key={`capture-${currentStep}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="bg-dark-800 rounded-2xl p-6"
              >
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-4">
                  {STEPS.map((s, i) => (
                    <div
                      key={s.key}
                      className={`flex-1 h-1.5 rounded-full transition-colors ${
                        i < currentStep
                          ? 'bg-accent-green'
                          : i === currentStep
                          ? 'bg-accent-cyan'
                          : 'bg-dark-600'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500">
                    Step {currentStep + 1}/{STEPS.length}
                  </span>
                  <span className="text-xs text-gray-500">
                    Totale: {totalCaptured}/{totalRequired}
                  </span>
                  <button
                    onClick={handleCancel}
                    className="text-gray-500 hover:text-accent-red transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <CaptureStep
                  step={STEPS[currentStep].key}
                  stepLabel={STEPS[currentStep].label}
                  instruction={STEPS[currentStep].instruction}
                  required={STEPS[currentStep].required}
                  onComplete={handleStepComplete}
                  onSkip={handleSkipStep}
                />
              </motion.div>
            )}

            {/* Complete */}
            {phase === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-dark-800 rounded-2xl p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-green/20 flex items-center justify-center"
                >
                  <Check size={40} className="text-accent-green" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">Enrollment Completato!</h3>
                <p className="text-gray-400 mb-2">
                  Profilo <span className="font-medium" style={{ color: selectedColor }}>{name}</span> creato con successo.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  {totalCaptured} samples catturati. Il volto sarà ora riconosciuto nella Live Recognition.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPhase('idle')}
                  className="px-6 py-3 bg-accent-cyan text-black font-medium rounded-xl"
                >
                  Torna alla lista
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar - Profile list */}
        <div className="lg:col-span-1">
          <ProfileList />
        </div>
      </div>
    </motion.div>
  )
}
