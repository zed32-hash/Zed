import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { motion } from 'motion/react'
import { Clock, Heart } from 'lucide-react'
import { db } from '../../firebase/config'
import { useTheme } from '../../contexts/ThemeContext'

function getNextOccurrence(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const next = new Date()
  next.setHours(hours, minutes, 0, 0)
  if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1)
  return next
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDisplayTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export function BlindDateCountdown() {
  const { dark } = useTheme()
  const [eventTime, setEventTime] = useState<string | null>(null)
  const [remainingMs, setRemainingMs] = useState(0)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'happyHour'), (snap) => {
      if (snap.exists() && snap.data().time) {
        setEventTime(snap.data().time as string)
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!eventTime) return
    const tick = () => {
      const diff = Math.max(0, getNextOccurrence(eventTime).getTime() - Date.now())
      setRemainingMs(diff)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [eventTime])

  if (!eventTime) return null

  const isLive = remainingMs < 60000
  const progress = Math.max(0, Math.min(100, (1 - remainingMs / 86400000) * 100))
  const cardBg = dark ? 'rgba(28,18,54,0.7)' : 'rgba(255,255,255,0.65)'
  const borderColor = isLive ? 'rgba(255,132,75,0.5)' : 'rgba(92,49,242,0.25)'
  const textColor = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'
  const accentColor = isLive ? '#FF844B' : '#5C31F2'
  const gradient = isLive
    ? 'linear-gradient(135deg,#FF844B,#FF5353)'
    : 'linear-gradient(135deg,#5C31F2,#7C3AED)'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="mb-4 rounded-2xl overflow-hidden"
      style={{
        background: cardBg,
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(16px)',
        boxShadow: isLive
          ? '0 4px 24px rgba(255,132,75,0.15)'
          : '0 4px 20px rgba(92,49,242,0.07)',
      }}>
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: gradient,
            boxShadow: `0 4px 12px ${isLive ? 'rgba(255,132,75,0.4)' : 'rgba(92,49,242,0.35)'}`,
          }}>
          {isLive
            ? <Heart size={16} fill="#fff" color="#fff" />
            : <Clock size={16} color="#fff" />}
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {isLive && (
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: '#FF844B' }} />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: '#FF844B' }} />
              </span>
            )}
            <p style={{
              fontSize: '0.63rem',
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: accentColor,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              {isLive ? 'Blind Date is Live!' : "Tonight's Blind Date"}
            </p>
          </div>
          <p style={{
            fontSize: '0.77rem',
            color: muted,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            {isLive
              ? 'Anonymous matching is open — join now'
              : `Starts at ${formatDisplayTime(eventTime)}`}
          </p>
        </div>

        {/* Countdown digits */}
        {!isLive && (
          <div className="flex-shrink-0 text-right">
            <p style={{
              fontFamily: "'Clash Display', sans-serif",
              fontSize: '1.05rem',
              fontWeight: 700,
              color: textColor,
              letterSpacing: '0.02em',
              lineHeight: 1,
            }}>
              {formatCountdown(remainingMs)}
            </p>
            <p style={{
              fontSize: '0.57rem',
              color: muted,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginTop: '0.15rem',
              letterSpacing: '0.05em',
            }}>
              HH · MM · SS
            </p>
          </div>
        )}
      </div>

      {/* Progress bar — fills toward event time over the day */}
      <div style={{ height: 2, background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
        <div style={{
          height: '100%',
          background: gradient,
          width: `${progress}%`,
          transition: 'width 1s linear',
        }} />
      </div>
    </motion.div>
  )
}
