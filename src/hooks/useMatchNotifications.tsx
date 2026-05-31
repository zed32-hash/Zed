import { useEffect, useRef, useCallback } from 'react'
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

export interface MatchInfo {
  uid: string
  username: string
  avatarUrl: string
  chatId: string
}

export function useMatchNotifications(onMatch: (match: MatchInfo) => void) {
  const { user } = useAuth()
  const seenRef = useRef<Set<string>>(new Set())
  const initializedRef = useRef(false)
  const onMatchRef = useRef(onMatch)

  useEffect(() => {
    onMatchRef.current = onMatch
  })

  useEffect(() => {
    if (!user) return

    // Listen to all swipes where someone liked me
    const q = query(
      collection(db, 'swipes'),
      where('targetId', '==', user.uid)
    )

    const unsub = onSnapshot(q, async (snap) => {
      // First load: mark all existing swipes as already seen
      if (!initializedRef.current) {
        snap.docs.forEach((d) => seenRef.current.add(d.id))
        initializedRef.current = true
        return
      }

      for (const change of snap.docChanges()) {
        if (change.type !== 'added') continue

        const swipeDoc = change.doc
        const swipeId = swipeDoc.id
        if (seenRef.current.has(swipeId)) continue
        seenRef.current.add(swipeId)

        const swipeData = swipeDoc.data()
        if (swipeData.type !== 'like') continue

        const swiperId = swipeData.swiperId

        // Check if I also liked them back
        try {
          const mySwipeSnap = await getDoc(doc(db, 'swipes', `${user.uid}_${swiperId}`))
          if (!mySwipeSnap.exists() || mySwipeSnap.data().type !== 'like') continue

          // Mutual match — fetch their profile
          const profileSnap = await getDoc(doc(db, 'users', swiperId))
          if (!profileSnap.exists()) continue

          const profileData = profileSnap.data()
          const chatId = [user.uid, swiperId].sort().join('_')

          onMatchRef.current({
            uid: swiperId,
            username: profileData.username || 'someone',
            avatarUrl: profileData.avatarUrl || '',
            chatId,
          })
        } catch (err) {
          console.error('[useMatchNotifications] error:', err)
        }
      }
    })

    return () => {
      unsub()
      initializedRef.current = false
      seenRef.current = new Set()
    }
  }, [user])
}
