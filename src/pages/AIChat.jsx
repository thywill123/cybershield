import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Trophy, RotateCcw, Loader } from 'lucide-react'

function RadarCanvas() {
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

    let angle = 0
    const sweepLength = Math.PI * 0.6

    const blips = Array.from({ length: 14 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      alpha: 0,
      r: Math.random() * 3 + 1.5,
      color: Math.random() > 0.6 ? '255,80,80' : '80,220,120',
    }))

    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.4,
      dx: (Math.random() - 0.5) * 0.18,
      dy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.2 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    }))

    const scanLines = Array.from({ length: 3 }, (_, i) => ({
      y: (window.innerHeight / 3) * i + Math.random() * 80,
      speed: 0.3 + Math.random() * 0.3,
      alpha: 0.025 + Math.random() * 0.02,
      width: 50 + Math.random() * 60,
    }))

    const glows = [
      { x: 0, y: 0, r: 260, color: '20,60,180', alpha: 0.06 },
      { x: window.innerWidth, y: window.innerHeight, r: 300, color: '60,20,180', alpha: 0.05 },
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

      const rx = 130, ry = canvas.height - 130, rr = 110
      for (let ring = 1; ring <= 4; ring++) {
        ctx.beginPath()
        ctx.arc(rx, ry, (rr / 4) * ring, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0, 180, 100, ${0.08 - ring * 0.01})`
        ctx.lineWidth = 0.8; ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(0, 180, 100, 0.08)'
      ctx.lineWidth = 0.6
      ctx.beginPath(); ctx.moveTo(rx - rr, ry); ctx.lineTo(rx + rr, ry); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(rx, ry - rr); ctx.lineTo(rx, ry + rr); ctx.stroke()

      angle += 0.012
      for (let t = 0; t < 30; t++) {
        const trailAngle = angle - (t / 30) * sweepLength
        const alpha = (1 - t / 30) * 0.18
        ctx.beginPath(); ctx.moveTo(rx, ry)
        ctx.arc(rx, ry, rr, trailAngle, trailAngle + 0.04)
        ctx.closePath()
        ctx.fillStyle = `rgba(0, 220, 100, ${alpha})`; ctx.fill()
      }
      ctx.beginPath(); ctx.moveTo(rx, ry)
      ctx.lineTo(rx + Math.cos(angle) * rr, ry + Math.sin(angle) * rr)
      ctx.strokeStyle = 'rgba(0, 255, 120, 0.7)'; ctx.lineWidth = 1.5; ctx.stroke()

      ctx.save()
      ctx.beginPath(); ctx.arc(rx, ry, rr, 0, Math.PI * 2); ctx.clip()
      blips.forEach((b) => {
        const bAngle = Math.atan2(b.y - ry, b.x - rx)
        let diff = ((angle - bAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)
        if (diff < 0.1) b.alpha = 1
        b.alpha *= 0.985
        if (b.alpha > 0.05) {
          const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 3)
          grd.addColorStop(0, `rgba(${b.color}, ${b.alpha})`)
          grd.addColorStop(1, `rgba(${b.color}, 0)`)
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 3, 0, Math.PI * 2)
          ctx.fillStyle = grd; ctx.fill()
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${b.color}, ${b.alpha})`; ctx.fill()
        }
      })
      ctx.restore()

      ctx.beginPath(); ctx.arc(rx, ry, rr, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(0, 180, 100, 0.2)'; ctx.lineWidth = 1; ctx.stroke()

      const rx2 = canvas.width - 100, ry2 = 100, rr2 = 70, angle2 = angle * 0.7
      for (let ring = 1; ring <= 3; ring++) {
        ctx.beginPath(); ctx.arc(rx2, ry2, (rr2 / 3) * ring, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(60, 100, 255, ${0.06 - ring * 0.01})`
        ctx.lineWidth = 0.6; ctx.stroke()
      }
      for (let t = 0; t < 25; t++) {
        const trailAngle = angle2 - (t / 25) * sweepLength
        const alpha = (1 - t / 25) * 0.12
        ctx.beginPath(); ctx.moveTo(rx2, ry2)
        ctx.arc(rx2, ry2, rr2, trailAngle, trailAngle + 0.05)
        ctx.closePath(); ctx.fillStyle = `rgba(60, 120, 255, ${alpha})`; ctx.fill()
      }
      ctx.beginPath(); ctx.moveTo(rx2, ry2)
      ctx.lineTo(rx2 + Math.cos(angle2) * rr2, ry2 + Math.sin(angle2) * rr2)
      ctx.strokeStyle = 'rgba(80, 140, 255, 0.5)'; ctx.lineWidth = 1; ctx.stroke()
      ctx.beginPath(); ctx.arc(rx2, ry2, rr2, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(60, 100, 255, 0.15)'; ctx.lineWidth = 0.8; ctx.stroke()

      scanLines.forEach((sl) => {
        sl.y += sl.speed
        if (sl.y > canvas.height) sl.y = -sl.width
        const grad = ctx.createLinearGradient(0, sl.y, 0, sl.y + sl.width)
        grad.addColorStop(0, `rgba(0, 140, 255, 0)`)
        grad.addColorStop(0.5, `rgba(0, 140, 255, ${sl.alpha})`)
        grad.addColorStop(1, `rgba(0, 140, 255, 0)`)
        ctx.fillStyle = grad; ctx.fillRect(0, sl.y, canvas.width, sl.width)
      })

      particles.forEach((p) => {
        p.x += p.dx; p.y += p.dy; p.pulse += 0.02
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(80, 150, 255, ${p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))})`
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

  return (
    <canvas ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />
  )
}

const MODULE_INDEX = {
  'Phishing Awareness': 0,
  'Social Engineering': 1,
  'Password Security': 2,
  'Malware & Ransomware': 3,
}

// Strict topic definitions — AI must ONLY generate questions on this exact topic
const MODULE_TOPICS = {
  'Phishing Awareness': {
    topic: 'phishing emails, fake websites, email spoofing, suspicious links, and email-based scams',
    forbidden: 'Do NOT include questions about passwords, malware, social engineering manipulation, USB drives, or any other cybersecurity topic.',
  },
  'Social Engineering': {
    topic: 'social engineering tactics such as pretexting, baiting, tailgating, vishing (voice phishing), impersonation, and psychological manipulation by attackers',
    forbidden: 'Do NOT include questions about email phishing, passwords, malware, ransomware, or any other cybersecurity topic.',
  },
  'Password Security': {
    topic: 'password creation, password strength, password managers, two-factor authentication, password reuse, and credential security',
    forbidden: 'Do NOT include questions about phishing emails, malware, social engineering, USB drives, or any other cybersecurity topic.',
  },
  'Malware & Ransomware': {
    topic: 'malware types (viruses, trojans, spyware, ransomware), how malware spreads, malware prevention, antivirus software, and ransomware attacks',
    forbidden: 'Do NOT include questions about phishing emails, passwords, social engineering manipulation, or any other cybersecurity topic.',
  },
}

// Different scenario contexts to rotate — ensures variety each attempt
const scenarioContexts = [
  'Set all scenarios in a typical office workplace environment.',
  'Set all scenarios in a remote work or work-from-home environment.',
  'Set all scenarios involving a hospital or healthcare workplace.',
  'Set all scenarios involving a bank or financial institution.',
  'Set all scenarios involving a university or educational institution.',
]

export default function Quiz() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const moduleName = searchParams.get('module') || 'Cybersecurity Awareness'

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [answers, setAnswers] = useState([])
  const [error, setError] = useState('')
  const [attemptCount, setAttemptCount] = useState(0)

  const generateQuestions = async () => {
    setLoading(true)
    setError('')

    const moduleInfo = MODULE_TOPICS[moduleName] || {
      topic: moduleName,
      forbidden: 'Do NOT include questions about any other cybersecurity topic.',
    }

    // Rotate scenario context each attempt for variety
    const context = scenarioContexts[attemptCount % scenarioContexts.length]

    // Unique seed to prevent caching or repetition
    const seed = Date.now()

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
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `You are a cybersecurity quiz generator. Generate exactly 5 multiple choice quiz questions STRICTLY about: ${moduleInfo.topic}.

STRICT RULES — YOU MUST FOLLOW THESE:
1. ${moduleInfo.forbidden}
2. Every single question MUST be directly and only about ${moduleName}.
3. ${context}
4. All 5 questions must be completely different from each other.
5. Use session ID ${seed} — generate questions that have NEVER appeared before.
6. Each question must be a realistic workplace scenario for a non-technical employee.

Return ONLY a valid JSON array with no extra text, markdown, or explanation. Use this exact format:
[
  {
    "question": "Scenario question strictly about ${moduleName}?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Why this answer is correct in the context of ${moduleName}."
  }
]

The "correct" field is the index (0-3) of the correct answer in the options array.`
          }]
        })
      })

      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      const cleaned = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      setQuestions(parsed)
      setStarted(true)
    } catch (err) {
      setError('Failed to generate questions. Please check your API key and try again.')
    }
    setLoading(false)
  }

  const handleSelect = (i) => {
    if (answered) return
    setSelected(i)
    setAnswered(true)
    const correct = i === questions[current].correct
    if (correct) setScore(s => s + 1)
    setAnswers(prev => [...prev, { correct }])
  }

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true)
      saveProgress()
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  const saveProgress = () => {
    const percentage = Math.round((score / questions.length) * 100)
    const points = score * 50
    const existing = JSON.parse(localStorage.getItem('cybershield_progress') || '{}')
    const existingStats = JSON.parse(localStorage.getItem('cybershield_stats') || '{"totalPoints":0,"aiSessions":0,"modulesDone":0}')
    const moduleIdx = MODULE_INDEX[moduleName]
    const oldProgress = existing[moduleIdx] || 0
    existing[moduleIdx] = Math.max(oldProgress, percentage)
    existingStats.totalPoints = (existingStats.totalPoints || 0) + points
    existingStats.modulesDone = Object.values(existing).filter(v => v > 0).length
    localStorage.setItem('cybershield_progress', JSON.stringify(existing))
    localStorage.setItem('cybershield_stats', JSON.stringify(existingStats))
  }

  const handleRetry = () => {
    setCurrent(0); setSelected(null); setAnswered(false)
    setScore(0); setFinished(false); setAnswers([])
    setStarted(false); setQuestions([])
    setAttemptCount(c => c + 1) // increments so next attempt gets different context
  }

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0
  const points = score * 50

  const cardStyle = {
    background: 'rgba(8, 18, 45, 0.82)',
    backdropFilter: 'blur(14px)',
    border: '1px solid rgba(40, 90, 200, 0.22)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
  }

  const navStyle = {
    background: 'rgba(4, 10, 28, 0.90)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(30, 70, 180, 0.2)',
  }

  return (
    <div className="min-h-screen text-white relative">
      <RadarCanvas />

      <nav className="px-6 py-4 flex items-center justify-between sticky top-0"
        style={{ ...navStyle, zIndex: 20, position: 'relative' }}>
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

      <div className="max-w-2xl mx-auto px-6 py-8" style={{ position: 'relative', zIndex: 10 }}>

        {/* Start Screen */}
        {!started && !loading && (
          <div className="rounded-2xl p-8 text-center" style={cardStyle}>
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-2 text-white">{moduleName} Quiz</h2>
            <p className="text-gray-400 mb-2">5 AI-generated scenario questions</p>
            <p className="text-gray-400 text-sm mb-6">
              All questions are strictly about <span className="text-blue-400 font-medium">{moduleName}</span> only
            </p>
            {attemptCount > 0 && (
              <p className="text-green-400 text-xs mb-4">✓ Fresh unique questions will be generated for this attempt</p>
            )}
            {error && (
              <div className="rounded-xl p-4 mb-6 text-red-300 text-sm"
                style={{ background: 'rgba(120,20,20,0.5)', border: '1px solid rgba(200,60,60,0.4)' }}>
                {error}
              </div>
            )}
            <button onClick={generateQuestions}
              className="w-full text-white font-semibold py-3 rounded-xl transition hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb, #7c3aed)', boxShadow: '0 0 25px rgba(37,99,235,0.4)' }}>
              {attemptCount > 0 ? 'Generate New Questions & Start' : 'Generate Questions & Start Quiz'}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl p-8 text-center" style={cardStyle}>
            <Loader className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">Claude AI is generating your questions...</p>
            <p className="text-gray-400 text-sm mt-2">
              Creating fresh <span className="text-blue-400">{moduleName}</span> questions
            </p>
          </div>
        )}

        {/* Questions */}
        {started && !finished && questions.length > 0 && (
          <>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Question {current + 1} of {questions.length}</span>
                <span>Score: {score}</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-2 rounded-full transition-all"
                  style={{ width: `${((current + 1) / questions.length) * 100}%`, background: 'linear-gradient(90deg, #2563eb, #7c3aed)' }} />
              </div>
            </div>

            <div className="rounded-xl p-6 mb-4" style={cardStyle}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)', color: '#60a5fa' }}>
                  {moduleName}
                </span>
              </div>
              <h2 className="text-lg font-semibold leading-relaxed text-white">{questions[current].question}</h2>
            </div>

            <div className="space-y-3 mb-4">
              {questions[current].options.map((opt, i) => {
                let style = { ...cardStyle, cursor: 'pointer' }
                let textColor = 'text-gray-300'
                if (answered) {
                  if (i === questions[current].correct) {
                    style = { background: 'rgba(20,80,40,0.7)', border: '1px solid rgba(60,180,80,0.5)', backdropFilter: 'blur(14px)', boxShadow: '0 0 15px rgba(60,180,80,0.15)' }
                    textColor = 'text-green-300'
                  } else if (i === selected) {
                    style = { background: 'rgba(100,20,20,0.7)', border: '1px solid rgba(200,60,60,0.5)', backdropFilter: 'blur(14px)', boxShadow: '0 0 15px rgba(200,60,60,0.15)' }
                    textColor = 'text-red-300'
                  } else {
                    style = { ...cardStyle, opacity: 0.4 }
                  }
                }
                return (
                  <div key={i} onClick={() => handleSelect(i)}
                    className={`rounded-xl px-4 py-3 flex items-center gap-3 transition ${textColor}`}
                    style={style}>
                    {answered && i === questions[current].correct && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
                    {answered && i === selected && i !== questions[current].correct && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                    {(!answered || (i !== questions[current].correct && i !== selected)) && (
                      <div className="w-5 h-5 rounded-full border border-gray-600 flex-shrink-0" />
                    )}
                    <span className="text-sm">{opt}</span>
                  </div>
                )
              })}
            </div>

            {answered && (
              <div className="rounded-xl p-4 mb-4"
                style={{ background: 'rgba(10,30,80,0.7)', border: '1px solid rgba(60,120,255,0.3)', backdropFilter: 'blur(12px)' }}>
                <p className="text-blue-300 text-sm">
                  <span className="font-semibold">Explanation: </span>
                  {questions[current].explanation}
                </p>
              </div>
            )}

            {answered && (
              <button onClick={handleNext}
                className="w-full text-white font-semibold py-3 rounded-xl transition hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb, #7c3aed)', boxShadow: '0 0 25px rgba(37,99,235,0.35)' }}>
                {current + 1 >= questions.length ? 'See Results' : 'Next Question →'}
              </button>
            )}
          </>
        )}

        {/* Results */}
        {finished && (
          <div className="text-center">
            <div className="rounded-2xl p-8 mb-6" style={cardStyle}>
              <div className="text-6xl mb-4">
                {percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '📚'}
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">
                {percentage >= 80 ? 'Excellent Work!' : percentage >= 50 ? 'Good Effort!' : 'Keep Practicing!'}
              </h2>
              <p className="text-gray-400 mb-6">
                {percentage >= 80 ? 'You have a strong understanding of this topic!'
                  : percentage >= 50 ? 'Review the module and try again.'
                  : 'Go back and read the module carefully.'}
              </p>
              <div className="w-32 h-32 rounded-full flex flex-col items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', boxShadow: '0 0 30px rgba(37,99,235,0.4)' }}>
                <span className="text-3xl font-bold text-white">{percentage}%</span>
                <span className="text-blue-200 text-sm">{score}/{questions.length}</span>
              </div>
              <div className="rounded-xl p-4 mb-6"
                style={{ background: 'rgba(80,60,0,0.5)', border: '1px solid rgba(200,160,0,0.35)', backdropFilter: 'blur(12px)' }}>
                <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <p className="text-yellow-300 font-semibold">+{points} Points Earned!</p>
              </div>
              <div className="flex justify-center gap-2 mb-2">
                {answers.map((a, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center ${a.correct ? 'bg-green-600' : 'bg-red-600'}`}>
                    {a.correct ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleRetry}
                className="text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition hover:opacity-90"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
              <button onClick={() => navigate('/dashboard')}
                className="text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', boxShadow: '0 0 20px rgba(37,99,235,0.35)' }}>
                <Trophy className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
