import { useState, useEffect, useRef } from 'react'
import { Lock, Mail, User, Building, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

// Detect mobile device
const isMobile = () => window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

function CyberCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    const mobile = isMobile()

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Reduce everything on mobile
    const nodeCount = mobile ? 15 : 60
    const signalCount = mobile ? 8 : 40
    const particleCount = mobile ? 30 : 150
    const rippleInterval = mobile ? 2000 : 800
    const streamCount = mobile ? 3 : 8

    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      pulse: Math.random() * Math.PI * 2,
      size: Math.random() * 3 + 2,
    }))

    const signals = Array.from({ length: signalCount }, () => ({
      progress: Math.random(),
      speed: 0.003 + Math.random() * 0.006,
      nodeA: Math.floor(Math.random() * nodes.length),
      nodeB: Math.floor(Math.random() * nodes.length),
      color: Math.random() > 0.5 ? '100,200,255' : '180,100,255',
      size: Math.random() * 4 + 3,
    }))

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      color: Math.random() > 0.7 ? '200,100,255' : Math.random() > 0.5 ? '100,220,255' : '50,150,255',
    }))

    const ripples = []
    const ri = setInterval(() => {
      ripples.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 0, alpha: 0.6,
        color: Math.random() > 0.5 ? '80,160,255' : '160,80,255',
      })
    }, rippleInterval)

    const streams = Array.from({ length: streamCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      angle: Math.random() * Math.PI * 2,
      length: 60 + Math.random() * 100,
      speed: 2 + Math.random() * 3,
      alpha: Math.random() * 0.7 + 0.3,
      color: Math.random() > 0.5 ? '100,200,255' : '200,100,255',
    }))

    // Skip hex grid on mobile — too heavy
    const hexSize = 40
    const hexGrid = []
    if (!mobile) {
      for (let hx = 0; hx < window.innerWidth + hexSize * 2; hx += hexSize * 1.75) {
        for (let hy = 0; hy < window.innerHeight + hexSize * 2; hy += hexSize * 1.5) {
          hexGrid.push({
            x: hx + (Math.floor(hy / (hexSize * 1.5)) % 2 === 0 ? 0 : hexSize * 0.875),
            y: hy, pulse: Math.random() * Math.PI * 2, alpha: Math.random() * 0.06 + 0.01,
          })
        }
      }
    }

    const drawHex = (x, y, s) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6
        i === 0 ? ctx.moveTo(x + s * Math.cos(a), y + s * Math.sin(a)) : ctx.lineTo(x + s * Math.cos(a), y + s * Math.sin(a))
      }
      ctx.closePath()
    }

    let frame = 0
    const draw = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const bg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width)
      bg.addColorStop(0, '#040d20'); bg.addColorStop(1, '#010610')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Hex grid — desktop only
      if (!mobile) {
        hexGrid.forEach(h => {
          h.pulse += 0.008
          ctx.strokeStyle = `rgba(30,100,220,${h.alpha + 0.03 * Math.sin(h.pulse)})`
          ctx.lineWidth = 0.5; drawHex(h.x, h.y, hexSize * 0.9); ctx.stroke()
        })
      }

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.02
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
      })

      // Circuit lines — skip on mobile for performance
      if (!mobile) {
        nodes.forEach((a, i) => nodes.forEach((b, j) => {
          if (j <= i) return
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 200) {
            const op = (1 - d / 200) * 0.25
            const gr = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
            gr.addColorStop(0, `rgba(30,120,255,${op})`); gr.addColorStop(1, `rgba(30,120,255,${op})`)
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = gr; ctx.lineWidth = 0.8; ctx.stroke()
          }
        }))
      } else {
        // Simpler lines on mobile
        nodes.forEach((a, i) => nodes.forEach((b, j) => {
          if (j <= i) return
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 150) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(30,120,255,${(1 - d / 150) * 0.15})`
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        }))
      }

      signals.forEach(sig => {
        sig.progress += sig.speed
        if (sig.progress >= 1) {
          sig.progress = 0; sig.nodeA = sig.nodeB
          sig.nodeB = Math.floor(Math.random() * nodes.length)
          sig.color = Math.random() > 0.5 ? '100,200,255' : '180,80,255'
        }
        const a = nodes[sig.nodeA], b = nodes[sig.nodeB]
        if (Math.hypot(a.x - b.x, a.y - b.y) < (mobile ? 150 : 200)) {
          const sx = a.x + (b.x - a.x) * sig.progress
          const sy = a.y + (b.y - a.y) * sig.progress
          const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, sig.size * 3)
          grd.addColorStop(0, `rgba(${sig.color},1)`); grd.addColorStop(1, `rgba(${sig.color},0)`)
          ctx.beginPath(); ctx.arc(sx, sy, sig.size * 3, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill()
          ctx.beginPath(); ctx.arc(sx, sy, sig.size * 0.8, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill()
        }
      })

      nodes.forEach(n => {
        const p = 0.4 + 0.3 * Math.sin(n.pulse)
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 20)
        g.addColorStop(0, `rgba(60,140,255,${p})`); g.addColorStop(1, 'rgba(60,140,255,0)')
        ctx.beginPath(); ctx.arc(n.x, n.y, 20, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
        ctx.beginPath(); ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(150,210,255,${0.8 + 0.2 * Math.sin(n.pulse)})`; ctx.fill()
      })

      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy; p.pulse += 0.04
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color},${p.alpha * (0.5 + 0.5 * Math.sin(p.pulse))})`; ctx.fill()
      })

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]; rp.r += 1.5; rp.alpha -= 0.008
        if (rp.alpha <= 0) { ripples.splice(i, 1); continue }
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${rp.color},${rp.alpha})`; ctx.lineWidth = 1.5; ctx.stroke()
      }

      streams.forEach(s => {
        s.x += Math.cos(s.angle) * s.speed; s.y += Math.sin(s.angle) * s.speed
        if (s.x < -200 || s.x > canvas.width + 200 || s.y < -200 || s.y > canvas.height + 200) {
          s.x = Math.random() * canvas.width; s.y = Math.random() * canvas.height
          s.angle = Math.random() * Math.PI * 2
        }
        const ex = s.x - Math.cos(s.angle) * s.length, ey = s.y - Math.sin(s.angle) * s.length
        const gr = ctx.createLinearGradient(ex, ey, s.x, s.y)
        gr.addColorStop(0, `rgba(${s.color},0)`); gr.addColorStop(1, `rgba(${s.color},${s.alpha})`)
        ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(s.x, s.y)
        ctx.strokeStyle = gr; ctx.lineWidth = 1.5; ctx.stroke()
      })

      // Center glow — skip on mobile
      if (!mobile) {
        const cx = canvas.width / 2, cy = canvas.height / 2
        const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 400)
        centerGlow.addColorStop(0, `rgba(20,60,180,${0.15 + 0.05 * Math.sin(frame * 0.015)})`)
        centerGlow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = centerGlow; ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(animationId); clearInterval(ri); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full" style={{ zIndex: 0 }} />
}

