import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

interface ChatSnapshot {
  lastMessageTimestamp: number
  lastMessageSenderId: string
  lastMessagePreview: string
}

export function useMessageNotifications() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const baselineRef = useRef<Record<string, ChatSnapshot>>({})
  const initializedRef = useRef(false)
  const senderCacheRef = useRef<Record<string, { username: string; avatarUrl: string }>>({})

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid))

    const unsub = onSnapshot(q, async (snap) => {
      const now = Date.now()

      if (!initializedRef.current) {
        snap.docs.forEach((d) => {
          const data = d.data()
          const ts = data.lastMessageTimestamp
            ? (data.lastMessageTimestamp.toDate ? data.lastMessageTimestamp.toDate().getTime() : new Date(data.lastMessageTimestamp).getTime())
            : 0
          baselineRef.current[d.id] = {
            lastMessageTimestamp: ts,
            lastMessageSenderId: data.lastMessageSenderId || '',
            lastMessagePreview: data.lastMessagePreview || '',
          }
        })
        initializedRef.current = true
        return
      }

      for (const chatDoc of snap.docs) {
        const data = chatDoc.data()
        const chatId = chatDoc.id
        if (data.status === 'expired') continue

        const ts = data.lastMessageTimestamp
          ? (data.lastMessageTimestamp.toDate ? data.lastMessageTimestamp.toDate().getTime() : new Date(data.lastMessageTimestamp).getTime())
          : 0

        const baseline = baselineRef.current[chatId]
        const prevTs = baseline?.lastMessageTimestamp ?? 0
        const senderId = data.lastMessageSenderId || ''
        const preview = data.lastMessagePreview || ''

        const isNewMessage = ts > prevTs && ts > 0
        const isFromOther = senderId && senderId !== user.uid
        const isCurrentChat = location.pathname === `/chat/${chatId}`

        if (isNewMessage && isFromOther && !isCurrentChat) {
          let sender = senderCacheRef.current[senderId]
          if (!sender) {
            try {
              const uSnap = await getDoc(doc(db, 'users', senderId))
              if (uSnap.exists()) {
                sender = { username: uSnap.data().username, avatarUrl: uSnap.data().avatarUrl }
                senderCacheRef.current[senderId] = sender
              }
            } catch {}
          }

          const username = sender?.username || 'Someone'
          const avatarUrl = sender?.avatarUrl || ''

          toast.custom(
            (t) => (
              <button
                onClick={() => {
                  toast.dismiss(t)
                  navigate(`/chat/${chatId}`)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '1rem',
                  background: 'linear-gradient(135deg, rgba(28,18,54,0.97), rgba(20,12,44,0.97))',
                  border: '1px solid rgba(92,49,242,0.3)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(92,49,242,0.25), 0 2px 8px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt=""
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '0.625rem',
                      border: '2px solid rgba(92,49,242,0.4)',
                      flexShrink: 0,
                      background: '#E3DCF8',
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: '#F5F5FA',
                    marginBottom: '0.15rem',
                    lineHeight: 1.2,
                  }}>
                    💬 @{username}
                  </p>
                  {preview && (
                    <p style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '0.75rem',
                      color: '#A6A4C5',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '200px',
                      lineHeight: 1.3,
                    }}>
                      {preview}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: '0.68rem', color: 'rgba(92,49,242,0.9)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, flexShrink: 0 }}>
                  Tap →
                </span>
              </button>
            ),
            {
              duration: 5000,
              position: 'top-center',
            }
          )
        }

        baselineRef.current[chatId] = { lastMessageTimestamp: ts, lastMessageSenderId: senderId, lastMessagePreview: preview }
      }
    })

    return () => {
      unsub()
      initializedRef.current = false
      baselineRef.current = {}
    }
  }, [user, location.pathname, navigate])
}
