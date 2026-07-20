import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TrainingModule from './pages/TrainingModule'
import Quiz from './pages/Quiz'
import AIChat from './pages/AIChat'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/module/:id" element={
          <ProtectedRoute><TrainingModule /></ProtectedRoute>
        } />
        <Route path="/quiz" element={
          <ProtectedRoute><Quiz /></ProtectedRoute>
        } />
        <Route path="/ai-chat" element={
          <ProtectedRoute><AIChat /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute><Admin /></ProtectedRoute>
        } />
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>
    </Router>
  )
}

export default App