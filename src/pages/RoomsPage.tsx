import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Send, Hash, Users } from 'lucide-react'
import {
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { AppNavbar } from '../components/app/AppNavbar'
import { UserProfileModal, type ProfileData } from '../components/app/UserProfileModal'

interface RoomMessage {
  id: string
  senderId: string
  username: string
  avatarUrl: string
  text: string
  timestamp: Date | null
}

const TAG_COLORS: Record<string, string> = {
  '#gaming': '#5C31F2',
  '#music': '#FF844B',
  '#art': '#EC4899',
  '#tech': '#06B6D4',
  '#dev': '#10B981',
  '#anime': '#8B5CF6',
  '#film': '#F59E0B',
  '#books': '#84CC16',
  '#fitness': '#EF4444',
  '#travel': '#3B82F6',
  '#food': '#F97316',
  '#fashion': '#D946EF',
  '#crypto': '#22C55E',
  '#photography': '#0EA5E9',
  '#poetry': '#A855F7',
  '#science': '#14B8A6',
  '#sports': '#F43F5E',
  '#design': '#7C3AED',
  '#comedy': '#FBBF24',
  '#philosophy': '#6366F1',
}

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] || '#5C31F2'
}

export function RoomsPage() {
  const { user, profile } = useAuth()
  const { dark } = useTheme()
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [viewingProfile, setViewingProfile] = useState<ProfileData | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const bg = dark
    ? 'linear-gradient(160deg, #0A0914 0%, #1C1236 50%, #0E1A24 100%)'
    : 'linear-gradient(160deg, #FBF9F4 0%, #E3DCF8 55%, #D9E7F9 100%)'
  const cardBg = dark ? 'rgba(28,18,54,0.7)' : 'rgba(255,255,255,0.65)'
  const border = dark ? 'rgba(124,58,237,0.25)' : 'rgba(92,49,242,0.15)'
  const textColor = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'
  const inputBg = dark ? 'rgba(28,18,54,0.5)' : '#F3F0FC'

  const userTags = profile?.tags || []

  useEffect(() => {
    if (userTags.length > 0 && !selectedTag) {
      setSelectedTag(userTags[0])
    }
  }, [userTags])

  useEffect(() => {
    if (!selectedTag) return
    const roomId = selectedTag.replace('#', '')
    const q = query(collection(db, 'rooms', roomId, 'messages'), orderBy('timestamp', 'asc'), limit(80))
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({
        id: d.id,
        senderId: d.data().senderId,
        username: d.data().username,
        avatarUrl: d.data().avatarUrl,
        text: d.data().text,
        timestamp: d.data().timestamp?.toDate?.() || null,
      })))
    })
    return unsub
  }, [selectedTag])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!text.trim() || !user || !profile || !selectedTag || sending) return
    const roomId = selectedTag.replace('#', '')
    setSending(true)
    try {
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        senderId: user.uid,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        text: text.trim(),
        timestamp: serverTimestamp(),
      })
      setText('')
    } finally {
      setSending(false)
    }
  }

  const tagColor = selectedTag ? getTagColor(selectedTag) : '#5C31F2'

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: bg }}>
      <div className="pointer-events-none absolute inset-0 z-0 opacity-25"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '256px 256px', mixBlendMode: dark ? 'overlay' : 'multiply' }} />

      <AppNavbar />

      <div className="relative z-10 flex flex-col h-screen pt-14">
        {/* Tag selector */}
        <div style={{ background: dark ? 'rgba(10,9,20,0.7)' : 'rgba(251,249,244,0.7)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${border}` }}>
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} style={{ color: muted }} />
              <span style={{ fontSize: '0.72rem', color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Your Rooms
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {userTags.map(tag => {
                const active = selectedTag === tag
                const color = getTagColor(tag)
                return (
                  <button key={tag} onClick={() => setSelectedTag(tag)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: active ? `${color}22` : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                      border: `1.5px solid ${active ? color : border}`,
                      color: active ? color : muted,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                    <Hash size={10} /> {tag.replace('#', '')}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Room header */}
        {selectedTag && (
          <div className="max-w-lg mx-auto w-full px-4 py-2.5" style={{ borderBottom: `1px solid ${border}` }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${tagColor}20` }}>
                <Hash size={13} style={{ color: tagColor }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, color: textColor, fontSize: '0.9rem', lineHeight: 1 }}>
                  {selectedTag.replace('#', '')}
                </p>
                <p style={{ color: muted, fontSize: '0.68rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Public room · anonymous</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-4 py-4" style={{ minHeight: 0 }}>
          {!selectedTag ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(92,49,242,0.1)', border: `1px solid rgba(92,49,242,0.2)` }}>
                <Hash size={22} style={{ color: '#5C31F2' }} />
              </div>
              <p style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.2rem', fontWeight: 700, color: textColor }}>No tags yet</p>
              <p style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem' }}>Complete onboarding to join tag-based rooms.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${tagColor}18`, border: `1px solid ${tagColor}30` }}>
                <Hash size={20} style={{ color: tagColor }} />
              </div>
              <p style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: textColor }}>Be the first to say hi!</p>
              <p style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem' }}>This room is quiet — start the conversation.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderId === user?.uid
              const prevMsg = idx > 0 ? messages[idx - 1] : null
              const showAvatar = !isMe && msg.senderId !== prevMsg?.senderId

              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex items-end gap-2 mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className="flex-shrink-0 w-7 h-7">
                      {showAvatar && (
                        <button onClick={() => setViewingProfile({ uid: msg.senderId, username: msg.username, avatarUrl: msg.avatarUrl, tags: [] })}
                          className="w-7 h-7 rounded-lg overflow-hidden transition-transform hover:scale-110 active:scale-95"
                          style={{ border: `1.5px solid ${border}`, background: '#E3DCF8', flexShrink: 0 }}>
                          <img src={msg.avatarUrl} alt="" className="w-full h-full" />
                        </button>
                      )}
                    </div>
                  )}
                  <div className={`max-w-[75%] ${!isMe && showAvatar ? '' : !isMe ? 'ml-9' : ''}`}>
                    {showAvatar && !isMe && (
                      <button onClick={() => setViewingProfile({ uid: msg.senderId, username: msg.username, avatarUrl: msg.avatarUrl, tags: [] })}
                        className="text-xs mb-0.5 ml-1 hover:underline"
                        style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                        @{msg.username}
                      </button>
                    )}
                    <div className="px-3.5 py-2 rounded-2xl"
                      style={{
                        background: isMe ? `linear-gradient(135deg, ${tagColor}, ${tagColor}CC)` : cardBg,
                        border: isMe ? 'none' : `1px solid ${border}`,
                        backdropFilter: isMe ? 'none' : 'blur(12px)',
                        color: isMe ? '#fff' : textColor,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: '0.875rem', lineHeight: 1.5,
                        borderRadius: isMe ? '1.2rem 1.2rem 0.3rem 1.2rem' : '1.2rem 1.2rem 1.2rem 0.3rem',
                      }}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ background: dark ? 'rgba(10,9,20,0.8)' : 'rgba(251,249,244,0.8)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${border}` }}>
          <div className="max-w-lg mx-auto px-4 py-3 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={selectedTag ? `Message #${selectedTag.replace('#', '')}…` : 'Select a room…'}
              disabled={!selectedTag}
              maxLength={400}
              className="flex-1 px-4 py-3 rounded-xl outline-none"
              style={{ background: inputBg, border: `1px solid ${border}`, color: textColor, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', opacity: selectedTag ? 1 : 0.5 }}
            />
            <button onClick={sendMessage} disabled={!text.trim() || sending || !selectedTag}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: text.trim() && selectedTag ? `linear-gradient(135deg, ${tagColor}, ${tagColor}BB)` : inputBg,
                color: text.trim() && selectedTag ? '#fff' : muted,
                border: `1px solid ${text.trim() && selectedTag ? 'transparent' : border}`,
                boxShadow: text.trim() && selectedTag ? `0 4px 16px ${tagColor}55` : 'none',
              }}>
              <Send size={17} />
            </button>
          </div>
        </div>
      </div>

      <UserProfileModal profile={viewingProfile} onClose={() => setViewingProfile(null)} />
    </div>
  )
}
