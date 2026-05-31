import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { Heart, X, Search, MapPin, Tags, Ghost, Zap, ChevronRight, User } from 'lucide-react'
import {
  collection, query, where, getDocs, doc, setDoc, serverTimestamp,
  getDoc,
} from 'firebase/firestore'
import TinderCard from 'react-tinder-card'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { AppNavbar } from '../components/app/AppNavbar'
import { HappyHourOverlay } from '../components/app/HappyHourOverlay'
import { UserProfileModal, type ProfileData } from '../components/app/UserProfileModal'

interface Profile {
  uid: string
  username: string
  avatarUrl: string
  bio: string
  tags: string[]
  location: { geohash: string; lat: number; lng: number } | null
  unlimitedChat?: boolean
}

interface MatchState {
  profile: Profile
  chatId: string
}

function compatibilityText(myTags: string[], theirTags: string[]): string {
  const shared = myTags.filter((t) => theirTags.includes(t))
  if (shared.length === 0) return 'Opposites attract — explore the unknown.'
  if (shared.length === 1) return `You both vibe with ${shared[0]}. A spark waiting to ignite.`
  if (shared.length === 2) return `${shared[0]} & ${shared[1]} — two common threads, infinite conversations.`
  return `${shared.length} shared passions: ${shared.slice(0, 2).join(', ')} and more. Compatibility score: 🔥`
}

const VIBES_KEY = (uid: string) => `zed_vibes_${uid}`

