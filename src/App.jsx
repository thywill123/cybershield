import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TrainingModule from './pages/TrainingModule'
import Quiz from './pages/Quiz'
import AIChat from './pages/AIChat'
import Admin from './pages/Admin'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/module/:id" element={<TrainingModule />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  )
}

export default App
