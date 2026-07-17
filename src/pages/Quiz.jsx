import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, Trophy, RotateCcw, Loader } from 'lucide-react'
import { doc, updateDoc, addDoc, collection, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import useSessionTimeout from '../hooks/useSessionTimeout'

function RadarCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); let animationId
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    let angle = 0; const sweepLength = Math.PI * 0.6
    const blips = Array.from({ length: 14 }, () => ({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, alpha: 0, r: Math.random() * 3 + 1.5, color: Math.random() > 0.6 ? '255,80,80' : '80,220,120' }))
    const particles = Array.from({ length: 35 }, () => ({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, r: Math.random() * 1.5 + 0.4, dx: (Math.random() - 0.5) * 0.18, dy: (Math.random() - 0.5) * 0.18, alpha: Math.random() * 0.2 + 0.05, pulse: Math.random() * Math.PI * 2 }))
    const scanLines = Array.from({ length: 3 }, (_, i) => ({ y: (window.innerHeight / 3) * i, speed: 0.3 + Math.random() * 0.3, alpha: 0.025, width: 50 + Math.random() * 60 }))
    const glows = [{ x: 0, y: 0, r: 260, color: '20,60,180', alpha: 0.06 }, { x: window.innerWidth, y: window.innerHeight, r: 300, color: '60,20,180', alpha: 0.05 }]
    let frame = 0
    const draw = () => {
      frame++; ctx.clearRect(0, 0, canvas.width, canvas.height)
      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height); bg.addColorStop(0, '#030a1a'); bg.addColorStop(1, '#030810'); ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height)
      glows.forEach(g => { const grd = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r); grd.addColorStop(0, `rgba(${g.color},${g.alpha})`); grd.addColorStop(1, `rgba(${g.color},0)`); ctx.fillStyle = grd; ctx.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2) })
      ctx.strokeStyle = 'rgba(20,60,160,0.045)'; ctx.lineWidth = 0.5
      for (let x = 0; x < canvas.width; x += 55) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke() }
      for (let y = 0; y < canvas.height; y += 55) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke() }
      const rx = 130, ry = canvas.height - 130, rr = 110
      for (let ring = 1; ring <= 4; ring++) { ctx.beginPath(); ctx.arc(rx, ry, (rr / 4) * ring, 0, Math.PI * 2); ctx.strokeStyle = `rgba(0,180,100,${0.08 - ring * 0.01})`; ctx.lineWidth = 0.8; ctx.stroke() }
      angle += 0.012
      for (let t = 0; t < 30; t++) { ctx.beginPath(); ctx.moveTo(rx, ry); ctx.arc(rx, ry, rr, angle - (t / 30) * sweepLength, angle - (t / 30) * sweepLength + 0.04); ctx.closePath(); ctx.fillStyle = `rgba(0,220,100,${(1 - t / 30) * 0.18})`; ctx.fill() }
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + Math.cos(angle) * rr, ry + Math.sin(angle) * rr); ctx.strokeStyle = 'rgba(0,255,120,0.7)'; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.save(); ctx.beginPath(); ctx.arc(rx, ry, rr, 0, Math.PI * 2); ctx.clip()
      blips.forEach(b => { const ba = Math.atan2(b.y - ry, b.x - rx); const diff = ((angle - ba) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2); if (diff < 0.1) b.alpha = 1; b.alpha *= 0.985; if (b.alpha > 0.05) { const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 3); grd.addColorStop(0, `rgba(${b.color},${b.alpha})`); grd.addColorStop(1, `rgba(${b.color},0)`); ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 3, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill(); ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(${b.color},${b.alpha})`; ctx.fill() } })
      ctx.restore(); ctx.beginPath(); ctx.arc(rx, ry, rr, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(0,180,100,0.2)'; ctx.lineWidth = 1; ctx.stroke()
      const rx2 = canvas.width - 100, ry2 = 100, rr2 = 70, a2 = angle * 0.7
      for (let t = 0; t < 25; t++) { ctx.beginPath(); ctx.moveTo(rx2, ry2); ctx.arc(rx2, ry2, rr2, a2 - (t / 25) * sweepLength, a2 - (t / 25) * sweepLength + 0.05); ctx.closePath(); ctx.fillStyle = `rgba(60,120,255,${(1 - t / 25) * 0.12})`; ctx.fill() }
      ctx.beginPath(); ctx.moveTo(rx2, ry2); ctx.lineTo(rx2 + Math.cos(a2) * rr2, ry2 + Math.sin(a2) * rr2); ctx.strokeStyle = 'rgba(80,140,255,0.5)'; ctx.lineWidth = 1; ctx.stroke()
      ctx.beginPath(); ctx.arc(rx2, ry2, rr2, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(60,100,255,0.15)'; ctx.lineWidth = 0.8; ctx.stroke()
      scanLines.forEach(sl => { sl.y += sl.speed; if (sl.y > canvas.height) sl.y = -sl.width; const gr = ctx.createLinearGradient(0, sl.y, 0, sl.y + sl.width); gr.addColorStop(0, 'rgba(0,140,255,0)'); gr.addColorStop(0.5, `rgba(0,140,255,${sl.alpha})`); gr.addColorStop(1, 'rgba(0,140,255,0)'); ctx.fillStyle = gr; ctx.fillRect(0, sl.y, canvas.width, sl.width) })
      particles.forEach(p => { p.x += p.dx; p.y += p.dy; p.pulse += 0.02; if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0; if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(80,150,255,${p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))})`; ctx.fill() })
      animationId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />
}