export function DiscoveryPage() {
  const { user, profile } = useAuth()
  const { dark } = useTheme()
  const navigate = useNavigate()

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [sortMode, setSortMode] = useState<'location' | 'tags'>('tags')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<Profile | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchState, setMatchState] = useState<MatchState | null>(null)
  const [vibesProfile, setVibesProfile] = useState<Profile | null>(null)
  const [vibesDismissed, setVibesDismissed] = useState(false)
  const [profileModal, setProfileModal] = useState<ProfileData | null>(null)
  const cardRefs = useRef<any[]>([])

  const bg = dark
    ? 'linear-gradient(160deg, #0A0914 0%, #1C1236 50%, #0E1A24 100%)'
    : 'linear-gradient(160deg, #FBF9F4 0%, #E3DCF8 55%, #D9E7F9 100%)'
  const cardBg = dark ? 'rgba(28,18,54,0.85)' : 'rgba(255,255,255,0.75)'
  const border = dark ? 'rgba(124,58,237,0.25)' : 'rgba(92,49,242,0.15)'
  const text = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'
  const inputBg = dark ? 'rgba(28,18,54,0.5)' : '#F3F0FC'

  const loadProfiles = useCallback(async () => {
    if (!user || !profile) return
    setLoading(true)
    try {
      const swipesSnap = await getDocs(query(collection(db, 'swipes'), where('swiperId', '==', user.uid)))
      const swipedIds = new Set(swipesSnap.docs.map((d) => d.data().targetId as string))
      swipedIds.add(user.uid)

      const usersSnap = await getDocs(
        query(collection(db, 'users'), where('status', '==', 'active'), where('isGhostMode', '==', false))
      )

      let candidates: Profile[] = usersSnap.docs
        .filter((d) => !swipedIds.has(d.id))
        .map((d) => {
          const data = d.data()
          return { uid: d.id, username: data.username, avatarUrl: data.avatarUrl, bio: data.bio, tags: data.tags || [], location: data.location || null, unlimitedChat: data.unlimitedChat || false }
        })
        .filter((p) => p.username)

      if (sortMode === 'tags') {
        const myTags = new Set(profile.tags)
        candidates.sort((a, b) => {
          const aShared = a.tags.filter((t) => myTags.has(t)).length
          const bShared = b.tags.filter((t) => myTags.has(t)).length
          return bShared - aShared
        })
      } else if (sortMode === 'location' && profile.location) {
        candidates.sort((a, b) => {
          if (!a.location) return 1
          if (!b.location) return -1
          const distA = Math.abs(a.location.lat - profile.location!.lat) + Math.abs(a.location.lng - profile.location!.lng)
          const distB = Math.abs(b.location.lat - profile.location!.lat) + Math.abs(b.location.lng - profile.location!.lng)
          return distA - distB
        })
      }

      setProfiles(candidates)
      setCurrentIndex(candidates.length - 1)
      cardRefs.current = candidates.map(() => null)

      // Pick vibes card — best tag match, one per day per user
      if (candidates.length > 0) {
        const today = new Date().toDateString()
        const stored = localStorage.getItem(VIBES_KEY(user.uid))
        const parsed = stored ? JSON.parse(stored) : null
        if (parsed?.date === today) {
          setVibesDismissed(true)
          if (parsed.uid) {
            const vp = candidates.find(c => c.uid === parsed.uid) || null
            setVibesProfile(vp)
          }
        } else {
          const myTags = new Set(profile.tags)
          const best = [...candidates].sort((a, b) => {
            const aS = a.tags.filter(t => myTags.has(t)).length
            const bS = b.tags.filter(t => myTags.has(t)).length
            return bS - aS
          })[0]
          setVibesProfile(best || null)
          setVibesDismissed(false)
          localStorage.setItem(VIBES_KEY(user.uid), JSON.stringify({ date: today, uid: best?.uid }))
        }
      }
    } finally {
      setLoading(false)
    }
  }, [user, profile, sortMode])

  useEffect(() => { loadProfiles() }, [loadProfiles])

  const handleSwipe = async (direction: string, targetId: string) => {
    if (!user) return
    const swipeId = `${user.uid}_${targetId}`
    const type = direction === 'right' ? 'like' : 'pass'

    await setDoc(doc(db, 'swipes', swipeId), {
      swiperId: user.uid, targetId, type, timestamp: serverTimestamp(),
    })

    if (type === 'like') {
      const reverseSnap = await getDoc(doc(db, 'swipes', `${targetId}_${user.uid}`))
      if (reverseSnap.exists() && reverseSnap.data().type === 'like') {
        const chatId = [user.uid, targetId].sort().join('_')
        const chatRef = doc(db, 'chats', chatId)
        const chatSnap = await getDoc(chatRef)
        if (!chatSnap.exists()) {
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
          await setDoc(chatRef, {
            participants: [user.uid, targetId],
            createdAt: serverTimestamp(),
            expiresAt,
            status: 'active',
            messageCount: 0,
            lastMessageTimestamp: null,
            typing: {},
          })
        }
        const matched = profiles.find(p => p.uid === targetId)
        if (matched) {
          setMatchState({ profile: matched, chatId })
          setTimeout(() => {
            setMatchState(null)
            navigate(`/chat/${chatId}`)
          }, 2800)
        } else {
          navigate(`/chat/${chatId}`)
        }
        return
      }
    }

    setCurrentIndex((prev) => prev - 1)
  }

  const swipeLeft = () => {
    if (currentIndex >= 0 && cardRefs.current[currentIndex]) cardRefs.current[currentIndex].swipe('left')
  }
  const swipeRight = () => {
    if (currentIndex >= 0 && cardRefs.current[currentIndex]) cardRefs.current[currentIndex].swipe('right')
  }

  const handleVibesConnect = async () => {
    if (!vibesProfile || !user) return
    setVibesDismissed(true)
    await handleSwipe('right', vibesProfile.uid)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    setSearchError('')
    setSearchResult(null)
    try {
      const q = query(collection(db, 'users'), where('username', '==', searchQuery.trim().toLowerCase()))
      const snap = await getDocs(q)
      if (snap.empty) {
        setSearchError('No user found.')
      } else {
        const d = snap.docs[0]
        const data = d.data()
        setSearchResult({ uid: d.id, username: data.username, avatarUrl: data.avatarUrl, bio: data.bio, tags: data.tags || [], location: data.location || null, unlimitedChat: data.unlimitedChat || false })
      }
    } finally {
      setSearchLoading(false)
    }
  }

  const currentProfile = currentIndex >= 0 ? profiles[currentIndex] : null

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: bg }}>
      <div className="pointer-events-none absolute inset-0 z-0 opacity-25"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '256px 256px', mixBlendMode: dark ? 'overlay' : 'multiply' }} />

      <AppNavbar />
      <HappyHourOverlay />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-20 pb-8">
        {/* Search + sort */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: muted }} />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by username…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: cardBg, border: `1px solid ${border}`, color: text, backdropFilter: 'blur(12px)', fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
          </div>
          <button onClick={() => setSortMode((m) => m === 'tags' ? 'location' : 'tags')}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: cardBg, border: `1px solid ${border}`, color: sortMode === 'tags' ? '#5C31F2' : '#FF844B', backdropFilter: 'blur(12px)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {sortMode === 'tags' ? <Tags size={14} /> : <MapPin size={14} />}
            {sortMode === 'tags' ? 'By Tags' : 'By Location'}
          </button>
        </div>

        {searchResult && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-2xl flex items-center gap-3 cursor-pointer"
            onClick={() => setProfileModal(searchResult)}
            style={{ background: cardBg, border: `1px solid ${border}`, backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(92,49,242,0.1)' }}>
            <img src={searchResult.avatarUrl} alt="" className="w-12 h-12 rounded-xl" style={{ border: `2px solid ${border}`, background: '#E3DCF8' }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p style={{ fontWeight: 700, color: text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>@{searchResult.username}</p>
                {searchResult.unlimitedChat && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.1rem 0.4rem', borderRadius: 999, background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', fontSize: '0.58rem', fontWeight: 800, color: '#fff', letterSpacing: '0.06em', flexShrink: 0, boxShadow: '0 2px 6px rgba(92,49,242,0.4)' }}>
                    PRO
                  </span>
                )}
              </div>
              <p style={{ color: muted, fontSize: '0.75rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="truncate">{searchResult.tags.slice(0, 4).join(' ')}</p>
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: '#5C31F2', fontSize: '0.72rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>View profile</span>
              <ChevronRight size={14} style={{ color: '#5C31F2' }} />
              <button onClick={(e) => { e.stopPropagation(); setSearchResult(null); setSearchQuery('') }} style={{ color: muted }}><X size={16} /></button>
            </div>
          </motion.div>
        )}
        {searchError && <p className="text-sm mb-3" style={{ color: '#FF5353', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{searchError}</p>}

        {/* Vibes daily card */}
        <AnimatePresence>
          {!loading && vibesProfile && !vibesDismissed && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              className="mb-4 p-4 rounded-2xl flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, rgba(92,49,242,0.12), rgba(255,132,75,0.08))', border: `1px solid rgba(92,49,242,0.25)`, backdropFilter: 'blur(16px)' }}>
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden" style={{ border: '2px solid rgba(92,49,242,0.35)' }}>
                  <img src={vibesProfile.avatarUrl} alt="" className="w-full h-full" style={{ background: '#E3DCF8' }} />
                </div>
                <span className="absolute -top-1.5 -right-1.5 text-xs">✨</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="flex items-center gap-1" style={{ fontSize: '0.68rem', color: '#5C31F2', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>
                  <Zap size={10} /> Today's Vibe
                </p>
                <p style={{ fontWeight: 700, color: text, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem' }}>@{vibesProfile.username}</p>
                <p style={{ color: muted, fontSize: '0.72rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {(profile?.tags || []).filter(t => vibesProfile.tags.includes(t)).length} shared tags
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleVibesConnect}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 12px rgba(92,49,242,0.35)' }}>
                  <Heart size={11} fill="#fff" /> Connect
                </button>
                <button onClick={() => setVibesDismissed(true)} style={{ color: muted }}>
                  <X size={15} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main swipe area */}
        <div className="relative h-[520px] flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(135deg,#5C31F2,#7C3AED)' }} />
              <p style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem' }}>Finding your people…</p>
            </div>
          ) : profiles.length === 0 || currentIndex < 0 ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <Ghost size={48} style={{ color: muted, opacity: 0.5 }} />
              <h3 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: text }}>You've seen everyone</h3>
              <p style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem' }}>Come back later — new profiles drop daily.</p>
              <button onClick={loadProfiles}
                className="px-5 py-2.5 rounded-xl font-semibold"
                style={{ background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 16px rgba(92,49,242,0.35)' }}>
                Refresh
              </button>
            </div>
          ) : (
            profiles.map((p, i) => (
              <TinderCard key={p.uid} ref={(el: any) => { cardRefs.current[i] = el }}
                onSwipe={(dir) => handleSwipe(dir, p.uid)} preventSwipe={['up', 'down']} className="absolute">
                <div className="rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
                  style={{ width: '340px', height: '480px', background: cardBg, border: `1px solid ${border}`, backdropFilter: 'blur(24px)', boxShadow: i === currentIndex ? '0 24px 64px rgba(92,49,242,0.2)' : '0 8px 24px rgba(0,0,0,0.1)', transform: `rotate(${(i - currentIndex) * 2}deg) scale(${i === currentIndex ? 1 : 0.97})`, transition: 'transform 0.2s', display: i < currentIndex - 2 ? 'none' : 'flex', flexDirection: 'column' }}>
                  <div className="relative h-64 overflow-hidden" style={{ background: dark ? 'rgba(92,49,242,0.1)' : 'rgba(92,49,242,0.06)' }}>
                    <img src={p.avatarUrl} alt={p.username} className="w-full h-full object-cover" style={{ transform: 'scale(1.1)' }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4))' }} />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div className="flex items-end gap-2">
                        <p style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>@{p.username}</p>
                        {p.unlimitedChat && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.15rem 0.5rem', borderRadius: 999, background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', fontSize: '0.62rem', fontWeight: 800, color: '#fff', letterSpacing: '0.06em', flexShrink: 0, boxShadow: '0 2px 8px rgba(92,49,242,0.6)', marginBottom: '0.3rem' }}>
                            PRO
                          </span>
                        )}
                      </div>
                      <button
                        onPointerDown={e => e.stopPropagation()}
                        onClick={e => { e.stopPropagation(); setProfileModal(p) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                        style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <User size={12} /> Profile
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
                    {p.bio && <p style={{ color: muted, fontSize: '0.8rem', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.5 }} className="line-clamp-2">{p.bio}</p>}
                    <div className="flex flex-wrap gap-1.5">
                      {p.tags.slice(0, 5).map((tag) => {
                        const shared = profile?.tags.includes(tag)
                        return (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: shared ? 'rgba(92,49,242,0.15)' : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'), color: shared ? '#5C31F2' : muted, border: `1px solid ${shared ? 'rgba(92,49,242,0.3)' : border}`, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            {tag}
                          </span>
                        )
                      })}
                    </div>
                    <div className="rounded-xl p-3 flex-1" style={{ background: dark ? 'rgba(92,49,242,0.08)' : 'rgba(92,49,242,0.05)', border: `1px solid rgba(92,49,242,0.12)` }}>
                      <p style={{ fontSize: '0.72rem', color: '#5C31F2', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: '0.25rem' }}>✨ Compatibility</p>
                      <p style={{ fontSize: '0.78rem', color: text, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.4 }}>
                        {compatibilityText(profile?.tags || [], p.tags)}
                      </p>
                    </div>
                  </div>
                </div>
              </TinderCard>
            ))
          )}
        </div>

        {!loading && currentIndex >= 0 && profiles.length > 0 && (
          <div className="flex items-center justify-center gap-8 mt-4">
            <button onClick={swipeLeft}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: dark ? 'rgba(255,83,83,0.12)' : 'rgba(255,83,83,0.08)', border: '2px solid rgba(255,83,83,0.25)', color: '#FF5353', boxShadow: '0 4px 16px rgba(255,83,83,0.15)' }}>
              <X size={22} />
            </button>
            <button onClick={swipeRight}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', border: 'none', color: '#fff', boxShadow: '0 4px 20px rgba(92,49,242,0.4)' }}>
              <Heart size={24} fill="#fff" />
            </button>
          </div>
        )}
        {!loading && currentProfile && (
          <p className="text-center mt-3 text-xs" style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {currentIndex + 1} of {profiles.length} · Sorted by {sortMode === 'tags' ? 'shared tags' : 'location'}
          </p>
        )}
      </div>

      {/* Match overlay */}
      <AnimatePresence>
        {matchState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(10,9,20,0.92)', backdropFilter: 'blur(20px)' }}>

            {/* Particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div key={i}
                className="absolute rounded-full"
                style={{ width: 6 + (i % 3) * 4, height: 6 + (i % 3) * 4, background: i % 2 === 0 ? '#5C31F2' : '#FF844B', left: `${10 + (i * 7) % 80}%`, top: `${15 + (i * 11) % 70}%` }}
                animate={{ y: [-20, -60 - i * 8], x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 4)], opacity: [0, 1, 0], scale: [0.5, 1, 0] }}
                transition={{ duration: 1.8, delay: i * 0.1, ease: 'easeOut' }} />
            ))}

            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              className="flex flex-col items-center gap-6 text-center px-8">

              {/* Avatars overlap */}
              <div className="flex items-center justify-center" style={{ position: 'relative', width: 120, height: 64 }}>
                <div className="absolute left-0 w-14 h-14 rounded-2xl overflow-hidden" style={{ border: '3px solid #5C31F2', boxShadow: '0 0 20px rgba(92,49,242,0.5)' }}>
                  {profile?.avatarUrl && <img src={profile.avatarUrl} alt="" className="w-full h-full" style={{ background: '#E3DCF8' }} />}
                </div>
                <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}
                  className="absolute z-10 w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#FF844B,#FF5353)', boxShadow: '0 0 16px rgba(255,132,75,0.7)', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
                  <Heart size={14} fill="#fff" color="#fff" />
                </motion.div>
                <div className="absolute right-0 w-14 h-14 rounded-2xl overflow-hidden" style={{ border: '3px solid #FF844B', boxShadow: '0 0 20px rgba(255,132,75,0.5)' }}>
                  <img src={matchState.profile.avatarUrl} alt="" className="w-full h-full" style={{ background: '#E3DCF8' }} />
                </div>
              </div>

              <div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '0.5rem' }}>
                  It's a Match! 🎉
                </motion.h2>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  style={{ color: '#A6A4C5', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem' }}>
                  You and @{matchState.profile.username} both liked each other
                </motion.p>
              </div>

              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => { setMatchState(null); navigate(`/chat/${matchState.chatId}`) }}
                className="px-8 py-3 rounded-2xl font-bold text-sm"
                style={{ background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 8px 24px rgba(92,49,242,0.5)' }}>
                Start Chatting →
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UserProfileModal profile={profileModal} onClose={() => setProfileModal(null)} />
    </div>
  )
}
