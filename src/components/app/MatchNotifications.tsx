import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { Heart, MessageCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { useMatchNotifications, type MatchInfo } from '../../hooks/useMatchNotifications'

export function MatchNotifications() {
  const { profile } = useAuth()
  const { dark } = useTheme()
  const navigate = useNavigate()
  const [activeMatch, setActiveMatch] = useState<MatchInfo | null>(null)

  const handleMatch = useCallback((match: MatchInfo) => {
    // Quick toast
    toast.custom(
      (t) => (
        <button
          onClick={() => {
            toast.dismiss(t)
            navigate(`/chat/${match.chatId}`)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.875rem 1rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, rgba(28,18,54,0.97), rgba(20,12,44,0.97))',
            border: '1px solid rgba(255,132,75,0.4)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(255,132,75,0.25), 0 2px 8px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            textAlign: 'left',
          }}>
          <img
            src={match.avatarUrl}
            alt=""
            style={{
              width: 40, height: 40, borderRadius: '0.625rem',
              border: '2px solid rgba(255,132,75,0.45)',
              flexShrink: 0, background: '#E3DCF8',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: '0.82rem',
              color: '#F5F5FA', marginBottom: '0.15rem', lineHeight: 1.2,
            }}>
              💘 It's a Match!
            </p>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.75rem', color: '#A6A4C5',
              overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap', maxWidth: 200, lineHeight: 1.3,
            }}>
              @{match.username} liked you back
            </p>
          </div>
          <span style={{
            fontSize: '0.68rem', color: 'rgba(255,132,75,0.9)',
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, flexShrink: 0,
          }}>
            Chat →
          </span>
        </button>
      ),
      { duration: 6000, position: 'top-center' }
    )

    // Full match card overlay
    setActiveMatch(match)
  }, [navigate])

  useMatchNotifications(handleMatch)

  const cardBg = dark ? 'rgba(18,12,40,0.98)' : 'rgba(255,255,255,0.98)'
  const border = dark ? 'rgba(124,58,237,0.3)' : 'rgba(92,49,242,0.2)'
  const textColor = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'

  return (
    <AnimatePresence>
      {activeMatch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          style={{ background: 'rgba(8,6,20,0.88)', backdropFilter: 'blur(24px)' }}>

          {/* Floating hearts */}
          {[...Array(7)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute pointer-events-none select-none text-2xl"
              style={{ bottom: '38%', left: `${20 + i * 10}%` }}
              initial={{ opacity: 0, y: 0, scale: 0.4 }}
              animate={{
                opacity: [0, 1, 0],
                y: -160,
                scale: [0.4, 1.3, 0.7],
                x: (i % 2 === 0 ? 1 : -1) * (i * 8),
              }}
              transition={{ delay: i * 0.12, duration: 2, ease: 'easeOut' }}>
              {['💘', '💜', '🤍', '✨', '💘', '💜', '✨'][i]}
            </motion.span>
          ))}

          <motion.div
            initial={{ scale: 0.72, opacity: 0, y: 48 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              boxShadow: '0 40px 80px rgba(92,49,242,0.35), 0 0 0 1px rgba(92,49,242,0.08)',
            }}>

            {/* Header */}
            <div
              className="relative pt-8 pb-5 px-6 flex flex-col items-center"
              style={{ background: 'linear-gradient(160deg,rgba(92,49,242,0.14),rgba(255,132,75,0.07))' }}>

              {/* Dismiss */}
              <button
                onClick={() => setActiveMatch(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: muted }}>
                <X size={15} />
              </button>

              {/* Avatars */}
              <div className="flex items-center mb-5">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                  className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
                  style={{
                    border: '3px solid rgba(92,49,242,0.45)',
                    boxShadow: '0 8px 28px rgba(92,49,242,0.3)',
                    zIndex: 2,
                  }}>
                  <img
                    src={profile?.avatarUrl || ''}
                    alt="You"
                    className="w-full h-full object-cover"
                    style={{ background: '#E3DCF8' }}
                  />
                </motion.div>

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
                  className="relative z-10 -mx-2 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg,#FF844B,#FF5353)',
                    boxShadow: '0 4px 16px rgba(255,84,75,0.55)',
                    border: '2.5px solid white',
                  }}>
                  <Heart size={16} fill="#fff" color="#fff" />
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                  className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
                  style={{
                    border: '3px solid rgba(255,132,75,0.45)',
                    boxShadow: '0 8px 28px rgba(255,132,75,0.3)',
                    zIndex: 2,
                  }}>
                  <img
                    src={activeMatch.avatarUrl}
                    alt={activeMatch.username}
                    className="w-full h-full object-cover"
                    style={{ background: '#E3DCF8' }}
                  />
                </motion.div>
              </div>

              {/* Title */}
              <motion.div
                initial={{ scale: 0.55, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 360 }}
                className="text-center">
                <h2 style={{
                  fontFamily: "'Clash Display', sans-serif",
                  fontSize: '2.1rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg,#5C31F2,#FF844B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.05,
                }}>
                  IT'S A MATCH!
                </h2>
              </motion.div>

              <p style={{
                color: muted,
                fontSize: '0.85rem',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                textAlign: 'center',
                marginTop: '0.5rem',
              }}>
                You and{' '}
                <strong style={{ color: textColor }}>@{activeMatch.username}</strong>{' '}
                liked each other
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-4 flex flex-col gap-3">
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => {
                  setActiveMatch(null)
                  navigate(`/chat/${activeMatch.chatId}`)
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg,#5C31F2,#7C3AED)',
                  color: '#fff',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: '0 6px 22px rgba(92,49,242,0.45)',
                }}>
                <MessageCircle size={16} />
                Start Chatting
              </motion.button>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => setActiveMatch(null)}
                className="w-full py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                style={{
                  background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  color: muted,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                Maybe later
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