const MODULE_INDEX = { 'Phishing Awareness': 0, 'Social Engineering': 1, 'Password Security': 2, 'Malware & Ransomware': 3 }

const MODULE_TOPICS = {
  'Phishing Awareness': {
    topic: 'phishing emails, fake websites, email spoofing, suspicious links, and email-based scams',
    forbidden: 'Do NOT include questions about passwords, malware, social engineering manipulation, USB drives, or any other cybersecurity topic.',
    threats: 'Recent emerging phishing threats include: AI-generated phishing emails that mimic real colleagues, QR code phishing (quishing), deepfake voice phishing calls, and phishing attacks targeting cloud service accounts like Microsoft 365 and Google Workspace.'
  },
  'Social Engineering': {
    topic: 'social engineering tactics such as pretexting, baiting, tailgating, vishing, impersonation, and psychological manipulation by attackers',
    forbidden: 'Do NOT include questions about email phishing, passwords, malware, ransomware, or any other cybersecurity topic.',
    threats: 'Recent emerging social engineering threats include: AI-powered deepfake video calls impersonating executives (CEO fraud), WhatsApp and SMS-based social engineering attacks, attackers impersonating IT helpdesk staff via Microsoft Teams or Slack, and fake job offer social engineering scams.'
  },
  'Password Security': {
    topic: 'password creation, password strength, password managers, two-factor authentication, password reuse, and credential security',
    forbidden: 'Do NOT include questions about phishing emails, malware, social engineering, USB drives, or any other cybersecurity topic.',
    threats: 'Recent emerging password threats include: credential stuffing attacks using leaked password databases, SIM swapping attacks to bypass SMS-based 2FA, adversary-in-the-middle attacks bypassing authenticator apps, and password spraying attacks targeting corporate accounts.'
  },
  'Malware & Ransomware': {
    topic: 'malware types (viruses, trojans, spyware, ransomware), how malware spreads, malware prevention, antivirus software, and ransomware attacks',
    forbidden: 'Do NOT include questions about phishing emails, passwords, social engineering manipulation, or any other cybersecurity topic.',
    threats: 'Recent emerging malware threats include: ransomware-as-a-service (RaaS) attacks targeting hospitals and schools, info-stealing malware hidden in free software downloads, malicious browser extensions stealing credentials, and fileless malware that operates in memory without leaving traces on disk.'
  },
}

const scenarioContexts = [
  'Set all scenarios in a typical office workplace environment.',
  'Set all scenarios in a remote work or work-from-home environment.',
  'Set all scenarios involving a hospital or healthcare workplace.',
  'Set all scenarios involving a bank or financial institution.',
  'Set all scenarios involving a university or educational institution.',
]

