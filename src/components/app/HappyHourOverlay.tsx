import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import {
  doc, setDoc, onSnapshot, collection, serverTimestamp,
  runTransaction, getDoc, updateDoc
} from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Zap, X, CheckCircle, LogOut } from 'lucide-react'

type Phase = 'idle' | 'waiting' | 'chat' | 'verdict' | 'matched'

const SPEED_CHAT_DURATION = 5 * 60 * 1000
const VERDICT_WINDOW = 60 * 1000

export function HappyHourOverlay() {
  const { user, profile } = useAuth()
  const { dark } = useTheme()
  const navigate = useNavigate()

  const [isHappyHour, setIsHappyHour] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [chatId, setChatId] = useState<string | null>(null)
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [chatTimeLeft, setChatTimeLeft] = useState(SPEED_CHAT_DURATION)
  const [verdictTimeLeft, setVerdictTimeLeft] = useState(VERDICT_WINDOW)
  const [myVerdict, setMyVerdict] = useState<'reveal' | null>(null)
  const [partnerVerdict, setPartnerVerdict] = useState<'reveal' | null>(null)
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const checkTime = () => {
      const now = new Date()
      const h = now.getHours()
      const m = now.getMinutes()
      setIsHappyHour(h === 20 && m < 30)
    }
    checkTime()
    const id = setInterval(checkTime, 10000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (phase !== 'chat' || !chatId) return
    const start = Date.now()
    const id = setInterval(() => {
      const elapsed = Date.now() - start
      const left = SPEED_CHAT_DURATION - elapsed
      if (left <= 0) {
        setChatTimeLeft(0)
        setPhase('verdict')
        clearInterval(id)
      } else {
        setChatTimeLeft(left)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [phase, chatId])

  useEffect(() => {
    if (phase !== 'verdict') return
    const start = Date.now()
    const id = setInterval(() => {
      const elapsed = Date.now() - start
      const left = VERDICT_WINDOW - elapsed
      if (left <= 0) {
        setPhase('idle')
        setDismissed(true)
        clearInterval(id)
      } else {
        setVerdictTimeLeft(left)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'chat' || !chatId) return
    const unsub = onSnapshot(doc(db, 'chats', chatId), (snap) => {
      if (!snap.exists()) return
      const data = snap.data()
      if (data.verdicts) {
        const other = Object.entries(data.verdicts as Record<string, string>).find(([uid]) => uid !== user?.uid)
        if (other && other[1] === 'reveal') setPartnerVerdict('reveal')
      }
    })
    unsubRef.current = unsub
    return unsub
  }, [phase, chatId, user])

  useEffect(() => {
    if (myVerdict === 'reveal' && partnerVerdict === 'reveal' && chatId) {
      setPhase('matched')
      updateDoc(doc(db, 'chats', chatId), { status: 'unlocked' })
      setTimeout(() => navigate(`/chat/${chatId}`), 2000)
    }
  }, [myVerdict, partnerVerdict, chatId])

  const joinQueue = async () => {
    if (!user || !profile) return
    setPhase('waiting')

    const queueRef = doc(db, 'happyHourQueue', 'active')
    try {
      await runTransaction(db, async (tx) => {
        const qSnap = await tx.get(queueRef)
        const queue: string[] = qSnap.exists() ? (qSnap.data().uids || []) : []

        const waiting = queue.find((uid) => uid !== user.uid)
        if (waiting) {
          const newQueue = queue.filter((uid) => uid !== waiting && uid !== user.uid)
          tx.set(queueRef, { uids: newQueue })

          const now = new Date()
          const expiresAt = new Date(now.getTime() + 35 * 60 * 1000)
          const cId = `hh_${[user.uid, waiting].sort().join('_')}_${Date.now()}`

          tx.set(doc(db, 'chats', cId), {
            participants: [user.uid, waiting],
            createdAt: serverTimestamp(),
            expiresAt,
            status: 'active',
            messageCount: 0,
            lastMessageTimestamp: null,
            isHappyHour: true,
            verdicts: {},
          })

          setChatId(cId)
          setPartnerId(waiting)
          setPhase('chat')
        } else {
          if (!queue.includes(user.uid)) {
            tx.set(queueRef, { uids: [...queue, user.uid] })
          }
        }
      })

      if (phase === 'waiting') {
        const unsub = onSnapshot(doc(db, 'happyHourQueue', 'active'), async (snap) => {
          if (!snap.exists()) return
          const q: string[] = snap.data().uids || []
          if (!q.includes(user.uid)) {
            unsub()
            const chatsSnap = await getDoc(doc(db, 'happyHourQueue', `paired_${user.uid}`))
            if (chatsSnap.exists()) {
              const data = chatsSnap.data()
              setChatId(data.chatId)
              setPartnerId(data.partnerId)
              setPhase('chat')
            }
          }
        })
      }
    } catch (err) {
      console.error('Happy Hour queue error:', err)
      setPhase('idle')
    }
  }

  const submitVerdict = async (verdict: 'reveal' | 'exit') => {
    if (!chatId || !user) return
    if (verdict === 'exit') {
      setPhase('idle')
      setDismissed(true)
      return
    }
    setMyVerdict('reveal')
    await updateDoc(doc(db, 'chats', chatId), {
      [`verdicts.${user.uid}`]: 'reveal',
    })
  }

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (!isHappyHour || dismissed) return null

  const bg = dark ? 'rgba(10,9,20,0.95)' : 'rgba(251,249,244,0.97)'
  const text = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'
  const border = dark ? 'rgba(124,58,237,0.25)' : 'rgba(92,49,242,0.15)'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl p-8 relative overflow-hidden"
          style={{ background: bg, border: `1px solid ${border}`, boxShadow: '0 32px 80px rgba(92,49,242,0.25)' }}
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #5C31F2, transparent)' }} />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #FF844B, transparent)' }} />

          {phase === 'idle' && (
            <div className="relative z-10 text-center flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#FF844B,#FF5353)', boxShadow: '0 8px 24px rgba(255,132,75,0.4)' }}>
                <Zap size={28} color="#fff" fill="#fff" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
                  style={{ background: 'rgba(255,132,75,0.12)', border: '1px solid rgba(255,132,75,0.3)' }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#FF844B' }} />
                  <span style={{ color: '#FF844B', fontSize: '0.75rem', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>HAPPY HOUR IS LIVE</span>
                </div>
                <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.8rem', fontWeight: 700, color: text, lineHeight: 1.1 }}>
                  Tap to Chat Blind.
                </h2>
                <p style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Get matched instantly. 5 minutes. No profiles. Pure vibe.
                </p>
              </div>
              <button onClick={joinQueue}
                className="w-full py-3.5 rounded-2xl font-bold text-lg"
                style={{ background: 'linear-gradient(135deg,#FF844B,#FF5353)', color: '#fff', fontFamily: "'Clash Display', sans-serif", boxShadow: '0 8px 24px rgba(255,132,75,0.4)' }}>
                Enter Happy Hour →
              </button>
              <button onClick={() => setDismissed(true)}
                className="text-sm flex items-center gap-1.5" style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <X size={13} /> Skip for now
              </button>
            </div>
          )}

          {phase === 'waiting' && (
            <div className="relative z-10 text-center flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
                style={{ background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', boxShadow: '0 8px 24px rgba(92,49,242,0.4)' }}>
                <Zap size={24} color="#fff" fill="#fff" />
              </div>
              <div>
                <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: text }}>Finding your match…</h2>
                <p style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', marginTop: '0.5rem' }}>You're in the queue. Hang tight.</p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: '#5C31F2', animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <button onClick={() => setPhase('idle')}
                className="text-sm" style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Cancel
              </button>
            </div>
          )}

          {phase === 'chat' && (
            <div className="relative z-10 flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: chatTimeLeft < 60000 ? 'rgba(255,83,83,0.12)' : 'rgba(255,132,75,0.12)', border: `1px solid ${chatTimeLeft < 60000 ? 'rgba(255,83,83,0.3)' : 'rgba(255,132,75,0.3)'}` }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: chatTimeLeft < 60000 ? '#FF5353' : '#FF844B' }} />
                <span style={{ color: chatTimeLeft < 60000 ? '#FF5353' : '#FF844B', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.1rem' }}>
                  {formatTime(chatTimeLeft)}
                </span>
              </div>
              <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: text }}>Speed Chat Active</h2>
              <p style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem' }}>Chat window open. Identity hidden.</p>
              <button onClick={() => chatId && navigate(`/chat/${chatId}`)}
                className="w-full py-3 rounded-2xl font-semibold"
                style={{ background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 16px rgba(92,49,242,0.35)' }}>
                Open Chat →
              </button>
            </div>
          )}

          {phase === 'verdict' && (
            <div className="relative z-10 flex flex-col items-center gap-5 text-center">
              <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: text }}>Time's up. Your call.</h2>
              <p style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem' }}>
                If you both choose Reveal within <span style={{ color: '#FF844B', fontWeight: 600 }}>{formatTime(verdictTimeLeft)}</span>, you connect for real.
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => submitVerdict('reveal')} disabled={myVerdict === 'reveal'}
                  className="flex-1 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: myVerdict === 'reveal' ? '#22C55E' : 'linear-gradient(135deg,#5C31F2,#7C3AED)',
                    color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxShadow: '0 4px 16px rgba(92,49,242,0.35)',
                    opacity: myVerdict === 'reveal' ? 0.7 : 1,
                  }}>
                  {myVerdict === 'reveal' ? <CheckCircle size={16} /> : <CheckCircle size={16} />}
                  {myVerdict === 'reveal' ? 'Waiting…' : 'Reveal Profile'}
                </button>
                <button onClick={() => submitVerdict('exit')}
                  className="flex-1 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
                  style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: `1px solid ${border}`, color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <LogOut size={16} /> Exit Deck
                </button>
              </div>
              {myVerdict === 'reveal' && partnerVerdict !== 'reveal' && (
                <p style={{ color: '#5C31F2', fontSize: '0.82rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  ✓ You chose Reveal — waiting for their response…
                </p>
              )}
            </div>
          )}

          {phase === 'matched' && (
            <div className="relative z-10 flex flex-col items-center gap-4 text-center">
              <div className="text-5xl">🎉</div>
              <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.6rem', fontWeight: 700, color: text }}>It's a match!</h2>
              <p style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem' }}>
                You both chose to reveal. Opening your permanent connection…
              </p>
              <div className="w-8 h-8 rounded-full border-2 animate-spin"
                style={{ borderColor: '#5C31F2', borderTopColor: 'transparent' }} />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
