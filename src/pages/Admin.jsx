import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Trophy, BookOpen, TrendingUp, CheckCircle, XCircle, Shield, Loader } from 'lucide-react'
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { db } from '../firebase'

function SubtleCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); let animationId
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    const particles = Array.from({ length: 35 }, () => ({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, r: Math.random() * 1.8 + 0.5, dx: (Math.random() - 0.5) * 0.2, dy: (Math.random() - 0.5) * 0.2, alpha: Math.random() * 0.3 + 0.05, pulse: Math.random() * Math.PI * 2 }))
    const orbs = [{ x: 0, y: 0, r: 300, color: '20,60,180', alpha: 0.06 }, { x: window.innerWidth, y: window.innerHeight, r: 350, color: '60,20,180', alpha: 0.05 }]
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

const MODULE_NAMES = ['Phishing Awareness', 'Social Engineering', 'Password Security', 'Malware & Ransomware']
const MODULE_COLORS = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-red-600']
const MODULE_BAR_COLORS = ['rgba(37,99,235,0.8)', 'rgba(124,58,237,0.8)', 'rgba(22,163,74,0.8)', 'rgba(220,38,38,0.8)']

export default function Admin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all users
        const usersSnap = await getDocs(collection(db, 'users'))
        const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        setUsers(usersData)

        // Fetch recent results
        const resultsSnap = await getDocs(query(collection(db, 'results'), orderBy('timestamp', 'desc'), limit(20)))
        const resultsData = resultsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        setResults(resultsData)
      } catch (err) {
        console.log('Error fetching data:', err)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // Calculate real stats
  const totalUsers = users.length
  const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0)
  const totalCompletions = results.length
  const avgScore = results.length > 0 ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length) : 0

  // Module stats from real results
  const moduleStats = MODULE_NAMES.map((name, i) => {
    const moduleResults = results.filter(r => r.moduleIndex === i)
    const avgModuleScore = moduleResults.length > 0 ? Math.round(moduleResults.reduce((sum, r) => sum + r.score, 0) / moduleResults.length) : 0
    return { title: name, completions: moduleResults.length, avgScore: avgModuleScore, color: MODULE_COLORS[i], barColor: MODULE_BAR_COLORS[i] }
  })

  const cardStyle = { background: 'rgba(8,18,45,0.80)', backdropFilter: 'blur(12px)', border: '1px solid rgba(40,90,200,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }
  const navStyle = { background: 'rgba(4,10,28,0.90)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(30,70,180,0.2)' }
  const tabStyle = (tab) => ({ padding: '8px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === tab ? 'linear-gradient(135deg,#1d4ed8,#7c3aed)' : 'rgba(255,255,255,0.05)', color: activeTab === tab ? 'white' : '#9ca3af', border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.08)', boxShadow: activeTab === tab ? '0 0 20px rgba(37,99,235,0.3)' : 'none' })

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center relative">
      <SubtleCanvas />
      <div className="text-center" style={{ zIndex: 10, position: 'relative' }}>
        <Loader className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-4" />
        <p className="text-white font-medium">Loading platform data...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen text-white relative">
      <SubtleCanvas />
      <nav className="px-6 py-4 flex items-center justify-between sticky top-0" style={{ ...navStyle, zIndex: 20 }}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="CyberShield" className="w-9 h-9" />
          <span className="font-bold text-lg" style={{ background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CyberShield</span>
          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)', color: '#60a5fa' }}>Admin Panel</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition"><ArrowLeft className="w-4 h-4" />Back to Dashboard</button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 relative" style={{ zIndex: 10 }}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Platform Administration</h1>
          <p className="text-gray-400 mt-1">Monitor users, training results and platform analytics — live data</p>
        </div>

        <div className="flex gap-3 mb-8 flex-wrap">
          {['overview', 'users', 'results', 'modules'].map(tab => (
            <button key={tab} style={tabStyle(tab)} onClick={() => setActiveTab(tab)}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: totalUsers, icon: <Users className="w-5 h-5" />, color: 'text-blue-400' },
                { label: 'Quiz Completions', value: totalCompletions, icon: <BookOpen className="w-5 h-5" />, color: 'text-green-400' },
                { label: 'Total Points Awarded', value: totalPoints, icon: <Trophy className="w-5 h-5" />, color: 'text-yellow-400' },
                { label: 'Average Score', value: `${avgScore}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-400' },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl p-4" style={cardStyle}>
                  <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl p-6 mb-6" style={cardStyle}>
              <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
              {results.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No quiz results yet. Users need to complete quizzes first.</p>
              ) : (
                <div className="space-y-3">
                  {results.slice(0, 8).map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white border-opacity-5 last:border-0">
                      <div className="flex items-center gap-3">
                        {r.passed ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                        <div>
                          <p className="text-white text-sm font-medium">{r.userName}</p>
                          <p className="text-gray-400 text-xs">Completed {r.module} Quiz</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${r.passed ? 'text-green-400' : 'text-red-400'}`}>{r.score}%</p>
                        <p className="text-gray-500 text-xs">{formatTime(r.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl p-6" style={cardStyle}>
              <h2 className="text-lg font-semibold text-white mb-4">Module Performance Overview</h2>
              <div className="space-y-4">
                {moduleStats.map((mod, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-300">{mod.title}</span>
                      <span className="text-sm text-gray-400">{mod.completions} completions — Avg: {mod.avgScore}%</span>
                    </div>
                    <div className="w-full rounded-full h-2.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${mod.avgScore}%`, background: mod.barColor }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div className="rounded-xl overflow-hidden" style={cardStyle}>
            <div className="p-6 border-b border-white border-opacity-5">
              <h2 className="text-lg font-semibold text-white">Registered Users ({totalUsers})</h2>
            </div>
            {users.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No users registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {['Name', 'Email', 'Institution', 'Modules Done', 'Points', 'Joined'].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={i} className="border-t border-white border-opacity-5">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)' }}>{(u.name || 'U').charAt(0)}</div>
                            <span className="text-white text-sm font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{u.email}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{u.institution || '—'}</td>
                        <td className="px-6 py-4"><span className="text-sm font-medium" style={{ color: u.modulesDone === 4 ? '#4ade80' : u.modulesDone >= 2 ? '#60a5fa' : '#f87171' }}>{u.modulesDone || 0}/4</span></td>
                        <td className="px-6 py-4"><span className="text-yellow-400 text-sm font-semibold">{u.points || 0} pts</span></td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{u.joined || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* RESULTS */}
        {activeTab === 'results' && (
          <div className="rounded-xl overflow-hidden" style={cardStyle}>
            <div className="p-6 border-b border-white border-opacity-5">
              <h2 className="text-lg font-semibold text-white">Quiz Results — All Users ({results.length})</h2>
            </div>
            {results.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No quiz results yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {['User', 'Module', 'Score', 'Points Earned', 'Status', 'Date'].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} className="border-t border-white border-opacity-5">
                        <td className="px-6 py-4 text-white text-sm font-medium">{r.userName}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{r.module}</td>
                        <td className="px-6 py-4"><span className={`text-sm font-semibold ${r.passed ? 'text-green-400' : 'text-red-400'}`}>{r.score}%</span></td>
                        <td className="px-6 py-4 text-yellow-400 text-sm">+{r.pointsEarned} pts</td>
                        <td className="px-6 py-4">
                          <span className="text-xs px-2 py-1 rounded-full font-medium" style={r.passed ? { background: 'rgba(22,163,74,0.2)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.3)' } : { background: 'rgba(220,38,38,0.2)', color: '#f87171', border: '1px solid rgba(220,38,38,0.3)' }}>
                            {r.passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{formatTime(r.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODULES */}
        {activeTab === 'modules' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {moduleStats.map((mod, i) => (
              <div key={i} className="rounded-xl p-6" style={cardStyle}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${mod.color} w-10 h-10 rounded-xl flex items-center justify-center`}><Shield className="w-5 h-5 text-white" /></div>
                  <div><h3 className="font-semibold text-white">{mod.title}</h3><p className="text-gray-400 text-xs">Training Module</p></div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-gray-400 text-sm">Total Completions</span><span className="text-white text-sm font-semibold">{mod.completions} users</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 text-sm">Average Score</span><span className={`text-sm font-semibold ${mod.avgScore >= 75 ? 'text-green-400' : mod.avgScore >= 50 ? 'text-yellow-400' : mod.avgScore === 0 ? 'text-gray-400' : 'text-red-400'}`}>{mod.avgScore}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 text-sm">Completion Rate</span><span className="text-blue-400 text-sm font-semibold">{totalUsers > 0 ? Math.round((mod.completions / totalUsers) * 100) : 0}%</span></div>
                </div>
                <div className="mt-4">
                  <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${mod.avgScore}%`, background: mod.barColor }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
