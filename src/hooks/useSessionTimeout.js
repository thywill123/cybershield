import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'

const TIMEOUT_DURATION = 30 * 60 * 1000

export default function useSessionTimeout() {
  const navigate = useNavigate()
  const timerRef = useRef(null)

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.log('Sign out error:', err)
    }
    localStorage.removeItem('cybershield_user')
    localStorage.removeItem('cybershield_progress')
    localStorage.removeItem('cybershield_stats')
    localStorage.removeItem('cybershield_weekly_stats')
    localStorage.removeItem('cybershield_admin')
    navigate('/')
  }

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(logout, TIMEOUT_DURATION)
  }

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    resetTimer()
    events.forEach(event => window.addEventListener(event, resetTimer))
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [])
}