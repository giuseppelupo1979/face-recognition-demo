import { motion } from 'framer-motion'
import { Cpu, Database, Layers, Gauge } from 'lucide-react'

interface ModelInfoProps {
  profileCount: number
  settings: {
    threshold: number
    show_landmarks: boolean
    detect_emotions: boolean
  } | null
}

export default function ModelInfo({ profileCount, settings }: ModelInfoProps) {
  const infoItems = [
    {
      icon: <Cpu size={18} />,
      label: 'Detection Model',
      value: 'dlib HOG + Linear SVM',
      detail: 'Histogram of Oriented Gradients',
    },
    {
      icon: <Layers size={18} />,
      label: 'Embedding Size',
      value: '128-dimensional vector',
      detail: 'Generato da deep metric learning model',
    },
    {
      icon: <Database size={18} />,
      label: 'Profili Enrollati',
      value: `${profileCount} profili`,
      detail: 'Fino a 4 profili supportati',
    },
    {
      icon: <Gauge size={18} />,
      label: 'Threshold',
      value: settings ? `${(settings.threshold * 100).toFixed(0)}% distanza` : 'N/A',
      detail: 'Soglia distanza euclidea per match',
    },
  ]

  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Model Information</h3>
      <div className="space-y-4">
        {infoItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className="text-accent-cyan mt-0.5">{item.icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-300">{item.label}</p>
              <p className="text-sm text-accent-cyan font-mono">{item.value}</p>
              <p className="text-xs text-gray-500">{item.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Algoritmo explanation */}
      <div className="mt-6 p-3 bg-dark-700 rounded-lg">
        <h4 className="text-xs font-medium text-gray-400 mb-2">Come funziona</h4>
        <p className="text-xs text-gray-500 leading-relaxed">
          Il sistema usa la libreria <code className="text-accent-cyan">face_recognition</code> basata
          su <code className="text-accent-cyan">dlib</code>. I volti vengono prima rilevati con HOG,
          poi allineati usando 68 face landmarks, e infine convertiti in embedding 128-dimensionali
          tramite una deep neural network pre-trained. Il riconoscimento avviene confrontando
          la distanza euclidea tra embeddings.
        </p>
      </div>
    </div>
  )
}
