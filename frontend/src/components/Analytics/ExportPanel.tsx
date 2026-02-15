import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileJson, FileSpreadsheet } from 'lucide-react'
import * as api from '../../services/api'

export default function ExportPanel() {
  const [exporting, setExporting] = useState(false)

  const handleExportJson = async () => {
    setExporting(true)
    try {
      const data = await api.exportJson()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `face-recognition-session-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Errore export JSON')
    }
    setExporting(false)
  }

  const handleExportCsv = async () => {
    setExporting(true)
    try {
      const csv = await api.exportCsv()
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `face-recognition-events-${Date.now()}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Errore export CSV')
    }
    setExporting(false)
  }

  return (
    <div className="bg-dark-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-4">
        <Download size={14} className="inline mr-2" />
        Export Dati
      </h3>
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportJson}
          disabled={exporting}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-dark-700 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-dark-600 transition-colors"
        >
          <FileJson size={16} className="text-accent-cyan" />
          Export JSON
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportCsv}
          disabled={exporting}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-dark-700 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-dark-600 transition-colors"
        >
          <FileSpreadsheet size={16} className="text-accent-green" />
          Export CSV
        </motion.button>
      </div>
    </div>
  )
}
