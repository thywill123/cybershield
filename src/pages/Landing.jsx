import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { Brain, Trophy, ChevronRight, CheckCircle, Eye, Lock, Zap, Users, AlertTriangle, ArrowRight, Shield } from 'lucide-react'
import { glassCard, glassCardHover, glassNav, glassPillPrimary, glassPillGhost, glassChip } from '../styles/glass'

// Full animated canvas — same style as Login page
function LandingCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    const nodes = Array.from({ length: 50 }, () => ({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, pulse: Math.random() * Math.PI * 2, size: Math.random() * 2.5 + 1.5 }))
    const signals = Array.from({ length: 30 }, () => ({ progress: Math.random(), speed: 0.003 + Math.random() * 0.005, nodeA: Math.floor(Math.random() * nodes.length), nodeB: Math.floor(Math.random() * nodes.length), color: Math.random() > 0.5 ? '100,200,255' : '180,100,255', size: Math.random() * 3 + 2 }))
    const particles = Array.from({ length: 100 }, () => ({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, r: Math.random() * 2 + 0.5, dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4, alpha: Math.random() * 0.4 + 0.1, pulse: Math.random() * Math.PI * 2, color: Math.random() > 0.7 ? '200,100,255' : Math.random() > 0.5 ? '100,220,255' : '50,150,255' }))
    const ripples = []; const ri = setInterval(() => ripples.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, r: 0, alpha: 0.5, color: Math.random() > 0.5 ? '80,160,255' : '160,80,255' }), 1200)
    const hexSize = 50; const hexGrid = []
    for (let hx = 0; hx < window.innerWidth + hexSize * 2; hx += hexSize * 1.75)
      for (let hy = 0; hy < window.innerHeight + hexSize * 2; hy += hexSize * 1.5)
        hexGrid.push({ x: hx + (Math.floor(hy / (hexSize * 1.5)) % 2 === 0 ? 0 : hexSize * 0.875), y: hy, pulse: Math.random() * Math.PI * 2, alpha: Math.random() * 0.05 + 0.01 })
    const drawHex = (x, y, s) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i - Math.PI / 6; i === 0 ? ctx.moveTo(x + s * Math.cos(a), y + s * Math.sin(a)) : ctx.lineTo(x + s * Math.cos(a), y + s * Math.sin(a)) } ctx.closePath() }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const bg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width)
      bg.addColorStop(0, '#040d20'); bg.addColorStop(1, '#010610')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height)
      hexGrid.forEach(h => { h.pulse += 0.006; ctx.strokeStyle = `rgba(30,100,220,${h.alpha + 0.02 * Math.sin(h.pulse)})`; ctx.lineWidth = 0.4; drawHex(h.x, h.y, hexSize * 0.88); ctx.stroke() })
      nodes.forEach(n => { n.x += n.vx; n.y += n.vy; n.pulse += 0.02; if (n.x < 0 || n.x > canvas.width) n.vx *= -1; if (n.y < 0 || n.y > canvas.height) n.vy *= -1 })
      nodes.forEach((a, i) => nodes.forEach((b, j) => {
        if (j <= i) return
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d < 180) { const op = (1 - d / 180) * 0.2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = `rgba(30,120,255,${op})`; ctx.lineWidth = 0.7; ctx.stroke() }
      }))
      signals.forEach(sig => {
        sig.progress += sig.speed
        if (sig.progress >= 1) { sig.progress = 0; sig.nodeA = sig.nodeB; sig.nodeB = Math.floor(Math.random() * nodes.length); sig.color = Math.random() > 0.5 ? '100,200,255' : '180,80,255' }
        const a = nodes[sig.nodeA], b = nodes[sig.nodeB]
        if (Math.hypot(a.x - b.x, a.y - b.y) < 180) {
          const sx = a.x + (b.x - a.x) * sig.progress, sy = a.y + (b.y - a.y) * sig.progress
          const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, sig.size * 3)
          grd.addColorStop(0, `rgba(${sig.color},1)`); grd.addColorStop(1, `rgba(${sig.color},0)`)
          ctx.beginPath(); ctx.arc(sx, sy, sig.size * 3, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill()
          ctx.beginPath(); ctx.arc(sx, sy, sig.size * 0.7, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill()
        }
      })
      nodes.forEach(n => {
        const p = 0.3 + 0.3 * Math.sin(n.pulse)
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 16)
        g.addColorStop(0, `rgba(60,140,255,${p})`); g.addColorStop(1, 'rgba(60,140,255,0)')
        ctx.beginPath(); ctx.arc(n.x, n.y, 16, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
        ctx.beginPath(); ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(150,210,255,${0.7 + 0.3 * Math.sin(n.pulse)})`; ctx.fill()
      })
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy; p.pulse += 0.04
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color},${p.alpha * (0.5 + 0.5 * Math.sin(p.pulse))})`; ctx.fill()
      })
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]; rp.r += 1.2; rp.alpha -= 0.006
        if (rp.alpha <= 0) { ripples.splice(i, 1); continue }
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${rp.color},${rp.alpha})`; ctx.lineWidth = 1.2; ctx.stroke()
      }
      animationId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animationId); clearInterval(ri); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full" style={{ zIndex: 0 }} />
}

export default function Landing() {
  const navigate = useNavigate()
  const [count, setCount] = useState(0)
  const [typedText, setTypedText] = useState('')
  const fullText = 'Is your team ready for a cyberattack?'

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i))
      i++
      if (i > fullText.length) clearInterval(interval)
    }, 55)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      current += 1
      setCount(current)
      if (current >= 95) clearInterval(interval)
    }, 18)
    return () => clearInterval(interval)
  }, [])

  const navStyle = glassNav
  const cardStyle = glassCard
  const gradText = { background: 'linear-gradient(135deg,#60a5fa,#a78bfa,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
  const tealGrad = glassPillPrimary('20,180,165')
  const ghostBtn = glassPillGhost

  const features = [
    { icon: <Brain className="w-6 h-6 text-blue-400" />, title: 'Generative AI Training', desc: 'Claude AI creates fresh realistic cybersecurity scenarios every session — no two quizzes are ever the same.', color: 'rgba(37,99,235,0.15)', border: 'rgba(37,99,235,0.3)' },
    { icon: <Trophy className="w-6 h-6 text-yellow-400" />, title: 'Gamified Learning', desc: 'Earn points and unlock badges as you complete modules. Learning cybersecurity has never been this engaging.', color: 'rgba(202,138,4,0.12)', border: 'rgba(202,138,4,0.3)' },
    { icon: <Eye className="w-6 h-6 text-teal-400" />, title: 'Threat Simulations', desc: 'Practice spotting real phishing emails, social engineering attempts and malware threats in a safe environment.', color: 'rgba(13,148,136,0.12)', border: 'rgba(13,148,136,0.3)' },
    { icon: <Zap className="w-6 h-6 text-purple-400" />, title: 'Instant AI Feedback', desc: 'Get immediate explanations after every answer so you understand exactly what went wrong and how to stay safe.', color: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.3)' },
    { icon: <Lock className="w-6 h-6 text-red-400" />, title: 'Secure by Design', desc: 'Built with CIA Triad principles and STRIDE threat modeling — the platform practices what it teaches.', color: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.3)' },
    { icon: <Users className="w-6 h-6 text-green-400" />, title: 'Built for Everyone', desc: 'Designed for non-technical employees — no cybersecurity background required to get started.', color: 'rgba(22,163,74,0.12)', border: 'rgba(22,163,74,0.3)' },
  ]

  const modules = [
    { icon: '🎣', title: 'Phishing Awareness', desc: 'Spot fake emails, spoofed domains and credential harvesting attempts before they trick you.', border: 'rgba(37,99,235,0.4)', hover: 'rgba(37,99,235,0.7)' },
    { icon: '🎭', title: 'Social Engineering', desc: 'Recognize manipulation tactics, pretexting, baiting and psychological deception used by attackers.', border: 'rgba(124,58,237,0.4)', hover: 'rgba(124,58,237,0.7)' },
    { icon: '🔐', title: 'Password Security', desc: 'Master strong passwords, password managers and two-factor authentication best practices.', border: 'rgba(22,163,74,0.4)', hover: 'rgba(22,163,74,0.7)' },
    { icon: '🦠', title: 'Malware & Ransomware', desc: 'Understand how malware spreads, how ransomware works and how to protect your organization.', border: 'rgba(220,38,38,0.4)', hover: 'rgba(220,38,38,0.7)' },
  ]

  const steps = [
    { num: '01', title: 'Create your account', desc: 'Sign up with your institutional email in seconds', icon: '👤' },
    { num: '02', title: 'Pick a threat module', desc: 'Choose from Phishing, Social Engineering, Passwords or Malware', icon: '📚' },
    { num: '03', title: 'Train with AI', desc: 'Chat with Claude AI and take AI-generated scenario quizzes', icon: '🤖' },
    { num: '04', title: 'Earn rewards', desc: 'Collect points and badges as you grow your cyber awareness', icon: '🏆' },
  ]

  return (
    <div className="min-h-screen text-white overflow-x-hidden relative">
      <LandingCanvas />

     {/* Navbar */}
<nav className="fixed top-0 left-0 right-0 px-4 py-3 flex items-center justify-between" style={{ ...navStyle, zIndex: 50 }}>
  <div className="flex items-center gap-2">
    <img src="/logo.png" alt="CyberShield" className="w-8 h-8 flex-shrink-0" />
    <span className="font-bold text-base md:text-lg" style={gradText}>CyberShield</span>
  </div>
  <div className="flex items-center gap-2">
    <button onClick={() => navigate('/login')}
      className="glass-ghost text-gray-200 hover:text-white text-xs md:text-sm transition px-4 py-2 rounded-full"
      style={ghostBtn}>
      Sign In
    </button>
    <button onClick={() => navigate('/login')}
      className="glass-sweep text-white text-xs md:text-sm font-semibold px-4 md:px-6 py-2 rounded-full transition whitespace-nowrap"
      style={tealGrad}>
      <span className="hidden sm:inline">Get Started Free</span>
      <span className="sm:hidden">Get Started</span>
    </button>
  </div>
</nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 text-center relative" style={{ zIndex: 10 }}>
        <div className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full mb-8"
          style={{ ...glassChip, background: 'rgba(120,20,20,0.45)', border: '1px solid rgba(255,120,120,0.3)', color: '#fca5a5' }}>
          <AlertTriangle className="w-4 h-4" />
          <span><strong>{count}%</strong> of cyber breaches involve human error</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4 min-h-[80px]">
          {typedText}
          <span className="text-teal-400">|</span>
        </h1>

        <p className="text-xl font-semibold mb-6"
          style={{ background: 'linear-gradient(135deg,#2dd4bf,#0d9488)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          CyberShield trains them — with AI.
        </p>

        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          A gamified cybersecurity awareness platform powered by Generative AI.
          Realistic threat simulations and AI-generated quizzes designed
          for non-technical institutional employees.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button onClick={() => navigate('/login')}
            className="glass-sweep text-white font-bold px-8 py-4 rounded-full flex items-center justify-center gap-2 transition text-lg"
            style={tealGrad}>
            Start Training Free
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
            className="glass-ghost text-white font-semibold px-8 py-4 rounded-full transition text-lg"
            style={ghostBtn}>
            See How It Works
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {['🎣 Phishing Attacks', '🎭 Social Engineering', '🔐 Password Breaches', '🦠 Malware & Ransomware'].map((t, i) => (
            <div key={i} className="px-4 py-2 rounded-full text-sm text-gray-300"
              style={glassChip}>
              {t}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 relative" style={{ zIndex: 10, background: 'rgba(14,20,44,0.72)', backdropFilter: 'blur(18px) saturate(160%)', WebkitBackdropFilter: 'blur(18px) saturate(160%)', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '4', label: 'Training Modules', color: '#2dd4bf' },
            { value: 'AI', label: 'Generated Questions', color: '#60a5fa' },
            { value: '∞', label: 'Unique Scenarios', color: '#a78bfa' },
            { value: '24/7', label: 'Always Available', color: '#fbbf24' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-4xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-gray-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-24 relative" style={{ zIndex: 10 }}>
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={gradText}>Why CyberShield works</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Traditional cybersecurity training puts people to sleep.
            CyberShield keeps them engaged, informed and protected.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className="rounded-2xl p-6 transition-all duration-300"
              style={{ ...glassCard, background: `linear-gradient(160deg, ${f.color}, rgba(18,26,54,0.55))` }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, glassCardHover)}
              onMouseLeave={e => Object.assign(e.currentTarget.style, { ...glassCard, background: `linear-gradient(160deg, ${f.color}, rgba(18,26,54,0.55))` })}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}>
                {f.icon}
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="py-24 relative" style={{ zIndex: 10, background: 'rgba(14,20,44,0.6)', backdropFilter: 'blur(18px) saturate(160%)', WebkitBackdropFilter: 'blur(18px) saturate(160%)', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">What you will learn</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Four modules covering the most dangerous threats facing employees today
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {modules.map((mod, i) => (
              <div key={i} onClick={() => navigate('/login')}
                className="rounded-2xl p-6 flex gap-4 items-start cursor-pointer transition-all duration-300"
                style={{ ...cardStyle, border: `1px solid ${mod.border}` }}
                onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${mod.hover}`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.border = `1px solid ${mod.border}`; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div className="text-4xl">{mod.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1 text-white">{mod.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-3">{mod.desc}</p>
                  <div className="flex items-center gap-1 text-sm font-medium" style={{ color: '#2dd4bf' }}>
                    Start module <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-24 relative" style={{ zIndex: 10 }}>
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={gradText}>How it works</h2>
          <p className="text-gray-400 text-lg">Up and running in under 2 minutes</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <div key={i} className="rounded-2xl p-6 text-center" style={cardStyle}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-bold mb-3" style={{ color: 'rgba(13,148,136,0.6)' }}>{s.num}</div>
              <h3 className="font-bold mb-2 text-white">{s.title}</h3>
              <p className="text-gray-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-4 md:mx-8 mb-16 rounded-3xl py-20 px-6 text-center relative" style={{ zIndex: 10, background: 'linear-gradient(135deg, rgba(13,148,136,0.22), rgba(18,26,54,0.75), rgba(124,58,237,0.18))', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16), 0 12px 48px rgba(0,0,0,0.4)' }}>
        <div className="text-5xl mb-6">🛡️</div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          Your team's cybersecurity journey
          <span style={gradText}> starts here</span>
        </h2>
        <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: '#99f6e4' }}>
          Join CyberShield and turn your biggest security vulnerability into your strongest defense.
        </p>
        <button onClick={() => navigate('/login')}
          className="glass-sweep text-white font-bold px-10 py-4 rounded-full transition text-lg inline-flex items-center gap-2 mb-8"
          style={tealGrad}>
          Get Started — It's Free
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="flex flex-wrap justify-center gap-6 text-sm" style={{ color: '#5eead4' }}>
          {['No credit card required', 'AI-powered training', 'Gamified experience', 'Secure by design'].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />{item}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center relative" style={{ zIndex: 10, borderTop: '1px solid rgba(30,70,180,0.15)' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src="/logo.png" alt="CyberShield" className="w-7 h-7" />
          <span className="font-bold" style={gradText}>CyberShield</span>
        </div>
        <p className="text-gray-500 text-sm">Cybersecurity Awareness Platform — Powered by Generative AI</p>
        <p className="text-gray-700 text-xs mt-2">© 2026 CyberShield · Accra Technical University — Group 27</p>
      </footer>

    </div>
  )
}