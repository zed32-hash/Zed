import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { Send, Flag, Lock, Clock, ChevronLeft, AlertTriangle, X, SmilePlus } from 'lucide-react'
import {
  doc, getDoc, onSnapshot, addDoc, collection, serverTimestamp,
  updateDoc, increment, runTransaction, query, orderBy, where, getDocs, setDoc,
  arrayUnion, arrayRemove, deleteField,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { UserProfileModal, type ProfileData } from '../components/app/UserProfileModal'

const REACTION_EMOJIS = ['❤️', '😂', '🔥', '💀', '✨']

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: Date | null
  reactions?: Record<string, string[]>
}

interface ChatData {
  participants: string[]
  createdAt: Date | null
  expiresAt: Date | null
  status: 'active' | 'unlocked' | 'expired'
  messageCount: number
  lastMessageTimestamp: Date | null
  typing?: Record<string, any>
}

interface OtherProfile {
  uid: string
  username: string
  avatarUrl: string
  bio: string
  tags: string[]
}

const ICEBREAKERS = [
  "Would you rather explore space or the deep ocean?",
  "Would you rather have the ability to fly or be invisible?",
  "Would you rather always speak your mind or never speak again?",
  "Would you rather live in the past or the future?",
  "Would you rather give up music or movies forever?",
]

