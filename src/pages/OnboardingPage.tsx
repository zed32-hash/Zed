import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { Shuffle, MapPin, Check, ChevronRight } from 'lucide-react'
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { geohashForLocation } from 'geofire-common'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const ALL_TAGS = [
  // Tech & Dev
  '#coding', '#webdev', '#python', '#javascript', '#typescript', '#linux', '#openSource',
  '#AI', '#machinelearning', '#gamedev', '#blockchain', '#crypto', '#startups', '#ux', '#design',
  // Gaming & Anime
  '#gaming', '#anime', '#manga', '#rpg', '#esports',
  // Music
  '#music', '#indierock', '#hiphop', '#jazz', '#kpop', '#classical', '#edm', '#metal',
  // Arts & Culture
  '#art', '#photography', '#writing', '#poetry', '#theatre', '#painting', '#streetart',
  // Film & TV
  '#movies', '#scifi', '#horror', '#documentary', '#netflix', '#filmmaking',
  // Books & Mind
  '#books', '#philosophy', '#history', '#psychology', '#science', '#politics', '#astrology',
  // Fitness & Outdoors
  '#fitness', '#hiking', '#cycling', '#running', '#yoga', '#swimming', '#climbing',
  // Food & Lifestyle
  '#cooking', '#foodie', '#coffee', '#vegan', '#travel', '#camping', '#nightlife', '#minimalism',
  // Misc
  '#fashion', '#sneakers', '#streetwear', '#tattoos', '#sports', '#outdoors', '#meditation', '#spirituality',
]

function randomSeed() {
  return Math.random().toString(36).slice(2, 10)
}

const AVATAR_STYLES = [
  { key: 'avataaars', label: 'Character' },
  { key: 'personas', label: 'Persona' },
  { key: 'lorelei', label: 'Lorelei' },
  { key: 'notionists', label: 'Notion' },
]

