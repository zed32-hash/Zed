import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { X, MessageCircle, Tag } from 'lucide-react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

export interface ProfileData {
  uid: string
  username: string
  avatarUrl: string
  bio?: string
  tags: string[]
  unlimitedChat?: boolean
}

interface UserProfileModalProps {
  profile: ProfileData | null
  onClose: () => void
}

export function UserProfileModal({ profile, onClose }: UserProfileModalProps) {
  const { user, profile: myProfile } = useAuth()
  const { dark } = useTheme()
  const navigate = useNavigate()
  const [messaging, setMessaging] = useState(false)

  const cardBg = dark ? 'rgba(28,18,54,0.97)' : 'rgba(255,255,255,0.98)'
  const border = dark ? 'rgba(124,58,237,0.25)' : 'rgba(92,49,242,0.15)'
  const text = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'

  const sharedTags = (myProfile?.tags || []).filter(t => profile?.tags.includes(t))
  const isOwnProfile = user?.uid === profile?.uid

  const handleMessage = async () => {
    if (!user || !profile || isOwnProfile || messaging) return
    setMessaging(true)
    try {
      const chatId = [user.uid, profile.uid].sort().join('_')
      const chatRef = doc(db, 'chats', chatId)
      const chatSnap = await getDoc(chatRef)
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, profile.uid],
          createdAt: serverTimestamp(),
          expiresAt: null,
          status: 'active',
          messageCount: 0,
          lastMessageTimestamp: null,
          typing: {},
        })
      }
      onClose()
      navigate(`/chat/${chatId}`)
    } finally {
      setMessaging(false)
    }
  }

  return (
    <AnimatePresence>
      {profile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: cardBg, border: `1px solid ${border}`, boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}
          >
            {/* Avatar header */}
            <div className="relative h-40 flex items-center justify-center"
              style={{ background: dark ? 'rgba(92,49,242,0.12)' : 'rgba(92,49,242,0.06)' }}>
              <img
                src={profile.avatarUrl}
                alt={profile.username}
                className="w-24 h-24 rounded-2xl object-cover"
                style={{ border: `3px solid rgba(92,49,242,0.3)`, boxShadow: '0 8px 32px rgba(92,49,242,0.25)', background: '#E3DCF8' }}
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', color: muted }}>
                <X size={16} />
              </button>
              {sharedTags.length > 0 && (
                <div className="absolute top-4 left-4 flex items-center gap-1 px-2 py-1 rounded-xl"
                  style={{ background: 'rgba(92,49,242,0.15)', border: '1px solid rgba(92,49,242,0.25)' }}>
                  <span style={{ fontSize: '0.68rem', color: '#5C31F2', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    ✨ {sharedTags.length} shared
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: text }}>
                  @{profile.username}
                </h2>
                {profile.unlimitedChat && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: 999, background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', fontSize: '0.62rem', fontWeight: 800, color: '#fff', letterSpacing: '0.06em', flexShrink: 0, boxShadow: '0 2px 8px rgba(92,49,242,0.45)', marginTop: '0.25rem' }}>
                    PRO
                  </span>
                )}
              </div>

              {profile.bio && (
                <p style={{ color: muted, fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.55, marginBottom: '1rem' }}>
                  {profile.bio}
                </p>
              )}

              {/* Tags */}
              {profile.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tag size={12} style={{ color: muted }} />
                    <span style={{ fontSize: '0.7rem', color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vibes</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.tags.map(tag => {
                      const isShared = sharedTags.includes(tag)
                      return (
                        <span key={tag}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: isShared ? 'rgba(92,49,242,0.15)' : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                            color: isShared ? '#5C31F2' : muted,
                            border: `1px solid ${isShared ? 'rgba(92,49,242,0.3)' : border}`,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}>
                          {tag}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Shared tags highlight */}
              {sharedTags.length > 0 && (
                <div className="mb-4 p-3 rounded-2xl"
                  style={{ background: dark ? 'rgba(92,49,242,0.08)' : 'rgba(92,49,242,0.05)', border: '1px solid rgba(92,49,242,0.12)' }}>
                  <p style={{ fontSize: '0.75rem', color: '#5C31F2', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    ✨ You both vibe with {sharedTags.slice(0, 2).join(', ')}{sharedTags.length > 2 ? ` +${sharedTags.length - 2} more` : ''}
                  </p>
                </div>
              )}

              {/* Actions */}
              {!isOwnProfile && (
                <button
                  onClick={handleMessage}
                  disabled={messaging}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all"
                  style={{
                    background: messaging ? (dark ? 'rgba(92,49,242,0.3)' : 'rgba(92,49,242,0.15)') : 'linear-gradient(135deg,#5C31F2,#7C3AED)',
                    color: messaging ? '#5C31F2' : '#fff',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxShadow: messaging ? 'none' : '0 6px 20px rgba(92,49,242,0.4)',
                  }}>
                  <MessageCircle size={16} />
                  {messaging ? 'Opening…' : 'Message'}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
