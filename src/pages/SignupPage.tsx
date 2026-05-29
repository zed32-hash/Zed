import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { motion } from 'motion/react'
import { Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { FloatingShapes } from '../app/components/FloatingShapes'

export function SignupPage() {
  const { dark } = useTheme()
  const { signUpWithEmail, signInWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const bg = dark
    ? 'linear-gradient(160deg, #0A0914 0%, #1C1236 50%, #0E1A24 100%)'
    : 'linear-gradient(160deg, #FBF9F4 0%, #E3DCF8 55%, #D9E7F9 100%)'

  const cardBg = dark ? 'rgba(28,18,54,0.7)' : 'rgba(255,255,255,0.65)'
  const border = dark ? 'rgba(124,58,237,0.25)' : 'rgba(92,49,242,0.15)'
  const text = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'
  const inputBg = dark ? 'rgba(28,18,54,0.5)' : '#F3F0FC'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password)
        navigate('/onboarding')
      } else {
        await signInWithEmail(email, password)
        navigate('/app')
      }
    } catch (err: any) {
      setError(err.message?.replace('Firebase: ', '').replace(/\(.*\)/, '').trim() || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate('/app')
    } catch (err: any) {
      setError(err.message?.replace('Firebase: ', '').replace(/\(.*\)/, '').trim() || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: bg }}>
      <div className="pointer-events-none absolute inset-0 z-10 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat', backgroundSize: '256px 256px',
          mixBlendMode: dark ? 'overlay' : 'multiply',
        }}
      />
      <FloatingShapes />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 w-full max-w-md mx-4"
      >
        <div className="rounded-3xl p-8"
          style={{ background: cardBg, border: `1px solid ${border}`, backdropFilter: 'blur(24px)', boxShadow: '0 24px 64px rgba(92,49,242,0.12)' }}>
          
          <div className="flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #5C31F2, #7C3AED)', boxShadow: '0 4px 16px rgba(92,49,242,0.4)' }}>
                <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>Z</span>
              </div>
              <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: '1.4rem', color: text }}>ZED</span>
            </Link>
          </div>

          <div className="flex rounded-2xl p-1 mb-6" style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(92,49,242,0.06)' }}>
            {(['signup', 'login'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: mode === m ? 'linear-gradient(135deg, #5C31F2, #7C3AED)' : 'transparent',
                  color: mode === m ? '#fff' : muted,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                {m === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: muted }} />
              <input
                type="email" placeholder="your@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                style={{ background: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem' }}
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: muted }} />
              <input
                type={showPass ? 'text' : 'password'} placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                className="w-full pl-10 pr-10 py-3 rounded-xl outline-none transition-all"
                style={{ background: inputBg, border: `1px solid ${border}`, color: text, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: muted }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p className="text-sm px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255,83,83,0.1)', color: '#FF5353', fontFamily: "'Plus Jakarta Sans', sans-serif", border: '1px solid rgba(255,83,83,0.2)' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="py-3 rounded-xl font-semibold transition-all"
              style={{
                background: loading ? muted : 'linear-gradient(135deg, #5C31F2, #7C3AED)',
                color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: loading ? 'none' : '0 4px 16px rgba(92,49,242,0.4)',
              }}>
              {loading ? 'Please wait…' : (mode === 'signup' ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: border }} />
            <span style={{ color: muted, fontSize: '0.8rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>or</span>
            <div className="flex-1 h-px" style={{ background: border }} />
          </div>

          <button onClick={handleGoogle} disabled={loading}
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            style={{
              background: inputBg, border: `1px solid ${border}`,
              color: text, fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
            <Chrome size={16} />
            Continue with Google
          </button>

          <p className="text-center mt-4 text-sm" style={{ color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {mode === 'signup' ? 'Already have an account? ' : 'No account yet? '}
            <button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              style={{ color: '#5C31F2', fontWeight: 600 }}>
              {mode === 'signup' ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