export function OnboardingPage() {
  const { user, refreshProfile } = useAuth()
  const { dark } = useTheme()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [avatarSeed, setAvatarSeed] = useState(randomSeed())
  const [avatarStyle, setAvatarStyle] = useState('avataaars')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationData, setLocationData] = useState<{ geohash: string; lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState('')
  const [saving, setSaving] = useState(false)

  const bg = dark
    ? 'linear-gradient(160deg, #0A0914 0%, #1C1236 50%, #0E1A24 100%)'
    : 'linear-gradient(160deg, #FBF9F4 0%, #E3DCF8 55%, #D9E7F9 100%)'
  const cardBg = dark ? 'rgba(28,18,54,0.7)' : 'rgba(255,255,255,0.65)'
  const border = dark ? 'rgba(124,58,237,0.25)' : 'rgba(92,49,242,0.15)'
  const text = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'
  const inputBg = dark ? 'rgba(28,18,54,0.5)' : '#F3F0FC'

  const bgColor = avatarStyle === 'avataaars' ? 'b6e3f4,c0aede,d1d4f9,ffd5dc' : 'b6e3f4,c0aede,d1d4f9'
  const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}&backgroundColor=${bgColor}&size=128`

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (username.length < 3) { setUsernameError(''); return }
    setUsernameChecking(true)
    timer = setTimeout(async () => {
      const q = query(collection(db, 'users'), where('username', '==', username))
      const snap = await getDocs(q)
      const taken = snap.docs.some((d) => d.id !== user?.uid)
      setUsernameError(taken ? 'Username already taken.' : '')
      setUsernameChecking(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [username, user])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 7 ? [...prev, tag] : prev
    )
  }

  const captureLocation = () => {
    setLocationLoading(true)
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const geohash = geohashForLocation([lat, lng])
        setLocationData({ geohash, lat, lng })
        setLocationLoading(false)
      },
      (err) => {
        setLocationError(err.message || 'Location access denied.')
        setLocationLoading(false)
      }
    )
  }

  const canNext = [
    username.length >= 3 && !usernameError && !usernameChecking,
    true,
    selectedTags.length >= 3,
    true,
  ][step]

  const handleFinish = async () => {
    if (!user) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        username,
        avatarUrl,
        bio,
        tags: selectedTags,
        location: locationData,
        status: 'active',
      })
      await refreshProfile()
      navigate('/rooms')
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const steps = ['Identity', 'Avatar', 'Interests', 'Location']

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: bg }}>
      <div className="pointer-events-none absolute inset-0 z-10 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat', backgroundSize: '256px 256px', mixBlendMode: dark ? 'overlay' : 'multiply',
        }}
      />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-20 w-full max-w-lg mx-4">
        <div className="rounded-3xl p-8"
          style={{ background: cardBg, border: `1px solid ${border}`, backdropFilter: 'blur(24px)', boxShadow: '0 24px 64px rgba(92,49,242,0.12)' }}>

          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      background: i < step ? '#5C31F2' : i === step ? 'linear-gradient(135deg,#5C31F2,#7C3AED)' : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(92,49,242,0.08)'),
                      color: i <= step ? '#fff' : muted,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                    {i < step ? <Check size={12} /> : i + 1}
                  </div>
                  <span className="text-xs hidden sm:block" style={{ color: i === step ? text : muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: i === step ? 600 : 400 }}>{s}</span>
                </div>
                {i < steps.length - 1 && <div className="flex-1 h-px" style={{ background: i < step ? '#5C31F2' : border }} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.6rem', fontWeight: 700, color: text }}>Choose your alias</h2>
                <p style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem' }}>Your identity on ZED — anonymous and uniquely yours.</p>
                <div>
                  <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. cosmic_wanderer" maxLength={20}
                    className="w-full px-4 py-3 rounded-xl outline-none"
                    style={{ background: inputBg, border: `1px solid ${usernameError ? '#FF5353' : border}`, color: text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                  <div className="mt-1.5 flex items-center justify-between">
                    <p className="text-xs" style={{ color: usernameError ? '#FF5353' : usernameChecking ? '#FF844B' : username.length >= 3 ? '#22C55E' : muted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {usernameError || (usernameChecking ? 'Checking…' : username.length >= 3 ? '✓ Available' : 'Min 3 characters, letters/numbers/_')}
                    </p>
                    <span className="text-xs" style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{username.length}/20</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Bio (optional)</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={180}
                    placeholder="A little about the vibe you bring…"
                    className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                    style={{ background: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem' }}
                  />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center gap-5">
                <div>
                  <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.6rem', fontWeight: 700, color: text, textAlign: 'center' }}>Your avatar</h2>
                  <p style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', textAlign: 'center', marginTop: '0.5rem' }}>Pick a style, then randomize until something clicks.</p>
                </div>

                <div className="w-36 h-36 rounded-3xl overflow-hidden"
                  style={{ border: `3px solid ${border}`, boxShadow: '0 12px 32px rgba(92,49,242,0.2)', background: '#E3DCF8' }}>
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full" />
                </div>

                <div className="flex gap-2 flex-wrap justify-center">
                  {AVATAR_STYLES.map((s) => (
                    <button key={s.key} onClick={() => { setAvatarStyle(s.key); setAvatarSeed(randomSeed()) }}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{
                        background: avatarStyle === s.key ? 'linear-gradient(135deg,#5C31F2,#7C3AED)' : inputBg,
                        color: avatarStyle === s.key ? '#fff' : muted,
                        border: `1px solid ${avatarStyle === s.key ? '#5C31F2' : border}`,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>

                <button onClick={() => setAvatarSeed(randomSeed())}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold"
                  style={{ background: 'linear-gradient(135deg, #5C31F2, #7C3AED)', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 16px rgba(92,49,242,0.4)' }}>
                  <Shuffle size={16} /> 🎲 Randomize
                </button>
                <p style={{ color: muted, fontSize: '0.8rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Keep randomizing until something clicks</p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <div>
                  <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.6rem', fontWeight: 700, color: text }}>Your vibe tags</h2>
                  <p style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', marginTop: '0.25rem' }}>Pick 3–7 tags. These drive your matches.</p>
                </div>
                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                  {ALL_TAGS.map((tag) => {
                    const selected = selectedTags.includes(tag)
                    return (
                      <button key={tag} onClick={() => toggleTag(tag)}
                        className="px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
                        style={{
                          background: selected ? 'linear-gradient(135deg,#5C31F2,#7C3AED)' : inputBg,
                          color: selected ? '#fff' : muted,
                          border: `1px solid ${selected ? '#5C31F2' : border}`,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          transform: selected ? 'scale(1.04)' : 'scale(1)',
                          flexShrink: 0,
                        }}>
                        {tag}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs" style={{ color: selectedTags.length >= 3 ? '#22C55E' : muted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {selectedTags.length}/7 selected {selectedTags.length >= 3 ? '✓' : `(need at least ${3 - selectedTags.length} more)`}
                </p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5">
                <div>
                  <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.6rem', fontWeight: 700, color: text }}>Your location</h2>
                  <p style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', marginTop: '0.25rem' }}>Used to find people nearby. Your exact position is never stored — only a proximity hash.</p>
                </div>
                {!locationData ? (
                  <button onClick={captureLocation} disabled={locationLoading}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
                    style={{ background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 16px rgba(92,49,242,0.4)', border: 'none', cursor: 'pointer' }}>
                    <MapPin size={16} />
                    {locationLoading ? 'Detecting…' : 'Enable Location'}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-xl"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <Check size={18} color="#22C55E" />
                    <span style={{ color: '#22C55E', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.875rem' }}>Location captured ✓</span>
                  </div>
                )}
                {locationError && <p className="text-sm" style={{ color: '#FF5353', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{locationError}</p>}
                <p style={{ color: muted, fontSize: '0.8rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  You can skip this — you'll still match by shared tags.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)}
                className="px-5 py-3 rounded-xl font-semibold"
                style={{ background: inputBg, border: `1px solid ${border}`, color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif", cursor: 'pointer' }}>
                Back
              </button>
            )}
            <button
              onClick={step < 3 ? () => setStep((s) => s + 1) : handleFinish}
              disabled={(!canNext && step < 3) || saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all"
              style={{
                background: (!canNext && step < 3) || saving ? muted : 'linear-gradient(135deg,#5C31F2,#7C3AED)',
                color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: (!canNext && step < 3) || saving ? 'none' : '0 4px 16px rgba(92,49,242,0.4)',
                border: 'none', cursor: ((!canNext && step < 3) || saving) ? 'not-allowed' : 'pointer',
              }}>
              {step === 3 ? (saving ? 'Saving…' : 'Enter ZED') : <>Next <ChevronRight size={16} /></>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