// Offline fallback questions — used automatically if AI generation fails or
// times out, so the quiz never dead-ends on an error screen (e.g. during a
// live demo with unreliable network/API conditions).
const FALLBACK_QUESTIONS = {
  'Phishing Awareness': [
    { question: 'You receive an email that looks like it is from your IT department asking you to "verify" your login by clicking a link. What should you do first?', options: ['Click the link immediately since it looks official', 'Check the sender\'s actual email address and hover over the link before doing anything', 'Reply with your username and password', 'Forward it to a coworker to ask if it is real'], correct: 1, explanation: 'Always verify the sender address and link destination before clicking — spoofed emails often look identical to real ones.', isEmergingThreat: false },
    { question: 'A colleague forwards you a QR code in a Slack message, saying it leads to the new HR benefits portal. What is the safest action?', options: ['Scan it right away to save time', 'Ignore it completely and never check', 'Verify the request through a known HR contact or the official company portal before scanning', 'Scan it but only on your phone, not your laptop'], correct: 2, explanation: 'QR code phishing ("quishing") hides malicious links behind a scan — always verify through a trusted channel first.', isEmergingThreat: true },
    { question: 'You get a voicemail that sounds exactly like your CEO, urgently asking you to purchase gift cards for a "client emergency." What should raise suspicion?', options: ['Nothing, the voice sounds real so it must be legitimate', 'The urgency and unusual request combined with an AI-cloned voice are classic red flags', 'CEOs never call employees directly', 'Gift cards are a normal business expense'], correct: 1, explanation: 'AI voice-cloning is now used in phishing scams; unusual urgency plus an out-of-process request (gift cards) should always be verified independently.', isEmergingThreat: true },
    { question: 'An email claims your Microsoft 365 account will be suspended in 1 hour unless you log in via a provided link. What is the best response?', options: ['Log in immediately through the link to prevent suspension', 'Go directly to portal.office.com by typing it yourself instead of using the link', 'Ignore it and delete the account', 'Reply asking for more time'], correct: 1, explanation: 'Urgency plus a login link is a hallmark of cloud-account phishing — always navigate to services directly rather than through email links.', isEmergingThreat: true },
    { question: 'You notice a link in an email displays "www.paypal.com" but hovering over it shows a completely different URL. What does this indicate?', options: ['A normal formatting quirk', 'A likely phishing attempt using a masked/spoofed link', 'The email client is broken', 'Nothing to worry about'], correct: 1, explanation: 'Mismatched display text and actual URL is one of the most reliable signs of a phishing link.', isEmergingThreat: false },
    { question: 'Your bank sends a text with a link to "confirm a suspicious transaction." You did not initiate any transaction. What should you do?', options: ['Click the link to check details', 'Call your bank directly using the number on your card or official website, not the one in the text', 'Reply STOP to the message', 'Ignore it — banks never contact customers'], correct: 1, explanation: 'Smishing (SMS phishing) often impersonates banks; always verify through a known, independently-sourced contact channel.', isEmergingThreat: false },
  ],
  'Social Engineering': [
    { question: 'Someone in a delivery uniform asks you to hold the secure office door open because their hands are full. What is the safest response?', options: ['Hold the door — they look legitimate', 'Politely ask them to check in at reception/security instead', 'Ignore them completely', 'Ask for their ID but let them in anyway'], correct: 1, explanation: 'This is "tailgating" — a common social engineering tactic. Legitimate visitors should always check in through proper channels.', isEmergingThreat: false },
    { question: 'You get a Microsoft Teams message from someone claiming to be IT support asking you to install a "remote access tool" to fix an issue you never reported.', options: ['Install it right away since it is IT', 'Verify through a separate, known channel (e.g. calling the IT helpdesk directly) before taking any action', 'Ignore all IT messages from now on', 'Ask a coworker to install it instead'], correct: 1, explanation: 'Attackers increasingly impersonate IT helpdesk staff over Teams/Slack to gain remote access — always verify independently.', isEmergingThreat: true },
    { question: 'A video call "from the CEO" asks you to urgently wire funds to a new vendor account, and the video looks and sounds real.', options: ['Process the wire immediately since it is the CEO', 'Verify the request through an established, separate process (e.g. a callback to a known number) before acting', 'Ask a coworker on the call to confirm', 'Assume it is fine because video calls cannot be faked'], correct: 1, explanation: 'Deepfake video/audio impersonation of executives ("CEO fraud") is a growing threat — financial requests should always go through verified out-of-band confirmation.', isEmergingThreat: true },
    { question: 'You receive a WhatsApp message from an unknown number claiming to be a new manager, asking for confidential project files.', options: ['Send the files since they claim to be a manager', 'Verify their identity through official company channels before sharing anything', 'Ask them to prove it by sending a selfie', 'Block them without reporting'], correct: 1, explanation: 'Messaging-app impersonation is a rising social engineering vector; confidential data should only be shared after identity is verified through official channels.', isEmergingThreat: true },
    { question: 'A caller claims to be from your company\'s helpdesk and asks for your password to "fix an urgent issue." What is the correct action?', options: ['Give the password since it is urgent', 'Never share passwords — legitimate IT will never ask for them; report the call', 'Give a fake password to test them', 'Hang up without reporting'], correct: 1, explanation: 'No legitimate IT department ever needs your actual password — this is a classic pretexting attack.', isEmergingThreat: false },
    { question: 'You receive a message about an amazing job offer with a very high salary, asking you to pay a small "processing fee" upfront.', options: ['Pay the fee since the offer looks great', 'Recognize this as a common recruitment scam and avoid sending any payment or personal data', 'Share your bank details for the "payroll setup"', 'Forward the offer to friends to apply too'], correct: 1, explanation: 'Fake job offer scams use social engineering and urgency to extract fees or personal data — legitimate employers never charge candidates.', isEmergingThreat: true },
  ],
  'Password Security': [
    { question: 'You want to protect an important work account. Which approach provides the strongest protection?', options: ['A memorable word plus your birth year', 'A unique, long passphrase managed by a password manager, plus two-factor authentication', 'The same strong password reused across all accounts', 'A password written on a sticky note at your desk'], correct: 1, explanation: 'Unique passwords per account plus 2FA dramatically reduce risk even if one account is compromised.', isEmergingThreat: false },
    { question: 'You get a text message asking you to confirm a login code you never requested. What is likely happening?', options: ['A harmless system glitch', 'An attacker may already have your password and is trying to bypass SMS-based 2FA (SIM swapping-style attack)', 'Your phone carrier is testing the network', 'Nothing — you can ignore it safely'], correct: 1, explanation: 'Unrequested 2FA codes often mean someone already has your password and is trying to complete login — change your password immediately.', isEmergingThreat: true },
    { question: 'Why are authenticator apps generally considered safer than SMS codes for two-factor authentication?', options: ['They are exactly the same in terms of security', 'SMS can be intercepted via SIM swapping, while authenticator apps are tied to the device itself', 'Authenticator apps never expire', 'SMS codes are faster to receive'], correct: 1, explanation: 'SIM swapping attacks can redirect SMS codes to an attacker\'s phone; app-based or hardware-based 2FA avoids this risk.', isEmergingThreat: true },
    { question: 'A "password spraying" attack works by:', options: ['Trying many passwords against one account very quickly', 'Trying one or a few common passwords across many different accounts to avoid lockouts', 'Guessing passwords using the user\'s pet name', 'Sending phishing emails to reset passwords'], correct: 1, explanation: 'Password spraying uses common passwords across many accounts, staying under lockout thresholds — unique, strong passwords defeat it.', isEmergingThreat: true },
    { question: 'You discover a website you use was part of a data breach. What should you do?', options: ['Nothing, since the site will handle it', 'Change your password on that site, and on any other site where you reused it', 'Only worry if you get an email about it', 'Delete your account and forget about it'], correct: 1, explanation: 'Breached credentials are often reused in "credential stuffing" attacks against other accounts — reset the password everywhere it was reused.', isEmergingThreat: false },
    { question: 'What is the main benefit of using a password manager?', options: ['It lets you use the same password everywhere safely', 'It generates and stores unique, strong passwords for every account so you do not have to remember them', 'It removes the need for two-factor authentication', 'It is only useful for work accounts'], correct: 1, explanation: 'Password managers make unique, complex passwords practical for every account, which is the single biggest defense against credential-based attacks.', isEmergingThreat: false },
  ],
  'Malware & Ransomware': [
    { question: 'You download a "free" version of paid software from an unofficial website. What is the main risk?', options: ['It may run slightly slower', 'It may be bundled with info-stealing malware or spyware', 'There is no risk if your antivirus is up to date', 'It will only affect that one file'], correct: 1, explanation: 'Info-stealing malware is frequently hidden inside cracked or "free" software downloads from unofficial sources.', isEmergingThreat: true },
    { question: 'A hospital\'s systems are suddenly locked with a message demanding payment to restore access. This is an example of:', options: ['A software update', 'A ransomware attack, increasingly offered as "ransomware-as-a-service" targeting critical sectors like healthcare', 'A normal firewall block', 'A password reset requirement'], correct: 1, explanation: 'Ransomware-as-a-service (RaaS) has made it easier for attackers to target hospitals and schools, where uptime pressure increases the odds of payment.', isEmergingThreat: true },
    { question: 'You install a browser extension for a productivity tool, and afterward your browser homepage keeps changing and ads appear everywhere.', options: ['This is expected behavior for extensions', 'The extension may be malicious and should be removed immediately, followed by a security scan', 'Restarting the browser will fix it permanently', 'This only affects browsing speed, not security'], correct: 1, explanation: 'Malicious browser extensions can hijack settings and steal credentials — remove suspicious extensions and scan the system.', isEmergingThreat: true },
    { question: 'What makes "fileless malware" particularly hard to detect with traditional antivirus?', options: ['It only targets mobile phones', 'It operates in memory rather than writing files to disk, leaving little for signature-based scanners to find', 'It is not actually a real threat', 'It only works when the computer is offline'], correct: 1, explanation: 'Fileless malware runs in memory and abuses legitimate system tools, making it much harder for traditional file-scanning antivirus to catch.', isEmergingThreat: true },
    { question: 'What is the single most effective way to reduce the impact of a ransomware attack?', options: ['Paying the ransom quickly', 'Maintaining regular, tested, offline backups of important data', 'Disabling antivirus to avoid conflicts', 'Keeping all devices permanently connected to the network'], correct: 1, explanation: 'Reliable offline backups mean you can restore systems without paying attackers, drastically reducing ransomware\'s leverage.', isEmergingThreat: false },
    { question: 'You plug in a USB drive found in the office parking lot to see who it belongs to. What is the risk?', options: ['No risk, as long as you delete anything suspicious after', 'It could automatically install malware on your machine ("baiting" attack)', 'USB drives cannot carry malware', 'Only a risk on personal computers, not work ones'], correct: 1, explanation: 'Unknown USB drives are a classic malware delivery and social engineering ("baiting") technique — never plug in unverified devices.', isEmergingThreat: false },
  ],
}

