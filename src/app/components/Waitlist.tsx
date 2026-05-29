import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, ArrowRight } from 'lucide-react'

interface WaitlistProps { dark: boolean }

export function Waitlist({ dark }: WaitlistProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const text = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'
  const border = dark ? 'rgba(124,58,237,0.25)' : 'rgba(92,49,242,0.15)'
  const inputBg = dark ? 'rgba(28,18,54,0.6)' : 'rgba(255,255,255,0.8)'
  const sectionBg = dark
    ? 'linear-gradient(135deg,#1C1236 0%,#0A0914 100%)'
    : 'linear-gradient(135deg,#E3DCF8 0%,#D9E7F9 100%)'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <section id="waitlist" className="relative py-28 px-6 overflow-hidden" style={{ background: sectionBg }}>
      <div className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat', backgroundSize: '256px 256px', mixBlendMode: dark ? 'overlay' : 'multiply',
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: dark ? 'rgba(92,49,242,0.12)' : 'rgba(92,49,242,0.08)' }} />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: dark ? '#7C3AED' : '#5C31F2', marginBottom: '1rem' }}>
          Early Access
        </motion.p>

        <motion.h2 initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.03em', color: text, marginBottom: '1rem' }}>
          Join the waitlist.
        </motion.h2>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: muted, fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '2.5rem' }}>
          ZED is in private beta. Drop your email and we'll let you in as soon as a slot opens. No spam. Just one ping when you're off the list.
        </motion.p>

        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '1rem 2rem', borderRadius: 16, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={16} color="#22C55E" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, color: '#22C55E', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>You're on the list.</p>
              <p style={{ fontSize: '0.8rem', color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>We'll reach out when your slot opens.</p>
            </div>
          </motion.div>
        ) : (
          <motion.form initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  flex: 1, padding: '0.875rem 1.25rem', borderRadius: 14, background: inputBg, border: `1px solid ${error ? '#FF5353' : border}`, color: text, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.95rem', outline: 'none', backdropFilter: 'blur(12px)',
                }}
              />
              <button type="submit" disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.875rem 1.5rem', borderRadius: 14, background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(92,49,242,0.4)', whiteSpace: 'nowrap', fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Joining…' : <><ArrowRight size={16} /> Join</>}
              </button>
            </div>
            {error && <p style={{ color: '#FF5353', fontSize: '0.8rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{error}</p>}
            <p style={{ fontSize: '0.75rem', color: muted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              4,200+ people already waiting. No spam, ever. Unsubscribe anytime.
            </p>
          </motion.form>
        )}

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12">
          {[
            { val: '4,200+', label: 'on the waitlist' },
            { val: 'Private Beta', label: 'currently live' },
            { val: '< 24h', label: 'avg invite time' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: '1.5rem', color: text, lineHeight: 1 }}>{stat.val}</p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.75rem', color: muted, marginTop: 4 }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