// Password validation
const validatePassword = (pwd) => ({
  minLength: pwd.length >= 8,
  hasUpper: /[A-Z]/.test(pwd),
  hasNumber: /[0-9]/.test(pwd),
  hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
})
const isPasswordValid = (pwd) => {
  const v = validatePassword(pwd)
  return v.minLength && v.hasUpper && v.hasNumber && v.hasSymbol
}

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPasswordRules, setShowPasswordRules] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const navigate = useNavigate()

  const pwdValidation = validatePassword(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (mode === 'signup' && !isPasswordValid(password)) {
      setError('Password does not meet the requirements below.')
      setShowPasswordRules(true)
      return
    }
    setLoading(true)
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        await setDoc(doc(db, 'users', cred.user.uid), {
          name, email, institution, role: 'employee',
          points: 0, modulesDone: 0,
          progress: { 0: 0, 1: 0, 2: 0, 3: 0 },
          joined: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
        })
        setSignupSuccess(true)
        setEmail(''); setPassword(''); setName(''); setInstitution('')
        setTimeout(() => { setSignupSuccess(false); setMode('login') }, 2500)

      } else if (mode === 'login') {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        const snap = await getDoc(doc(db, 'users', cred.user.uid))
        if (snap.exists()) {
          const d = snap.data()
          localStorage.setItem('cybershield_user', JSON.stringify({ uid: cred.user.uid, name: d.name, email: d.email, institution: d.institution }))
          if (d.progress) localStorage.setItem('cybershield_progress', JSON.stringify(d.progress))
          if (d.points !== undefined) localStorage.setItem('cybershield_stats', JSON.stringify({ totalPoints: d.points, modulesDone: d.modulesDone || 0 }))
        }
        navigate('/dashboard')

      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email, { url: window.location.origin, handleCodeInApp: false })
        setSubmitted(true)
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('This email is already registered. Please sign in.')
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') setError('Incorrect email or password. Please try again.')
      else if (err.code === 'auth/user-not-found') setError('No account found with this email.')
      else if (err.code === 'auth/weak-password') setError('Password must meet all requirements.')
      else if (err.code === 'auth/invalid-email') setError('Please enter a valid email address.')
      else if (err.code === 'auth/too-many-requests') setError('Too many attempts. Please wait a moment and try again.')
      else setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const inputClass = "bg-transparent text-white w-full outline-none text-sm placeholder-gray-500"
  const inputWrap = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(80,140,255,0.35)' }
  const btnStyle = { background: loading ? 'rgba(80,100,200,0.5)' : 'linear-gradient(135deg,#1a3fc4,#2d6fff,#7c3aed)', boxShadow: '0 0 30px rgba(80,100,255,0.5)' }
  const cardStyle = { background: 'rgba(6,15,40,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(80,140,255,0.2)', boxShadow: '0 0 60px rgba(40,80,255,0.15),0 20px 60px rgba(0,0,0,0.6)' }

  const RuleItem = ({ passed, text }) => (
    <div className="flex items-center gap-2">
      {passed ? <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
      <span className={`text-xs ${passed ? 'text-green-400' : 'text-gray-400'}`}>{text}</span>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <CyberCanvas />
      <div className="w-full max-w-md relative" style={{ zIndex: 10 }}>

        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-70" style={{ background: 'radial-gradient(circle,rgba(80,120,255,0.9) 0%,rgba(120,40,220,0.6) 50%,transparent 80%)' }} />
            <img src="/logo.png" alt="CyberShield Logo" className="w-24 h-24 relative drop-shadow-2xl" />
          </div>
          <h1 className="text-4xl font-bold tracking-wide" style={{ background: 'linear-gradient(135deg,#60a5fa,#a78bfa,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CyberShield</h1>
          <p className="text-blue-400 mt-1 text-xs tracking-widest uppercase opacity-80">⬡ Cybersecurity Awareness Platform ⬡</p>
        </div>

        <div className="rounded-2xl p-8 shadow-2xl" style={cardStyle}>
          {error && <div className="rounded-xl p-3 mb-4 text-red-300 text-sm" style={{ background: 'rgba(120,20,20,0.5)', border: '1px solid rgba(200,60,60,0.4)' }}>{error}</div>}
          {signupSuccess && <div className="rounded-xl p-3 mb-4 text-green-300 text-sm" style={{ background: 'rgba(20,80,40,0.6)', border: '1px solid rgba(60,180,80,0.4)' }}>✅ Account created! Redirecting to sign in...</div>}

          {mode === 'login' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="text-blue-300 text-sm mb-1 block">Email</label>
                  <div className="flex items-center rounded-lg px-3 py-2.5" style={inputWrap}><Mail className="text-blue-400 w-4 h-4 mr-2 shrink-0" /><input type="email" placeholder="you@institution.com" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} /></div></div>
                <div><label className="text-blue-300 text-sm mb-1 block">Password</label>
                  <div className="flex items-center rounded-lg px-3 py-2.5" style={inputWrap}><Lock className="text-blue-400 w-4 h-4 mr-2 shrink-0" /><input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className={inputClass} /></div></div>
                <div className="text-right"><button type="button" onClick={() => { setMode('forgot'); setError('') }} className="text-blue-400 text-sm hover:text-purple-300 transition">Forgot password?</button></div>
                <button type="submit" disabled={loading} className="w-full text-white font-semibold py-3 rounded-lg transition hover:opacity-90" style={btnStyle}>{loading ? 'Signing in...' : 'Sign In →'}</button>
              </form>
              <p className="text-center text-gray-500 text-sm mt-6">Don't have an account?{' '}<button onClick={() => { setMode('signup'); setError('') }} className="text-blue-400 hover:text-purple-300">Sign up</button></p>
            </>
          )}

          {mode === 'signup' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">Create your account</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="text-blue-300 text-sm mb-1 block">Full Name</label>
                  <div className="flex items-center rounded-lg px-3 py-2.5" style={inputWrap}><User className="text-blue-400 w-4 h-4 mr-2 shrink-0" /><input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required className={inputClass} /></div></div>
                <div><label className="text-blue-300 text-sm mb-1 block">Institution</label>
                  <div className="flex items-center rounded-lg px-3 py-2.5" style={inputWrap}><Building className="text-blue-400 w-4 h-4 mr-2 shrink-0" /><input type="text" placeholder="Your organization" value={institution} onChange={e => setInstitution(e.target.value)} required className={inputClass} /></div></div>
                <div><label className="text-blue-300 text-sm mb-1 block">Email</label>
                  <div className="flex items-center rounded-lg px-3 py-2.5" style={inputWrap}><Mail className="text-blue-400 w-4 h-4 mr-2 shrink-0" /><input type="email" placeholder="you@institution.com" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} /></div></div>
                <div><label className="text-blue-300 text-sm mb-1 block">Password</label>
                  <div className="flex items-center rounded-lg px-3 py-2.5" style={inputWrap}><Lock className="text-blue-400 w-4 h-4 mr-2 shrink-0" /><input type="password" placeholder="Create a strong password" value={password} onChange={e => { setPassword(e.target.value); setShowPasswordRules(true) }} onFocus={() => setShowPasswordRules(true)} required className={inputClass} /></div>
                  {showPasswordRules && (
                    <div className="mt-2 p-3 rounded-lg space-y-1.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(80,140,255,0.15)' }}>
                      <RuleItem passed={pwdValidation.minLength} text="At least 8 characters" />
                      <RuleItem passed={pwdValidation.hasUpper} text="At least one uppercase letter (A-Z)" />
                      <RuleItem passed={pwdValidation.hasNumber} text="At least one number (0-9)" />
                      <RuleItem passed={pwdValidation.hasSymbol} text="At least one symbol (!@#$%^&*...)" />
                    </div>
                  )}
                </div>
                <button type="submit" disabled={loading} className="w-full text-white font-semibold py-3 rounded-lg transition hover:opacity-90" style={btnStyle}>{loading ? 'Creating account...' : 'Create Account →'}</button>
              </form>
              <p className="text-center text-gray-500 text-sm mt-6">Already have an account?{' '}<button onClick={() => { setMode('login'); setError('') }} className="text-blue-400 hover:text-purple-300">Sign in</button></p>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">Reset your password</h2>
              {!submitted ? (
                <>
                  <p className="text-gray-400 text-sm mb-6">Enter your registered email and we will send you a reset link.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="text-blue-300 text-sm mb-1 block">Email</label>
                      <div className="flex items-center rounded-lg px-3 py-2.5" style={inputWrap}><Mail className="text-blue-400 w-4 h-4 mr-2 shrink-0" /><input type="email" placeholder="you@institution.com" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} /></div></div>
                    <button type="submit" disabled={loading} className="w-full text-white font-semibold py-3 rounded-lg transition hover:opacity-90" style={btnStyle}>{loading ? 'Sending...' : 'Send Reset Link →'}</button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 0 30px rgba(34,197,94,0.5)' }}><Mail className="text-white w-6 h-6" /></div>
                  <p className="text-white font-medium text-lg">Check your email!</p>
                  <p className="text-gray-400 text-sm mt-2">A reset link has been sent to<br /><span className="text-blue-400">{email}</span></p>
                  <p className="text-gray-500 text-xs mt-3">Check your spam folder if you do not see it</p>
                </div>
              )}
              <p className="text-center text-gray-500 text-sm mt-6"><button onClick={() => { setMode('login'); setSubmitted(false); setError('') }} className="text-blue-400 hover:text-purple-300">← Back to Sign in</button></p>
            </>
          )}
        </div>
        <p className="text-center text-gray-700 text-xs mt-6">© 2025 CyberShield · All rights reserved</p>
      </div>
    </div>
  )
}
