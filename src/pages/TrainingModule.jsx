import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Shield, ArrowLeft, CheckCircle, Brain, Trophy, BookOpen } from 'lucide-react'

const moduleData = {
  0: {
    title: 'Phishing Awareness',
    color: 'bg-blue-600',
    icon: '🎣',
    intro: 'Phishing is one of the most common cyberattacks. Criminals send fake emails pretending to be trusted organizations to steal your credentials or install malware.',
    sections: [
      {
        heading: 'What is Phishing?',
        content: 'Phishing attacks trick users into clicking malicious links or providing sensitive information. They often impersonate banks, IT departments, or popular services like Google and Microsoft.'
      },
      {
        heading: 'Common Signs of Phishing',
        content: 'Look out for urgent language like "Your account will be closed!", misspelled domain names (e.g. support@g00gle.com), unexpected attachments, and requests for passwords or personal data.'
      },
      {
        heading: 'How to Respond',
        content: 'Never click suspicious links. Verify the sender by contacting the organization directly. Report phishing emails to your IT department immediately.'
      }
    ],
    tips: [
      'Always check the sender email address carefully',
      'Hover over links before clicking to see the real URL',
      'Never enter your password after clicking an email link',
      'When in doubt, call the sender directly to verify',
    ]
  },
  1: {
    title: 'Social Engineering',
    color: 'bg-purple-600',
    icon: '🎭',
    intro: 'Social engineering manipulates people into revealing confidential information or performing actions that compromise security. It exploits human psychology rather than technical vulnerabilities.',
    sections: [
      {
        heading: 'What is Social Engineering?',
        content: 'Attackers use psychological manipulation to trick employees. Common tactics include pretexting (creating a fake scenario), baiting (offering something enticing), and tailgating (following someone into a restricted area).'
      },
      {
        heading: 'Real World Examples',
        content: 'An attacker calls pretending to be IT support and asks for your password to "fix an issue". Or someone leaves a USB drive labeled "Payroll 2025" hoping an employee will plug it in.'
      },
      {
        heading: 'How to Protect Yourself',
        content: 'Always verify the identity of anyone requesting sensitive information. Follow your organization\'s security policies strictly. Never share passwords, even with IT staff.'
      }
    ],
    tips: [
      'Always verify identity before sharing any information',
      'Be suspicious of unsolicited requests, even from "colleagues"',
      'Never plug in unknown USB drives',
      'Report suspicious phone calls or visits to security',
    ]
  },
  2: {
    title: 'Password Security',
    color: 'bg-green-600',
    icon: '🔐',
    intro: 'Weak passwords are one of the easiest ways for attackers to gain access to systems. Strong password practices are your first line of defense.',
    sections: [
      {
        heading: 'What Makes a Strong Password?',
        content: 'A strong password is at least 12 characters long and includes uppercase letters, lowercase letters, numbers, and special characters. Avoid using names, birthdays, or common words.'
      },
      {
        heading: 'Password Mistakes to Avoid',
        content: 'Never reuse passwords across multiple accounts. Avoid simple patterns like "Password123". Do not store passwords in plain text files or sticky notes on your monitor.'
      },
      {
        heading: 'Using Password Managers',
        content: 'Password managers securely store and generate strong unique passwords for every account. This means you only need to remember one master password while staying fully protected.'
      }
    ],
    tips: [
      'Use a different password for every account',
      'Enable two-factor authentication wherever possible',
      'Use a trusted password manager like Bitwarden or 1Password',
      'Change passwords immediately if you suspect a breach',
    ]
  },
  3: {
    title: 'Malware & Ransomware',
    color: 'bg-red-600',
    icon: '🦠',
    intro: 'Malware is malicious software designed to damage, disrupt, or gain unauthorized access to systems. Ransomware is a dangerous type that encrypts your files and demands payment.',
    sections: [
      {
        heading: 'Types of Malware',
        content: 'Viruses attach to files and spread when opened. Trojans disguise themselves as legitimate software. Spyware secretly monitors your activity. Ransomware encrypts your data and demands a ransom to restore it.'
      },
      {
        heading: 'How Malware Spreads',
        content: 'Malware commonly spreads through email attachments, malicious downloads, infected USB drives, and compromised websites. Even legitimate-looking software can be bundled with malware.'
      },
      {
        heading: 'Prevention and Response',
        content: 'Keep your operating system and software updated. Use reputable antivirus software. Never download software from untrusted sources. If infected, disconnect from the network immediately and contact IT.'
      }
    ],
    tips: [
      'Never open email attachments from unknown senders',
      'Keep all software and OS updated at all times',
      'Back up your data regularly to an offline location',
      'Never pay a ransom — it does not guarantee file recovery',
    ]
  }
}