function CountdownBanner({ expiresAt, dark }: { expiresAt: Date; dark: boolean }) {
  const [remaining, setRemaining] = useState('')
  const [urgent, setUrgent] = useState(false)
  useEffect(() => {
    const update = () => {
      const diff = expiresAt.getTime() - Date.now()
      if (diff <= 0) { setRemaining('Expired'); return }
      setUrgent(diff < 3600000)
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [expiresAt])
  if (remaining === 'Expired') return null
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm"
      style={{ background: urgent ? 'rgba(255,83,83,0.12)' : 'rgba(255,132,75,0.1)', borderBottom: `1px solid ${urgent ? 'rgba(255,83,83,0.2)' : 'rgba(255,132,75,0.2)'}` }}>
      <Clock size={13} color={urgent ? '#FF5353' : '#FF844B'} />
      <span style={{ color: urgent ? '#FF5353' : '#FF844B', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.8rem' }}>
        {remaining} remaining — both must message to unlock this chat
      </span>
    </div>
  )
}

export function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const { user, profile, refreshProfile } = useAuth()
  const { dark } = useTheme()
  const navigate = useNavigate()

  const [chatData, setChatData] = useState<ChatData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [otherProfile, setOtherProfile] = useState<OtherProfile | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const [dailyLimitHit, setDailyLimitHit] = useState(false)
  const [expired, setExpired] = useState(false)
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState<string | null>(null)
  const [otherTyping, setOtherTyping] = useState(false)
  const [viewingProfile, setViewingProfile] = useState<ProfileData | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const bg = dark
    ? 'linear-gradient(160deg, #0A0914 0%, #1C1236 50%, #0E1A24 100%)'
    : 'linear-gradient(160deg, #FBF9F4 0%, #E3DCF8 55%, #D9E7F9 100%)'
  const cardBg = dark ? 'rgba(28,18,54,0.7)' : 'rgba(255,255,255,0.7)'
  const border = dark ? 'rgba(124,58,237,0.25)' : 'rgba(92,49,242,0.15)'
  const textColor = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'
  const inputBg = dark ? 'rgba(28,18,54,0.5)' : '#F3F0FC'

  useEffect(() => {
    if (!chatId || !user) return
    const unsub = onSnapshot(doc(db, 'chats', chatId), async (snap) => {
      if (!snap.exists()) return
      const data = snap.data()
      const cd: ChatData = {
        participants: data.participants,
        createdAt: data.createdAt?.toDate?.() || null,
        expiresAt: data.expiresAt ? (data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt)) : null,
        status: data.status,
        messageCount: data.messageCount || 0,
        lastMessageTimestamp: data.lastMessageTimestamp?.toDate?.() || null,
        typing: data.typing || {},
      }
      setChatData(cd)
      setExpired(cd.status !== 'unlocked' && cd.expiresAt !== null && cd.expiresAt < new Date() || cd.status === 'expired')

      const otherUid = data.participants.find((p: string) => p !== user.uid)
      if (otherUid) {
        const typingVal = data.typing?.[otherUid]
        if (typingVal) {
          const ts = typingVal.toDate ? typingVal.toDate().getTime() : new Date(typingVal).getTime()
          setOtherTyping(Date.now() - ts < 4000)
        } else {
          setOtherTyping(false)
        }
        const uSnap = await getDoc(doc(db, 'users', otherUid))
        if (uSnap.exists()) {
          const ud = uSnap.data()
          setOtherProfile({ uid: otherUid, username: ud.username, avatarUrl: ud.avatarUrl, bio: ud.bio, tags: ud.tags || [] })
        }
      }
    })
    return unsub
  }, [chatId, user])

  useEffect(() => {
    if (!chatId) return
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({
        id: d.id,
        senderId: d.data().senderId,
        text: d.data().text,
        timestamp: d.data().timestamp?.toDate?.() || null,
        reactions: d.data().reactions || {},
      })))
    })
    return unsub
  }, [chatId])

  useEffect(() => {
    if (!profile) return
    const count = profile.dailyMessageCount || 0
    const lastReset = profile.lastMessageReset
    if (lastReset) {
      const midnight = new Date(); midnight.setHours(0, 0, 0, 0)
      if (lastReset < midnight) { setDailyLimitHit(false); return }
    }
    setDailyLimitHit(count >= 20)
  }, [profile])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, otherTyping])

  const setTypingPresence = useCallback(async () => {
    if (!chatId || !user) return
    await updateDoc(doc(db, 'chats', chatId), { [`typing.${user.uid}`]: serverTimestamp() }).catch(() => {})
    if (typingClearTimeoutRef.current) clearTimeout(typingClearTimeoutRef.current)
    typingClearTimeoutRef.current = setTimeout(async () => {
      await updateDoc(doc(db, 'chats', chatId), { [`typing.${user.uid}`]: deleteField() }).catch(() => {})
    }, 2500)
  }, [chatId, user])

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => setTypingPresence(), 300)
  }

  const toggleReaction = async (msgId: string, emoji: string) => {
    if (!user || !chatId) return
    const msgRef = doc(db, 'chats', chatId, 'messages', msgId)
    const msg = messages.find(m => m.id === msgId)
    const alreadyReacted = msg?.reactions?.[emoji]?.includes(user.uid)
    if (alreadyReacted) {
      await updateDoc(msgRef, { [`reactions.${emoji}`]: arrayRemove(user.uid) })
    } else {
      await updateDoc(msgRef, { [`reactions.${emoji}`]: arrayUnion(user.uid) })
    }
    setReactionPickerMsgId(null)
  }

  const sharedTags = (profile?.tags || []).filter((t) => otherProfile?.tags.includes(t))
  const icebreaker = sharedTags.length > 0
    ? `You both love ${sharedTags[0]}. Ask them what ${sharedTags[0].replace('#', '')} content they're into right now!`
    : ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)]

  const msgCount = chatData?.messageCount || 0
  const blurLevel = msgCount < 16 ? 'blur(12px)' : msgCount < 51 ? 'blur(4px)' : 'blur(0px)'
  const showBio = msgCount >= 16
  const fullyRevealed = msgCount >= 51

  const sendMessage = async () => {
    if (!text.trim() || !chatId || !user || !chatData || sending || dailyLimitHit || expired) return
    const messageText = text.trim()
    setText('')
    setSending(true)
    if (typingClearTimeoutRef.current) clearTimeout(typingClearTimeoutRef.current)
    await updateDoc(doc(db, 'chats', chatId), { [`typing.${user.uid}`]: deleteField() }).catch(() => {})
    try {
      await runTransaction(db, async (tx) => {
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await tx.get(userRef)
        if (!userSnap.exists()) throw new Error('User not found')
        const ud = userSnap.data()
        let currentCount = ud.dailyMessageCount || 0
        const lastReset = ud.lastMessageReset?.toDate?.() || null
        const midnight = new Date(); midnight.setHours(0, 0, 0, 0)
        if (!lastReset || lastReset < midnight) currentCount = 0
        if (currentCount >= 20) throw new Error('DAILY_LIMIT')
        const msgRef = doc(collection(db, 'chats', chatId, 'messages'))
        tx.set(msgRef, { senderId: user.uid, text: messageText, timestamp: serverTimestamp(), reactions: {} })
        tx.update(doc(db, 'chats', chatId), { messageCount: increment(1), lastMessageTimestamp: serverTimestamp() })
        tx.update(userRef, { dailyMessageCount: currentCount + 1, lastMessageReset: midnight })
      })
      await refreshProfile()
      if (chatData.status === 'active') {
        const msgsSnap = await getDocs(collection(db, 'chats', chatId, 'messages'))
        const uids = new Set(msgsSnap.docs.map((d) => d.data().senderId))
        if (chatData.participants.every((p: string) => uids.has(p))) {
          await updateDoc(doc(db, 'chats', chatId), { status: 'unlocked' })
        }
      }
    } catch (err: any) {
      if (err.message === 'DAILY_LIMIT') setDailyLimitHit(true)
    } finally {
      setSending(false)
    }
  }

  const submitReport = async () => {
    if (!reportReason || !user || !otherProfile) return
    const reportRef = doc(collection(db, 'reports'))
    await setDoc(reportRef, { reporterId: user.uid, reportedId: otherProfile.uid, reason: reportReason, timestamp: serverTimestamp() })
    const otherRef = doc(db, 'users', otherProfile.uid)
    const otherSnap = await getDoc(otherRef)
    if (otherSnap.exists()) {
      const newCount = (otherSnap.data().reportCount || 0) + 1
      await updateDoc(otherRef, { reportCount: newCount, ...(newCount >= 3 ? { status: 'suspended' } : {}) })
    }
    setReportSent(true)
    setTimeout(() => setReportOpen(false), 1500)
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: bg }}
      onClick={() => reactionPickerMsgId && setReactionPickerMsgId(null)}>
      <div className="pointer-events-none absolute inset-0 z-0 opacity-25"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '256px 256px', mixBlendMode: dark ? 'overlay' : 'multiply' }} />

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div style={{ background: dark ? 'rgba(10,9,20,0.8)' : 'rgba(251,249,244,0.8)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${border}` }}>
          <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
            <button onClick={() => navigate('/inbox')} style={{ color: muted }}><ChevronLeft size={22} /></button>
            {otherProfile && (
              <button
                onClick={() => setViewingProfile(otherProfile)}
                className="relative transition-transform hover:scale-105 active:scale-95">
                <div style={{ overflow: 'hidden', borderRadius: '0.75rem', width: '2.5rem', height: '2.5rem', border: `2px solid ${border}` }}>
                  <img src={otherProfile.avatarUrl} alt="" className="w-full h-full" style={{ filter: blurLevel, transition: 'filter 0.5s', background: '#E3DCF8' }} />
                </div>
                {fullyRevealed && <span className="absolute -bottom-1 -right-1 text-xs">✨</span>}
              </button>
            )}
            <button className="flex-1 text-left" onClick={() => otherProfile && setViewingProfile(otherProfile)}>
              <p style={{ fontWeight: 700, color: textColor, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem' }}>
                @{otherProfile?.username || '…'}
              </p>
              <AnimatePresence mode="wait">
                {otherTyping ? (
                  <motion.p key="typing" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    style={{ color: '#5C31F2', fontSize: '0.7rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                    typing…
                  </motion.p>
                ) : (
                  <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ color: muted, fontSize: '0.7rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {msgCount < 16 ? `${16 - msgCount} more msgs to reveal bio` : msgCount < 51 ? `${51 - msgCount} to fully reveal` : 'Fully revealed ✨'}
                  </motion.p>
                )}
              </AnimatePresence>
            </button>
            <button onClick={() => setReportOpen(true)} style={{ color: muted }} title="Report"><Flag size={18} /></button>
          </div>
          {chatData?.status === 'unlocked' && (
            <div className="px-4 py-1.5 text-center" style={{ background: 'rgba(34,197,94,0.08)', borderTop: `1px solid rgba(34,197,94,0.15)` }}>
              <p style={{ color: '#22C55E', fontSize: '0.78rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>🔓 Chat unlocked — no expiry</p>
            </div>
          )}
          {chatData?.status === 'active' && chatData.expiresAt && !expired && (
            <CountdownBanner expiresAt={chatData.expiresAt} dark={dark} />
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full" style={{ minHeight: 0 }}>
          {/* Icebreaker */}
          <div className="mb-4 p-3 rounded-2xl" style={{ background: dark ? 'rgba(92,49,242,0.08)' : 'rgba(92,49,242,0.05)', border: `1px solid rgba(92,49,242,0.12)` }}>
            <p style={{ fontSize: '0.75rem', color: '#5C31F2', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '0.25rem' }}>
              {sharedTags.length > 0 ? `💬 Icebreaker — you both love ${sharedTags[0]}` : '💬 Icebreaker'}
            </p>
            <p style={{ fontSize: '0.82rem', color: textColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{icebreaker}</p>
          </div>

          {/* Bio reveal */}
          {showBio && otherProfile?.bio && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 rounded-2xl"
              style={{ background: dark ? 'rgba(255,132,75,0.07)' : 'rgba(255,132,75,0.05)', border: '1px solid rgba(255,132,75,0.15)' }}>
              <p style={{ fontSize: '0.72rem', color: '#FF844B', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '0.25rem' }}>✨ Bio unlocked</p>
              <p style={{ fontSize: '0.82rem', color: textColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{otherProfile.bio}</p>
            </motion.div>
          )}

          {/* Messages */}
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.uid
            const hasReactions = msg.reactions && Object.values(msg.reactions).some(arr => arr.length > 0)
            const pickerOpen = reactionPickerMsgId === msg.id
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="relative max-w-[78%]">
                  {/* Reaction picker trigger */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setReactionPickerMsgId(pickerOpen ? null : msg.id) }}
                    className={`absolute top-1 ${isMe ? '-left-7' : '-right-7'} opacity-0 group-hover:opacity-100 transition-opacity`}
                    style={{ color: muted, fontSize: '0.9rem', lineHeight: 1, padding: '2px' }}>
                    <SmilePlus size={14} />
                  </button>

                  {/* Reaction picker popover */}
                  <AnimatePresence>
                    {pickerOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 4 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`absolute ${isMe ? 'right-0' : 'left-0'} -top-10 flex gap-1 px-2 py-1.5 rounded-2xl z-20`}
                        style={{ background: dark ? '#1C1236' : '#fff', border: `1px solid ${border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', backdropFilter: 'blur(16px)' }}>
                        {REACTION_EMOJIS.map(emoji => {
                          const reacted = msg.reactions?.[emoji]?.includes(user?.uid || '')
                          return (
                            <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)}
                              className="text-base transition-transform hover:scale-125 active:scale-95"
                              style={{ opacity: reacted ? 1 : 0.7, filter: reacted ? 'none' : 'grayscale(0.3)', lineHeight: 1 }}>
                              {emoji}
                            </button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Message bubble */}
                  <div
                    className="group relative px-4 py-2.5 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); setReactionPickerMsgId(pickerOpen ? null : msg.id) }}
                    style={{
                      background: isMe ? 'linear-gradient(135deg,#5C31F2,#7C3AED)' : cardBg,
                      border: isMe ? 'none' : `1px solid ${border}`,
                      backdropFilter: isMe ? 'none' : 'blur(12px)',
                      color: isMe ? '#fff' : textColor,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '0.875rem', lineHeight: 1.5,
                      borderRadius: isMe ? '1.2rem 1.2rem 0.3rem 1.2rem' : '1.2rem 1.2rem 1.2rem 0.3rem',
                    }}>
                    {msg.text}
                    <SmilePlus size={11} className="inline-block ml-1.5 opacity-0 group-hover:opacity-40 transition-opacity" />
                  </div>

                  {/* Reaction pills */}
                  {hasReactions && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {REACTION_EMOJIS.map(emoji => {
                        const reactors = msg.reactions?.[emoji] || []
                        if (reactors.length === 0) return null
                        const iReacted = reactors.includes(user?.uid || '')
                        return (
                          <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)}
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all"
                            style={{
                              background: iReacted ? 'rgba(92,49,242,0.15)' : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                              border: `1px solid ${iReacted ? 'rgba(92,49,242,0.3)' : border}`,
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              color: iReacted ? '#5C31F2' : muted,
                              fontWeight: iReacted ? 700 : 400,
                            }}>
                            {emoji} {reactors.length}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}

          {/* Typing indicator */}
          <AnimatePresence>
            {otherTyping && (
              <motion.div key="typing-indicator" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="flex justify-start mb-3">
                <div className="px-4 py-2.5 rounded-2xl flex items-center gap-1"
                  style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '1.2rem 1.2rem 1.2rem 0.3rem', backdropFilter: 'blur(12px)' }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: '#5C31F2' }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ background: dark ? 'rgba(10,9,20,0.8)' : 'rgba(251,249,244,0.8)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${border}` }}>
          <div className="max-w-lg mx-auto px-4 py-3">
            {dailyLimitHit ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,132,75,0.1)', border: '1px solid rgba(255,132,75,0.2)' }}>
                <Clock size={16} color="#FF844B" />
                <p style={{ color: '#FF844B', fontSize: '0.82rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Daily conversation energy spent. Resets at midnight.</p>
              </div>
            ) : expired ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,83,83,0.1)', border: '1px solid rgba(255,83,83,0.2)' }}>
                <Lock size={16} color="#FF5353" />
                <p style={{ color: '#FF5353', fontSize: '0.82rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>This conversation has expired.</p>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={text} onChange={handleTextChange}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message…" maxLength={500}
                  className="flex-1 px-4 py-3 rounded-xl outline-none"
                  style={{ background: inputBg, border: `1px solid ${border}`, color: textColor, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem' }} />
                <button onClick={sendMessage} disabled={!text.trim() || sending}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: text.trim() ? 'linear-gradient(135deg,#5C31F2,#7C3AED)' : inputBg, color: text.trim() ? '#fff' : muted, border: `1px solid ${text.trim() ? 'transparent' : border}`, boxShadow: text.trim() ? '0 4px 16px rgba(92,49,242,0.35)' : 'none' }}>
                  <Send size={17} />
                </button>
              </div>
            )}
            {!expired && !dailyLimitHit && profile && (
              <p className="text-xs mt-1.5 text-right" style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {profile.dailyMessageCount || 0}/20 daily messages used
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Report modal */}
      <AnimatePresence>
        {reportOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && setReportOpen(false)}>
            <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
              className="w-full max-w-md rounded-3xl p-6"
              style={{ background: dark ? '#1C1236' : '#FBF9F4', border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} color="#FF5353" />
                  <h3 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, color: textColor, fontSize: '1.1rem' }}>Report Account</h3>
                </div>
                <button onClick={() => setReportOpen(false)} style={{ color: muted }}><X size={18} /></button>
              </div>
              {reportSent ? (
                <p style={{ color: '#22C55E', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>✓ Report submitted. We'll review it.</p>
              ) : (
                <>
                  <p style={{ color: muted, fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '1rem' }}>Select a reason for reporting @{otherProfile?.username}</p>
                  <div className="flex flex-col gap-2 mb-4">
                    {['Harassment or threats', 'Inappropriate content', 'Fake profile', 'Spam', 'Underage user'].map((reason) => (
                      <button key={reason} onClick={() => setReportReason(reason)}
                        className="px-4 py-2.5 rounded-xl text-left text-sm transition-all"
                        style={{ background: reportReason === reason ? 'rgba(255,83,83,0.12)' : (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'), border: `1px solid ${reportReason === reason ? 'rgba(255,83,83,0.35)' : border}`, color: reportReason === reason ? '#FF5353' : textColor, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: reportReason === reason ? 600 : 400 }}>
                        {reason}
                      </button>
                    ))}
                  </div>
                  <button onClick={submitReport} disabled={!reportReason}
                    className="w-full py-3 rounded-xl font-semibold"
                    style={{ background: reportReason ? '#FF5353' : muted, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Submit Report
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UserProfileModal profile={viewingProfile} onClose={() => setViewingProfile(null)} />
    </div>
  )
}
