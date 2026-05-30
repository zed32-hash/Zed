import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
import { MessageCircle, Clock, Lock, Inbox, User } from 'lucide-react'
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { AppNavbar } from '../components/app/AppNavbar'
import { UserProfileModal, type ProfileData } from '../components/app/UserProfileModal'

interface ChatPreview {
  chatId: string
  otherUid: string
  otherUsername: string
  otherAvatar: string
  otherTags: string[]
  otherBio: string
  status: 'active' | 'unlocked' | 'expired'
  expiresAt: Date | null
  lastMessageTimestamp: Date | null
  messageCount: number
}

function Countdown({ expiresAt }: { expiresAt: Date }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = expiresAt.getTime() - Date.now()
      if (diff <= 0) { setRemaining('Expired'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${h}h ${m}m ${s}s`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return <span>{remaining}</span>
}

export function InboxPage() {
  const { user } = useAuth()
  const { dark } = useTheme()
  const navigate = useNavigate()
  const [chats, setChats] = useState<ChatPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingProfile, setViewingProfile] = useState<ProfileData | null>(null)

  const bg = dark
    ? 'linear-gradient(160deg, #0A0914 0%, #1C1236 50%, #0E1A24 100%)'
    : 'linear-gradient(160deg, #FBF9F4 0%, #E3DCF8 55%, #D9E7F9 100%)'
  const cardBg = dark ? 'rgba(28,18,54,0.7)' : 'rgba(255,255,255,0.65)'
  const border = dark ? 'rgba(124,58,237,0.25)' : 'rgba(92,49,242,0.15)'
  const text = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid))
    const unsub = onSnapshot(q, async (snap) => {
      const previews: ChatPreview[] = await Promise.all(
        snap.docs.map(async (chatDoc) => {
          const data = chatDoc.data()
          const otherUid = data.participants.find((p: string) => p !== user.uid)
          let otherUsername = 'Unknown'
          let otherAvatar = ''
          let otherTags: string[] = []
          let otherBio = ''
          try {
            const uSnap = await getDoc(doc(db, 'users', otherUid))
            if (uSnap.exists()) {
              otherUsername = uSnap.data().username
              otherAvatar = uSnap.data().avatarUrl
              otherTags = uSnap.data().tags || []
              otherBio = uSnap.data().bio || ''
            }
          } catch {}
          return {
            chatId: chatDoc.id,
            otherUid,
            otherUsername,
            otherAvatar,
            otherTags,
            otherBio,
            status: data.status,
            expiresAt: data.expiresAt ? (data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt)) : null,
            lastMessageTimestamp: data.lastMessageTimestamp ? (data.lastMessageTimestamp.toDate ? data.lastMessageTimestamp.toDate() : new Date(data.lastMessageTimestamp)) : null,
            messageCount: data.messageCount || 0,
          }
        })
      )
      previews.sort((a, b) => {
        if (!a.lastMessageTimestamp) return 1
        if (!b.lastMessageTimestamp) return -1
        return b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()
      })
      setChats(previews)
      setLoading(false)
    })
    return unsub
  }, [user])

  const getStatusBadge = (chat: ChatPreview) => {
    if (chat.status === 'unlocked') return { label: '🔓 Unlocked', color: '#22C55E' }
    if (chat.status === 'expired') return { label: '⏰ Expired', color: '#FF5353' }
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: bg }}>
      <div className="pointer-events-none absolute inset-0 z-0 opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat', backgroundSize: '256px 256px', mixBlendMode: dark ? 'overlay' : 'multiply',
        }}
      />
      <AppNavbar />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-20 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', boxShadow: '0 4px 16px rgba(92,49,242,0.4)' }}>
            <MessageCircle size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: text }}>Inbox</h1>
            <p style={{ color: muted, fontSize: '0.8rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your active connections</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: cardBg, border: `1px solid ${border}` }} />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center gap-4 text-center py-16">
            <Inbox size={48} style={{ color: muted, opacity: 0.4 }} />
            <h3 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.3rem', fontWeight: 700, color: text }}>No chats yet</h3>
            <p style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem' }}>Start swiping to make connections.</p>
            <button onClick={() => navigate('/app')}
              className="px-5 py-2.5 rounded-xl font-semibold"
              style={{ background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 16px rgba(92,49,242,0.35)' }}>
              Discover People
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {chats.map((chat) => {
              const badge = getStatusBadge(chat)
              const isExpired = chat.status === 'expired' || (chat.expiresAt && chat.expiresAt < new Date())
              return (
                <motion.div key={chat.chatId}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="w-full rounded-2xl p-4 flex items-center gap-3 text-left transition-all"
                  style={{
                    background: cardBg, border: `1px solid ${border}`, backdropFilter: 'blur(16px)',
                    opacity: isExpired ? 0.6 : 1,
                    boxShadow: isExpired ? 'none' : '0 4px 20px rgba(92,49,242,0.08)',
                  }}>
                  <button
                    onClick={() => setViewingProfile({ uid: chat.otherUid, username: chat.otherUsername, avatarUrl: chat.otherAvatar, bio: chat.otherBio, tags: chat.otherTags })}
                    className="relative flex-shrink-0 transition-transform hover:scale-105 active:scale-95">
                    <img src={chat.otherAvatar} alt="" className="w-12 h-12 rounded-xl"
                      style={{ border: `2px solid ${border}`, filter: isExpired ? 'grayscale(1)' : 'none' }} />
                    {chat.status === 'unlocked' && (
                      <span className="absolute -bottom-1 -right-1 text-xs">🔓</span>
                    )}
                  </button>
                  <button
                    className="flex-1 min-w-0 text-left"
                    onClick={() => !isExpired && navigate(`/chat/${chat.chatId}`)}
                    style={{ cursor: isExpired ? 'not-allowed' : 'pointer' }}>
                    <div className="flex items-center justify-between">
                      <p style={{ fontWeight: 700, color: text, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem' }}>@{chat.otherUsername}</p>
                      {badge && <span className="text-xs font-semibold" style={{ color: badge.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{badge.label}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {chat.status === 'active' && chat.expiresAt && !isExpired ? (
                        <span className="flex items-center gap-1 text-xs" style={{ color: '#FF844B', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          <Clock size={11} /> <Countdown expiresAt={chat.expiresAt} />
                        </span>
                      ) : isExpired ? (
                        <span className="flex items-center gap-1 text-xs" style={{ color: '#FF5353', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          <Lock size={11} /> Conversation expired
                        </span>
                      ) : null}
                      <span className="text-xs" style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {chat.messageCount} msg{chat.messageCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewingProfile({ uid: chat.otherUid, username: chat.otherUsername, avatarUrl: chat.otherAvatar, bio: chat.otherBio, tags: chat.otherTags })}
                    className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: dark ? 'rgba(92,49,242,0.1)' : 'rgba(92,49,242,0.06)', color: '#5C31F2' }}>
                    <User size={14} />
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <UserProfileModal profile={viewingProfile} onClose={() => setViewingProfile(null)} />
    </div>
  )
}
