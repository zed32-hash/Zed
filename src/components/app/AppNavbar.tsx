import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { Sun, Moon, MessageCircle, Compass, LogOut, Ghost, Menu, X } from 'lucide-react'
import { doc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

const INBOX_LAST_VISIT_KEY = (uid: string) => `zed_inbox_last_visit_${uid}`

function useUnreadChatsCount(uid: string | undefined) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!uid) return

    const q = query(collection(db, 'chats'), where('participants', 'array-contains', uid))
    const unsub = onSnapshot(q, (snap) => {
      const lastVisit = parseInt(localStorage.getItem(INBOX_LAST_VISIT_KEY(uid)) || '0', 10)
      let unread = 0
      snap.docs.forEach((d) => {
        const data = d.data()
        if (data.status === 'expired') return
        if (!data.messageCount || data.messageCount === 0) return
        const lastMsg: number = data.lastMessageTimestamp
          ? (data.lastMessageTimestamp.toDate
            ? data.lastMessageTimestamp.toDate().getTime()
            : new Date(data.lastMessageTimestamp).getTime())
          : 0
        if (lastMsg > lastVisit) unread++
      })
      setCount(unread)
    })
    return unsub
  }, [uid])

  return count
}

export function AppNavbar() {
  const { user, profile, logout } = useAuth()
  const { dark, toggleDark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [ghostLoading, setGhostLoading] = useState(false)

  const unreadCount = useUnreadChatsCount(user?.uid)

  const border = dark ? 'rgba(124,58,237,0.2)' : 'rgba(92,49,242,0.1)'
  const text = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'
  const bg = dark ? 'rgba(10,9,20,0.75)' : 'rgba(251,249,244,0.75)'

  const toggleGhostMode = async () => {
    if (!user || !profile) return
    setGhostLoading(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), { isGhostMode: !profile.isGhostMode })
    } finally {
      setGhostLoading(false)
      setMenuOpen(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleInboxClick = () => {
    if (user) {
      localStorage.setItem(INBOX_LAST_VISIT_KEY(user.uid), Date.now().toString())
    }
    navigate('/inbox')
  }

  const navItems = [
    { path: '/app', icon: Compass, label: 'Discover', onClick: () => navigate('/app') },
    { path: '/inbox', icon: MessageCircle, label: 'Inbox', onClick: handleInboxClick },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
      style={{ background: bg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${border}` }}>
      <button onClick={() => navigate('/app')} className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', boxShadow: '0 4px 12px rgba(92,49,242,0.35)' }}>
          <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1rem' }}>Z</span>
        </div>
        <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: text }}>ZED</span>
      </button>

      <div className="flex items-center gap-1">
        {navItems.map(({ path, icon: Icon, label, onClick }) => {
          const active = location.pathname === path
          const isInbox = path === '/inbox'
          const showBadge = isInbox && unreadCount > 0
          return (
            <button key={path} onClick={onClick}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all"
              style={{
                background: active ? (dark ? 'rgba(92,49,242,0.15)' : 'rgba(92,49,242,0.1)') : 'transparent',
                color: active ? '#5C31F2' : muted,
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', fontWeight: 600,
              }}>
              <span className="relative">
                <Icon size={15} />
                {showBadge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      minWidth: 14,
                      height: 14,
                      borderRadius: 999,
                      background: 'linear-gradient(135deg,#FF844B,#FF5353)',
                      color: '#fff',
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      boxShadow: '0 1px 6px rgba(255,83,83,0.5)',
                      lineHeight: 1,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </span>
              <span className="hidden sm:block">{label}</span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2">
        {profile?.avatarUrl && (
          <div className="w-8 h-8 rounded-xl overflow-hidden cursor-pointer"
            style={{ border: `2px solid ${border}` }}
            onClick={() => setMenuOpen(!menuOpen)}>
            <img src={profile.avatarUrl} alt="" className="w-full h-full" style={{ background: '#E3DCF8' }} />
          </div>
        )}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: muted }}>
          {menuOpen ? <X size={15} /> : <Menu size={15} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="absolute top-full right-4 mt-2 rounded-2xl p-2 min-w-[180px]"
            style={{ background: dark ? '#1C1236' : '#FBF9F4', border: `1px solid ${border}`, boxShadow: '0 16px 40px rgba(0,0,0,0.15)', backdropFilter: 'blur(20px)', zIndex: 100 }}>

            {profile && (
              <div className="px-3 py-2 mb-1 border-b" style={{ borderColor: border }}>
                <p style={{ fontWeight: 700, color: text, fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>@{profile.username}</p>
                <p style={{ color: muted, fontSize: '0.72rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{profile.tags.slice(0, 2).join(' ')}</p>
              </div>
            )}

            <button onClick={toggleDark}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm"
              style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              onMouseEnter={(e) => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              {dark ? <Sun size={14} /> : <Moon size={14} />}
              {dark ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button onClick={toggleGhostMode} disabled={ghostLoading}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm"
              style={{ color: profile?.isGhostMode ? '#5C31F2' : muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: profile?.isGhostMode ? 600 : 400 }}
              onMouseEnter={(e) => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <Ghost size={14} />
              {profile?.isGhostMode ? 'Ghost Mode ON' : 'Ghost Mode'}
            </button>

            <div className="border-t mt-1 pt-1" style={{ borderColor: border }}>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm"
                style={{ color: '#FF5353', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,83,83,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
