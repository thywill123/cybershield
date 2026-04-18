import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Shield } from 'lucide-react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

// Admin credentials — only this email can access admin
const ADMIN_EMAIL = 'admin@cybershield.com'

function AdminCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    const particles = Array.from({ length: 40 }, () => ({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, r: Math.random() * 1.8 + 0.5, dx: (Math.random() - 0.5) * 0.2, dy: (Math.random() - 0.5) * 0.2, alpha: Math.random() * 0.3 + 0.05, pulse: Math.random() * Math.PI * 2 }))
    const orbs = [{ x: 0, y: 0, r: 300, color: '20,60,180', alpha: 0.07 }, { x: window.innerWidth, y: window.innerHeight, r: 350, color: '60,20,180', alpha: 0.06 }]
    let frame = 0
    const draw = () => {
      frame++; ctx.clearRect(0, 0, canvas.width, canvas.height)
      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height); bg.addColorStop(0, '#030a1a'); bg.addColorStop(1, '#030810'); ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height)
      orbs.forEach(orb => { const grd = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r); grd.addColorStop(0, `rgba(${orb.color},${orb.alpha})`); grd.addColorStop(1, `rgba(${orb.color},0)`); ctx.fillStyle = grd; ctx.fillRect(orb.x - orb.r, orb.y - orb.r, orb.r * 2, orb.r * 2) })
      ctx.strokeStyle = 'rgba(20,60,160,0.05)'; ctx.lineWidth = 0.5
      for (let x = 0; x < canvas.width; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke() }
      for (let y = 0; y < canvas.height; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke() }
      particles.forEach(p => { p.x += p.dx; p.y += p.dy; p.pulse += 0.015; if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0; if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(80,150,255,${p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))})`; ctx.fill() })
      animationId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full" style={{ zIndex: 0 }} />
}

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Check if email is the admin email
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setError('Access denied. This login is for administrators only.')
      return
    }

    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)

      // Double check admin role in Firestore
      const snap = await getDoc(doc(db, 'users', cred.user.uid))
      if (snap.exists()) {
        const data = snap.data()
        if (data.role !== 'admin') {
          setError('Access denied. You do not have administrator privileges.')
          setLoading(false)
          return
        }
        // Save admin session
        localStorage.setItem('cybershield_admin', JSON.stringify({
          uid: cred.user.uid,
          name: data.name,
          email: data.email,
        }))
        navigate('/admin')
      } else {
        setError('Admin account not found. Please contact support.')
      }
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') setError('Incorrect password. Please try again.')
      else if (err.code === 'auth/user-not-found') setError('Admin account not found.')
      else if (err.code === 'auth/too-many-requests') setError('Too many attempts. Please wait and try again.')
      else setError('Login failed. Please try again.')
    }
    setLoading(false)
  }

  const inputClass = "bg-transparent text-white w-full outline-none text-sm placeholder-gray-500"
  const inputWrap = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(80,140,255,0.35)' }
  const btnStyle = { background: loading ? 'rgba(80,100,200,0.5)' : 'linear-gradient(135deg,#1a3fc4,#2d6fff,#7c3aed)', boxShadow: '0 0 30px rgba(80,100,255,0.5)' }
  const cardStyle = { background: 'rgba(6,15,40,0.88)', backdropFilter: 'blur(20px)', border: '1px solid rgba(80,140,255,0.2)', boxShadow: '0 0 60px rgba(40,80,255,0.15),0 20px 60px rgba(0,0,0,0.6)' }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AdminCanvas />
      <div className="w-full max-w-md relative" style={{ zIndex: 10 }}>

        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-70" style={{ background: 'radial-gradient(circle,rgba(80,120,255,0.9) 0%,rgba(120,40,220,0.6) 50%,transparent 80%)' }} />
            <img src="/logo.png" alt="CyberShield" className="w-20 h-20 relative drop-shadow-2xl" />
          </div>
          <h1 className="text-3xl font-bold tracking-wide" style={{ background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CyberShield</h1>
          <div className="flex items-center gap-2 mt-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <p className="text-blue-400 text-xs tracking-widest uppercase opacity-80">Administrator Access</p>
          </div>
        </div>

        <div className="rounded-2xl p-8 shadow-2xl" style={cardStyle}>
          <h2 className="text-xl font-semibold text-white mb-2">Admin Sign In</h2>
          <p className="text-gray-400 text-sm mb-6">Restricted access — authorised personnel only</p>

          {error && <div className="rounded-xl p-3 mb-4 text-red-300 text-sm" style={{ background: 'rgba(120,20,20,0.5)', border: '1px solid rgba(200,60,60,0.4)' }}>{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-blue-300 text-sm mb-1 block">Admin Email</label>
              <div className="flex items-center rounded-lg px-3 py-2.5" style={inputWrap}>
                <Mail className="text-blue-400 w-4 h-4 mr-2 shrink-0" />
                <input type="email" placeholder="admin@cybershield.com" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-blue-300 text-sm mb-1 block">Password</label>
              <div className="flex items-center rounded-lg px-3 py-2.5" style={inputWrap}>
                <Lock className="text-blue-400 w-4 h-4 mr-2 shrink-0" />
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className={inputClass} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full text-white font-semibold py-3 rounded-lg transition hover:opacity-90" style={btnStyle}>
              {loading ? 'Verifying...' : 'Access Admin Panel →'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-xs mt-6">
            Not an admin?{' '}
            <button onClick={() => navigate('/')} className="text-blue-400 hover:text-purple-300 transition">Go to main login</button>
          </p>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">© 2025 CyberShield · Restricted Access</p>
      </div>
    </div>
  )
}
