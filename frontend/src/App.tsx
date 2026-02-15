import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Layout/Dashboard'
import LiveRecognition from './components/Recognition/LiveRecognition'
import EnrollmentWizard from './components/Enrollment/EnrollmentWizard'
import ChallengeSelector from './components/Challenges/ChallengeSelector'
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard'
import PipelineViz from './components/Tech/PipelineViz'
import HomePage from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Dashboard>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/enrollment" element={<EnrollmentWizard />} />
          <Route path="/recognition" element={<LiveRecognition />} />
          <Route path="/challenges" element={<ChallengeSelector />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/tech" element={<PipelineViz />} />
        </Routes>
      </Dashboard>
    </BrowserRouter>
  )
}

export default App
