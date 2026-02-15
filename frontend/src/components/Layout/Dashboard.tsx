import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { useSocketIO } from '../../hooks/useSocketIO'

interface DashboardProps {
  children: ReactNode
}

export default function Dashboard({ children }: DashboardProps) {
  const { connected, fps, latency, faces } = useSocketIO()

  return (
    <div className="h-screen flex bg-dark-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          fps={fps}
          latency={latency}
          connected={connected}
          faceCount={faces.length}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
