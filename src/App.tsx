import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LeadershipDashboard from './pages/Dashboard'
import './App.css'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<LeadershipDashboard />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