function getFallbackQuestions(moduleName, attemptCount) {
  const pool = FALLBACK_QUESTIONS[moduleName] || FALLBACK_QUESTIONS['Phishing Awareness']
  const offset = attemptCount % pool.length
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)]
  return rotated.slice(0, 5)
}

// Shuffles each question's answer options (and remaps the correct index to match)
// so the correct answer's position is never predictable — regardless of whether
// the question came from the AI or the offline fallback bank.
function shuffleQuestionOptions(questions) {
  return questions.map(q => {
    const order = q.options.map((_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    return {
      ...q,
      options: order.map(i => q.options[i]),
      correct: order.indexOf(q.correct),
    }
  })
}

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

  // ✅ Session timeout — 30 minutes of inactivity
  useSessionTimeout()

  const generateQuestions = async () => {
    setLoading(true); setError('')
    const moduleInfo = MODULE_TOPICS[moduleName] || { topic: moduleName, forbidden: '', threats: '' }
    const context = scenarioContexts[attemptCount % scenarioContexts.length]
    const seed = Date.now()
    const currentDate = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

    const requestBody = JSON.stringify({
      // Haiku 4.5 is several times faster than Sonnet-class models and is
      // plenty capable for structured MCQ generation — this keeps generation
      // well under our timeout instead of taking 30+ seconds.
      model: 'claude-haiku-4-5', max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `You are a cybersecurity quiz generator. Today is ${currentDate}. Generate exactly 5 multiple choice quiz questions STRICTLY about: ${moduleInfo.topic}.

STRICT RULES:
1. ${moduleInfo.forbidden}
2. Every question MUST be directly and only about ${moduleName}.
3. ${context}
4. All 5 questions must be completely different from each other.
5. Use session ID ${seed} to ensure unique questions never seen before.
6. Each question must be a realistic workplace scenario for a non-technical employee.
7. IMPORTANT — Include at least 2 questions based on these EMERGING REAL-WORLD THREATS from ${currentDate}: ${moduleInfo.threats}
8. Keep each "explanation" to ONE short sentence (max 20 words) so the response stays compact.

Return ONLY a valid JSON array with no extra text, no markdown fences, nothing before or after it:
[
  {
    "question": "Realistic scenario question strictly about ${moduleName}?",
    "options": ["Option A","Option B","Option C","Option D"],
    "correct": 0,
    "explanation": "Short reason the answer is correct.",
    "isEmergingThreat": false
  }
]

Set "isEmergingThreat": true for questions based on the emerging threats listed above.
The "correct" field is the index (0-3) of the correct answer.`
      }]
    })

    // Extracts a JSON array even if the model adds stray text/fences around it.
    const extractJsonArray = (text) => {
      const start = text.indexOf('[')
      const end = text.lastIndexOf(']')
      if (start === -1 || end === -1 || end < start) throw new Error('No JSON array found in response')
      return JSON.parse(text.slice(start, end + 1))
    }

    const attemptFetch = async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // hard cap: never hang past 15s
      try {
        const response = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
          signal: controller.signal,
        })
        const data = await response.json()
        if (!response.ok || data.error) {
          throw new Error(data.error?.message || `API error (status ${response.status})`)
        }
        const text = data.content?.[0]?.text || ''
        if (data.stop_reason === 'max_tokens') {
          console.warn('Response was truncated at max_tokens; JSON may be incomplete.')
        }
        return extractJsonArray(text)
      } finally {
        clearTimeout(timeoutId)
      }
    }

    try {
      const parsed = await attemptFetch()
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Empty question set')
   setQuestions(shuffleQuestionOptions(parsed)); setStarted(true)
    } catch (err) {
      // AI generation failed or timed out — fall back to the offline question
      // bank so the quiz still works seamlessly instead of showing an error.
      console.warn('AI question generation failed, using offline fallback questions:', err)
      const fallback = getFallbackQuestions(moduleName, attemptCount)
     setQuestions(shuffleQuestionOptions(fallback)); setStarted(true)
    }
    setLoading(false)
  }

  const handleSelect = (i) => {
    if (answered) return
    setSelected(i); setAnswered(true)
    const correct = i === questions[current].correct
    if (correct) setScore(s => s + 1)
    setAnswers(prev => [...prev, { correct }])
  }

  const handleNext = () => {
    if (current + 1 >= questions.length) { setFinished(true); saveProgress() }
    else { setCurrent(c => c + 1); setSelected(null); setAnswered(false) }
  }

  const saveProgress = async () => {
    const percentage = Math.round((score / questions.length) * 100)
    const points = score * 50
    const moduleIdx = MODULE_INDEX[moduleName]

    // Update localStorage — weekly progress
    const existing = JSON.parse(localStorage.getItem('cybershield_progress') || '{}')
    const existingStats = JSON.parse(localStorage.getItem('cybershield_stats') || '{"totalPoints":0,"modulesDone":0}')
    const existingWeekly = JSON.parse(localStorage.getItem('cybershield_weekly_stats') || '{"weeklyPoints":0}')
    existing[moduleIdx] = Math.max(existing[moduleIdx] || 0, percentage)
    existingStats.totalPoints = (existingStats.totalPoints || 0) + points
    existingStats.modulesDone = Object.values(existing).filter(v => v > 0).length
    existingWeekly.weeklyPoints = (existingWeekly.weeklyPoints || 0) + points
    localStorage.setItem('cybershield_progress', JSON.stringify(existing))
    localStorage.setItem('cybershield_stats', JSON.stringify(existingStats))
    localStorage.setItem('cybershield_weekly_stats', JSON.stringify(existingWeekly))

    // Save to Firestore
    try {
      const userStr = localStorage.getItem('cybershield_user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.uid) {
          const userRef = doc(db, 'users', user.uid)
          const snap = await getDoc(userRef)
          const userData = snap.exists() ? snap.data() : {}
          const oldWeeklyProgress = userData.weeklyProgress || {}
          const newWeeklyProgress = { ...oldWeeklyProgress, [moduleIdx]: Math.max(oldWeeklyProgress[moduleIdx] || 0, percentage) }

          await updateDoc(userRef, {
            [`weeklyProgress.${moduleIdx}`]: Math.max(oldWeeklyProgress[moduleIdx] || 0, percentage),
            points: (userData.points || 0) + points, // cumulative — never resets
            weeklyPoints: (userData.weeklyPoints || 0) + points, // resets Monday
            modulesDone: Object.values(newWeeklyProgress).filter(v => v > 0).length,
          })
          await addDoc(collection(db, 'results'), {
            userId: user.uid, userName: user.name, userEmail: user.email,
            institution: user.institution || '', module: moduleName,
            moduleIndex: moduleIdx, score: percentage, pointsEarned: points,
            correct: score, total: questions.length, passed: percentage >= 60,
            timestamp: new Date(),
          })
        }
      }
    } catch (err) { console.log('Save error:', err) }
  }

  const handleRetry = () => {
    setCurrent(0); setSelected(null); setAnswered(false)
    setScore(0); setFinished(false); setAnswers([])
    setStarted(false); setQuestions([])
    setAttemptCount(c => c + 1)
  }

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0
  const points = score * 50
  const emergingCount = questions.filter(q => q.isEmergingThreat).length

  const cardStyle = { background: 'rgba(8,18,45,0.82)', backdropFilter: 'blur(14px)', border: '1px solid rgba(40,90,200,0.22)', boxShadow: '0 4px 24px rgba(0,0,0,0.45)' }
  const navStyle = { background: 'rgba(4,10,28,0.90)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(30,70,180,0.2)' }

  return (
    <div className="min-h-screen text-white relative">
      <RadarCanvas />
      <nav className="px-6 py-4 flex items-center justify-between sticky top-0" style={{ ...navStyle, zIndex: 20, position: 'relative' }}>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="CyberShield" className="w-9 h-9" />
          <span className="font-bold text-lg" style={{ background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CyberShield</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition"><ArrowLeft className="w-4 h-4" />Back to Dashboard</button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8" style={{ position: 'relative', zIndex: 10 }}>

        {!started && !loading && (
          <div className="rounded-2xl p-8 text-center" style={cardStyle}>
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold mb-2 text-white">{moduleName} Quiz</h2>
            <p className="text-gray-400 mb-2">5 AI-generated scenario questions</p>
            <p className="text-gray-400 text-sm mb-2">All questions strictly about <span className="text-blue-400 font-medium">{moduleName}</span></p>
            <p className="text-green-400 text-xs mb-6">⚡ Includes questions on emerging real-world threats</p>
            {attemptCount > 0 && <p className="text-blue-400 text-xs mb-4">✓ Fresh unique questions will be generated</p>}
            {error && <div className="rounded-xl p-4 mb-6 text-red-300 text-sm" style={{ background: 'rgba(120,20,20,0.5)', border: '1px solid rgba(200,60,60,0.4)' }}>{error}</div>}
            <button onClick={generateQuestions} className="w-full text-white font-semibold py-3 rounded-xl transition hover:opacity-90" style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb,#7c3aed)', boxShadow: '0 0 25px rgba(37,99,235,0.4)' }}>
              {attemptCount > 0 ? 'Generate New Questions & Start' : 'Generate Questions & Start Quiz'}
            </button>
          </div>
        )}

        {loading && (
          <div className="rounded-2xl p-8 text-center" style={cardStyle}>
            <Loader className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">Claude AI is generating your questions...</p>
            <p className="text-gray-400 text-sm mt-1">Including emerging real-world threats for <span className="text-blue-400">{moduleName}</span></p>
          </div>
        )}

        {started && !finished && questions.length > 0 && (
          <>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2"><span>Question {current + 1} of {questions.length}</span><span>Score: {score}</span></div>
              <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-2 rounded-full transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%`, background: 'linear-gradient(90deg,#2563eb,#7c3aed)' }} />
              </div>
            </div>

            <div className="rounded-xl p-6 mb-4" style={cardStyle}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)', color: '#60a5fa' }}>{moduleName}</span>
                {questions[current].isEmergingThreat && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171' }}>⚡ Emerging Threat</span>
                )}
              </div>
              <h2 className="text-lg font-semibold leading-relaxed text-white">{questions[current].question}</h2>
            </div>

            <div className="space-y-3 mb-4">
              {questions[current].options.map((opt, i) => {
                let style = { ...cardStyle, cursor: 'pointer' }; let textColor = 'text-gray-300'
                if (answered) {
                  if (i === questions[current].correct) { style = { background: 'rgba(20,80,40,0.7)', border: '1px solid rgba(60,180,80,0.5)', backdropFilter: 'blur(14px)' }; textColor = 'text-green-300' }
                  else if (i === selected) { style = { background: 'rgba(100,20,20,0.7)', border: '1px solid rgba(200,60,60,0.5)', backdropFilter: 'blur(14px)' }; textColor = 'text-red-300' }
                  else style = { ...cardStyle, opacity: 0.4 }
                }
                return (
                  <div key={i} onClick={() => handleSelect(i)} className={`rounded-xl px-4 py-3 flex items-center gap-3 transition ${textColor}`} style={style}>
                    {answered && i === questions[current].correct && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
                    {answered && i === selected && i !== questions[current].correct && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                    {(!answered || (i !== questions[current].correct && i !== selected)) && <div className="w-5 h-5 rounded-full border border-gray-600 flex-shrink-0" />}
                    <span className="text-sm">{opt}</span>
                  </div>
                )
              })}
            </div>

            {answered && <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(10,30,80,0.7)', border: '1px solid rgba(60,120,255,0.3)', backdropFilter: 'blur(12px)' }}><p className="text-blue-300 text-sm"><span className="font-semibold">Explanation: </span>{questions[current].explanation}</p></div>}
            {answered && <button onClick={handleNext} className="w-full text-white font-semibold py-3 rounded-xl transition hover:opacity-90" style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb,#7c3aed)', boxShadow: '0 0 25px rgba(37,99,235,0.35)' }}>{current + 1 >= questions.length ? 'See Results' : 'Next Question →'}</button>}
          </>
        )}

        {finished && (
          <div className="text-center">
            <div className="rounded-2xl p-8 mb-6" style={cardStyle}>
              <div className="text-6xl mb-4">{percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '📚'}</div>
              <h2 className="text-2xl font-bold mb-2 text-white">{percentage >= 80 ? 'Excellent Work!' : percentage >= 50 ? 'Good Effort!' : 'Keep Practicing!'}</h2>
              <p className="text-gray-400 mb-4">{percentage >= 80 ? 'You have a strong understanding of this topic!' : percentage >= 50 ? 'Review the module and try again.' : 'Go back and read the module carefully.'}</p>
              {emergingCount > 0 && <p className="text-green-400 text-sm mb-4">⚡ {emergingCount} question{emergingCount > 1 ? 's were' : ' was'} based on emerging real-world threats</p>}
              <div className="w-32 h-32 rounded-full flex flex-col items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', boxShadow: '0 0 30px rgba(37,99,235,0.4)' }}>
                <span className="text-3xl font-bold text-white">{percentage}%</span>
                <span className="text-blue-200 text-sm">{score}/{questions.length}</span>
              </div>
              <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(80,60,0,0.5)', border: '1px solid rgba(200,160,0,0.35)', backdropFilter: 'blur(12px)' }}>
                <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <p className="text-yellow-300 font-semibold">+{points} Points Earned!</p>
                <p className="text-yellow-600 text-xs mt-1">Added to weekly and cumulative totals</p>
              </div>
              <div className="flex justify-center gap-2 mb-2">
                {answers.map((a, i) => <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center ${a.correct ? 'bg-green-600' : 'bg-red-600'}`}>{a.correct ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}</div>)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleRetry} className="text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition hover:opacity-90" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}><RotateCcw className="w-5 h-5" />Try Again</button>
              <button onClick={() => navigate('/dashboard')} className="text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition hover:opacity-90" style={{ background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', boxShadow: '0 0 20px rgba(37,99,235,0.35)' }}><Trophy className="w-5 h-5" />Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}