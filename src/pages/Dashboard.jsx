import { BookOpen, Trophy, Brain, Bell, LogOut, ChevronRight, Flame } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'

function SubtleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.5,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.3 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    }))

    const orbs = [
      { x: 0, y: 0, r: 300, color: '20,60,180', alpha: 0.06 },
      { x: window.innerWidth, y: window.innerHeight, r: 350, color: '60,20,180', alpha: 0.05 },
      { x: window.innerWidth, y: 0, r: 250, color: '20,80,160', alpha: 0.04 },
    ]

    let frame = 0

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      bg.addColorStop(0, '#030a1a')
      bg.addColorStop(0.5, '#050d20')
      bg.addColorStop(1, '#030810')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      orbs.forEach((orb) => {
        const grd = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r)
        grd.addColorStop(0, `rgba(${orb.color}, ${orb.alpha})`)
        grd.addColorStop(1, `rgba(${orb.color}, 0)`)
        ctx.fillStyle = grd
        ctx.fillRect(orb.x - orb.r, orb.y - orb.r, orb.r * 2, orb.r * 2)
      })

      ctx.strokeStyle = 'rgba(20, 60, 160, 0.05)'
      ctx.lineWidth = 0.5
      const spacing = 60
      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }

      particles.forEach((p) => {
        p.x += p.dx; p.y += p.dy; p.pulse += 0.015
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(80, 150, 255, ${p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))})`
        ctx.fill()
      })

      particles.forEach((a, i) => {
        particles.forEach((b, j) => {
          if (j <= i) return
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(60, 120, 220, ${0.06 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full" style={{ zIndex: 0 }} />
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState({ name: 'User', email: '', institution: '' })
  const [progress, setProgress] = useState({ 0: 0, 1: 0, 2: 0, 3: 0 })
  const [stats, setStats] = useState({ totalPoints: 0, aiSessions: 0, modulesDone: 0 })

  useEffect(() => {
    const stored = localStorage.getItem('cybershield_user')
    if (stored) setUser(JSON.parse(stored))

    const savedProgress = localStorage.getItem('cybershield_progress')
    if (savedProgress) setProgress(JSON.parse(savedProgress))

    const savedStats = localStorage.getItem('cybershield_stats')
    if (savedStats) setStats(JSON.parse(savedStats))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('cybershield_user')
    navigate('/')
  }

  const modules = [
    { title: 'Phishing Awareness', desc: 'Learn to spot phishing emails', progress: progress[0] || 0, color: 'bg-blue-600' },
    { title: 'Social Engineering', desc: 'Recognize manipulation tactics', progress: progress[1] || 0, color: 'bg-purple-600' },
    { title: 'Password Security', desc: 'Best practices for strong passwords', progress: progress[2] || 0, color: 'bg-green-600' },
    { title: 'Malware & Ransomware', desc: 'Understand and prevent malware', progress: progress[3] || 0, color: 'bg-red-600' },
  ]

  // Full badge system — all modules + achievements
  const badges = [
    {
      title: 'First Login',
      icon: '🏅',
      desc: 'Welcome aboard!',
      earned: true,
    },
    {
      title: 'Phishing Pro',
      icon: '🎣',
      desc: 'Score 80%+ on Phishing',
      earned: (progress[0] || 0) >= 80,
    },
    {
      title: 'Social Guard',
      icon: '🎭',
      desc: 'Score 80%+ on Social Engineering',
      earned: (progress[1] || 0) >= 80,
    },
    {
      title: 'Password Hero',
      icon: '🔐',
      desc: 'Score 80%+ on Password Security',
      earned: (progress[2] || 0) >= 80,
    },
    {
      title: 'Malware Hunter',
      icon: '🦠',
      desc: 'Score 80%+ on Malware',
      earned: (progress[3] || 0) >= 80,
    },
    {
      title: 'Quiz Master',
      icon: '🧠',
      desc: 'Earn 200+ total points',
      earned: (stats.totalPoints || 0) >= 200,
    },
    {
      title: 'All Modules',
      icon: '🎓',
      desc: 'Complete all 4 modules',
      earned: Object.values(progress).filter(v => v > 0).length === 4,
    },
    {
      title: 'Top Scorer',
      icon: '🏆',
      desc: 'Earn 500+ total points',
      earned: (stats.totalPoints || 0) >= 500,
    },
  ]

  const modulesDone = `${Object.values(progress).filter(v => v > 0).length}/4`
  const earnedBadges = badges.filter(b => b.earned).length
  const firstName = user.name.charAt(0).toUpperCase() + user.name.slice(1)

  const cardStyle = {
    background: 'rgba(8, 18, 45, 0.80)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(40, 90, 200, 0.2)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  }

  const navStyle = {
    background: 'rgba(4, 10, 28, 0.90)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(30, 70, 180, 0.2)',
  }

  return (
    <div className="min-h-screen text-white relative">
      <SubtleCanvas />

      <nav className="px-6 py-4 flex items-center justify-between sticky top-0" style={{ ...navStyle, zIndex: 20 }}>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="CyberShield" className="w-9 h-9" />
          <span className="font-bold text-lg"
            style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CyberShield
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-blue-300 text-sm hidden md:block opacity-70">{user.institution}</span>
          <Bell className="w-5 h-5 text-blue-400 cursor-pointer hover:text-white transition" />
          <div className="flex items-center gap-2 cursor-pointer hover:text-red-400 transition text-gray-300"
            onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 relative" style={{ zIndex: 10 }}>

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back, <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{firstName}</span> 👋
          </h1>
          <p className="text-gray-400 mt-1">Continue your cybersecurity training journey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
          {[
            { label: 'Modules Done', value: modulesDone, icon: <BookOpen className="w-5 h-5" />, color: 'text-blue-400' },
            { label: 'Total Points', value: stats.totalPoints || 0, icon: <Trophy className="w-5 h-5" />, color: 'text-yellow-400' },
            { label: 'Badges Earned', value: `${earnedBadges}/${badges.length}`, icon: <Brain className="w-5 h-5" />, color: 'text-purple-400' },
            { label: 'Day Streak', value: '1 🔥', icon: <Flame className="w-5 h-5" />, color: 'text-orange-400' },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl p-4" style={cardStyle}>
              <div className={`${stat.color} mb-2`}>{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Training Modules */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-white">Training Modules</h2>
          <div className="space-y-3">
            {modules.map((mod, i) => (
              <div key={i} onClick={() => navigate(`/module/${i}`)}
                className="rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all"
                style={cardStyle}
                onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(80,140,255,0.4)'}
                onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(40,90,200,0.2)'}>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{mod.title}</span>
                    <span className="text-gray-400 text-sm">{mod.progress}%</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{mod.desc}</p>
                  <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className={`${mod.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${mod.progress}%` }} />
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Badges — full 8 badges */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Badges</h2>
            <span className="text-sm text-blue-300 opacity-70">{earnedBadges} of {badges.length} earned</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {badges.map((badge, i) => (
              <div key={i} className="rounded-xl p-4 text-center transition-all"
                style={{
                  ...cardStyle,
                  border: badge.earned ? '1px solid rgba(250,200,0,0.4)' : '1px solid rgba(40,90,200,0.15)',
                  opacity: badge.earned ? 1 : 0.35,
                  boxShadow: badge.earned ? '0 0 20px rgba(250,200,0,0.08), 0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.3)',
                }}>
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="text-xs font-medium text-white leading-tight">{badge.title}</div>
                <div className="text-gray-500 text-xs mt-1 leading-tight">{badge.desc}</div>
                {badge.earned && <div className="text-yellow-400 text-xs mt-1 font-semibold">Earned ✓</div>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
