import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Bot, User, Loader } from 'lucide-react'
import useSessionTimeout from '../hooks/useSessionTimeout'

const systemPrompt = `You are CyberShield AI, an expert cybersecurity awareness trainer for institutional employees.

You specialize in:
- Phishing attacks and how to identify them
- Social engineering tactics and manipulation
- Password security best practices
- Malware and ransomware prevention
- Safe internet and email practices

Your role is to:
- Simulate realistic cybersecurity threat scenarios
- Ask the user how they would respond to threats
- Give clear feedback on whether their response was correct
- Explain why certain actions are dangerous or safe
- Always be encouraging, clear, and practical
- Keep explanations simple for non-technical employees

Never provide harmful or malicious information. Always promote safe cybersecurity practices.`

function WaveCanvas() {
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

    const ripples = []
    const rippleInterval = setInterval(() => {
      ripples.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 0,
        alpha: 0.25,
        color: Math.random() > 0.5 ? '60,140,255' : '100,60,220',
      })
    }, 1200)

    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.4,
      dx: (Math.random() - 0.5) * 0.15,
      dy: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.18 + 0.04,
      pulse: Math.random() * Math.PI * 2,
    }))

    const waves = Array.from({ length: 4 }, (_, i) => ({
      offset: i * 1.8,
      speed: 0.012 + i * 0.004,
      amplitude: 5 + i * 2,
      y: canvas.height - 50 - i * 22,
      alpha: 0.07 - i * 0.012,
      color: i % 2 === 0 ? '80,160,255' : '120,80,220',
    }))

    const glows = [
      { x: 0, y: 0, r: 280, color: '20,60,200', alpha: 0.06 },
      { x: window.innerWidth, y: window.innerHeight, r: 300, color: '60,20,200', alpha: 0.05 },
      { x: window.innerWidth, y: 0, r: 220, color: '40,20,180', alpha: 0.04 },
    ]

    let frame = 0

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      bg.addColorStop(0, '#030a1a')
      bg.addColorStop(0.5, '#050d22')
      bg.addColorStop(1, '#030810')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      glows.forEach((g) => {
        const grd = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r)
        grd.addColorStop(0, `rgba(${g.color}, ${g.alpha})`)
        grd.addColorStop(1, `rgba(${g.color}, 0)`)
        ctx.fillStyle = grd
        ctx.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2)
      })

      ctx.strokeStyle = 'rgba(20, 60, 160, 0.045)'
      ctx.lineWidth = 0.5
      const spacing = 55
      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]
        rp.r += 1.2
        rp.alpha -= 0.005
        if (rp.alpha <= 0) { ripples.splice(i, 1); continue }
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${rp.color}, ${rp.alpha})`
        ctx.lineWidth = 1.2
        ctx.stroke()
        if (rp.r > 15) {
          ctx.beginPath()
          ctx.arc(rp.x, rp.y, rp.r * 0.55, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${rp.color}, ${rp.alpha * 0.3})`
          ctx.lineWidth = 0.7
          ctx.stroke()
        }
      }

      waves.forEach((wave) => {
        ctx.beginPath()
        for (let x = 0; x <= canvas.width; x += 3) {
          const y = wave.y + Math.sin((x * 0.012) + frame * wave.speed + wave.offset) * wave.amplitude
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(${wave.color}, ${wave.alpha})`
        ctx.lineWidth = 1
        ctx.stroke()
      })

      particles.forEach((p) => {
        p.x += p.dx
        p.y += p.dy
        p.pulse += 0.018
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
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(60, 120, 220, ${0.05 * (1 - dist / 100)})`
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
      clearInterval(rippleInterval)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full" style={{ zIndex: 0 }} />
}

export default function AIChat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am CyberShield AI, your personal cybersecurity trainer.\n\nI can help you:\n- Practice spotting phishing emails\n- Recognize social engineering attacks\n- Learn password best practices\n- Understand malware threats\n\nTry asking me:\n"Show me a phishing email example"\n"Test me on social engineering"\n"How do I create a strong password?"`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const bottomRef = useRef(null)

  // ✅ Session timeout — 30 minutes of inactivity
  useSessionTimeout()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    setSessionCount(c => c + 1)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await response.json()
      const reply = data.content?.[0]?.text || 'Sorry, I could not get a response. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error. Please check your API key in the .env file and try again.'
      }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
  }

  const suggestions = [
    'Show me a phishing email example',
    'Test me on social engineering',
    'How do I create a strong password?',
    'What should I do if I clicked a suspicious link?',
  ]

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Hello! I am CyberShield AI, your personal cybersecurity trainer.\n\nI can help you:\n- Practice spotting phishing emails\n- Recognize social engineering attacks\n- Learn password best practices\n- Understand malware threats\n\nTry asking me:\n"Show me a phishing email example"\n"Test me on social engineering"\n"How do I create a strong password?"`
    }])
    setSessionCount(0)
  }

  const navStyle = {
    background: 'rgba(4, 10, 28, 0.92)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(30, 70, 180, 0.2)',
  }

  const cardStyle = {
    background: 'rgba(8, 18, 45, 0.80)',
    backdropFilter: 'blur(14px)',
    border: '1px solid rgba(40, 90, 200, 0.22)',
  }

  return (
    <div className="min-h-screen text-white flex flex-col relative">
      <WaveCanvas />

      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between sticky top-0" style={{ ...navStyle, zIndex: 20 }}>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="CyberShield" className="w-9 h-9" />
          <span className="font-bold text-lg"
            style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CyberShield
          </span>
        </div>
        <div className="flex items-center gap-4">
          {sessionCount > 0 && (
            <span className="text-blue-300 text-sm opacity-60">{sessionCount} message{sessionCount > 1 ? 's' : ''} sent</span>
          )}
          <button onClick={clearChat} className="text-gray-400 hover:text-white text-sm transition">
            Clear chat
          </button>
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* Chat Area */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col relative" style={{ zIndex: 10 }}>

        {/* Messages */}
        <div className="flex-1 space-y-4 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', boxShadow: '0 0 12px rgba(37,99,235,0.4)' }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                style={msg.role === 'user'
                  ? { background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow: '0 0 15px rgba(37,99,235,0.3)', color: 'white' }
                  : { ...cardStyle, color: '#d1d5db' }}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', boxShadow: '0 0 12px rgba(37,99,235,0.4)' }}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2" style={cardStyle}>
                <Loader className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-gray-400 text-sm">CyberShield AI is thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => setInput(s)}
                className="text-gray-300 text-xs px-3 py-2 rounded-lg text-left transition hover:border-blue-400"
                style={cardStyle}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={cardStyle}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about cybersecurity or request a scenario..."
            className="bg-transparent text-white flex-1 outline-none text-sm placeholder-gray-500"
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            className="p-2 rounded-xl transition disabled:opacity-40 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', boxShadow: '0 0 15px rgba(37,99,235,0.35)' }}>
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-center text-gray-700 text-xs mt-2">Press Enter to send</p>
      </div>
    </div>
  )
}