function ShieldCanvas() {
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

    // Floating shield shapes
    const shields = Array.from({ length: 10 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 20 + Math.random() * 35,
      speed: 0.15 + Math.random() * 0.2,
      alpha: 0.03 + Math.random() * 0.06,
      pulse: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.3,
    }))

    // Soft floating particles
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.18,
      dy: -0.1 - Math.random() * 0.2,
      alpha: Math.random() * 0.25 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    }))

    // Soft corner glows
    const glows = [
      { x: 0, y: 0, r: 280, color: '20,60,180', alpha: 0.07 },
      { x: window.innerWidth, y: window.innerHeight, r: 320, color: '60,20,180', alpha: 0.05 },
    ]

    const drawShield = (x, y, size, alpha) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.globalAlpha = alpha
      ctx.strokeStyle = 'rgba(80, 160, 255, 1)'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(0, -size)
      ctx.bezierCurveTo(size * 0.8, -size * 0.8, size * 0.8, size * 0.2, 0, size)
      ctx.bezierCurveTo(-size * 0.8, size * 0.2, -size * 0.8, -size * 0.8, 0, -size)
      ctx.stroke()
      // Inner glow fill
      ctx.globalAlpha = alpha * 0.3
      ctx.fillStyle = 'rgba(40, 100, 220, 1)'
      ctx.fill()
      ctx.restore()
    }

    let frame = 0

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background
      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      bg.addColorStop(0, '#030a1a')
      bg.addColorStop(0.5, '#050d22')
      bg.addColorStop(1, '#030810')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Corner glows
      glows.forEach((g) => {
        const grd = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r)
        grd.addColorStop(0, `rgba(${g.color}, ${g.alpha})`)
        grd.addColorStop(1, `rgba(${g.color}, 0)`)
        ctx.fillStyle = grd
        ctx.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2)
      })

      // Very faint grid
      ctx.strokeStyle = 'rgba(20, 60, 160, 0.045)'
      ctx.lineWidth = 0.5
      const spacing = 55
      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }

      // Floating shields
      shields.forEach((s) => {
        s.pulse += 0.008
        s.y -= s.speed
        s.x += s.drift
        if (s.y < -s.size * 2) {
          s.y = canvas.height + s.size
          s.x = Math.random() * canvas.width
        }
        if (s.x < -s.size) s.x = canvas.width + s.size
        if (s.x > canvas.width + s.size) s.x = -s.size
        const pulseAlpha = s.alpha + 0.02 * Math.sin(s.pulse)
        drawShield(s.x, s.y, s.size, pulseAlpha)
      })

      // Soft particles drifting upward
      particles.forEach((p) => {
        p.x += p.dx
        p.y += p.dy
        p.pulse += 0.02
        if (p.y < -5) {
          p.y = canvas.height + 5
          p.x = Math.random() * canvas.width
        }
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(100, 170, 255, ${p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))})`
        ctx.fill()
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

export default function TrainingModule() {
  const { id } = useParams()
  const navigate = useNavigate()
  const mod = moduleData[id] || moduleData[0]
  const [tipsChecked, setTipsChecked] = useState([])

  const toggleTip = (i) => {
    setTipsChecked(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    )
  }

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
      <ShieldCanvas />

      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between sticky top-0" style={{ ...navStyle, zIndex: 20 }}>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="CyberShield" className="w-9 h-9" />
          <span className="font-bold text-lg"
            style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CyberShield
          </span>
        </div>
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 relative" style={{ zIndex: 10 }}>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`${mod.color} text-4xl w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg`}>
            {mod.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{mod.title}</h1>
            <p className="text-blue-300 mt-1 opacity-70">Training Module</p>
          </div>
        </div>

        {/* Intro */}
        <div className="rounded-xl p-6 mb-6" style={cardStyle}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-blue-400">Overview</span>
          </div>
          <p className="text-gray-300 leading-relaxed">{mod.intro}</p>
        </div>

        {/* Sections */}
        {mod.sections.map((section, i) => (
          <div key={i} className="rounded-xl p-6 mb-4" style={cardStyle}>
            <h3 className="font-semibold text-lg mb-3 text-white">{section.heading}</h3>
            <p className="text-gray-300 leading-relaxed">{section.content}</p>
          </div>
        ))}

        {/* Tips Checklist */}
        <div className="rounded-xl p-6 mb-6" style={cardStyle}>
          <h3 className="font-semibold text-lg mb-4 text-white">Key Tips — Check each one as you review</h3>
          <div className="space-y-3">
            {mod.tips.map((tip, i) => (
              <div key={i} onClick={() => toggleTip(i)}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition"
                style={tipsChecked.includes(i)
                  ? { background: 'rgba(20,80,40,0.6)', border: '1px solid rgba(60,180,80,0.4)' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(40,90,200,0.2)' }}>
                <CheckCircle className={`w-5 h-5 flex-shrink-0 ${tipsChecked.includes(i) ? 'text-green-400' : 'text-gray-600'}`} />
                <span className={`text-sm ${tipsChecked.includes(i) ? 'text-green-300' : 'text-gray-300'}`}>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => navigate('/ai-chat')}
            className="text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', boxShadow: '0 0 20px rgba(109,40,217,0.4)' }}>
            <Brain className="w-5 h-5" />
            Practice with AI
          </button>
          <button onClick={() => navigate(`/quiz?module=${encodeURIComponent(mod.title)}`)}
            className="text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>
            <Trophy className="w-5 h-5" />
            Take the Quiz
          </button>
        </div>

      </div>
    </div>
  )
}
