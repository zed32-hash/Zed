import { motion } from 'motion/react'
import { useNavigate } from 'react-router'

interface AboutProps { dark: boolean }

export function About({ dark }: AboutProps) {
  const navigate = useNavigate()
  const text = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'
  const border = dark ? 'rgba(124,58,237,0.2)' : 'rgba(92,49,242,0.12)'
  const cardBg = dark ? 'rgba(28,18,54,0.5)' : 'rgba(255,255,255,0.7)'
  const sectionBg = dark ? 'linear-gradient(180deg,#0A0914,#0E0B1E)' : 'linear-gradient(180deg,#FBF9F4,#F4F0FC)'

  return (
    <section id="about" className="relative py-24 px-6" style={{ background: sectionBg }}>
      <div className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat', backgroundSize: '256px 256px', mixBlendMode: dark ? 'overlay' : 'multiply',
        }}
      />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -32 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: dark ? '#7C3AED' : '#5C31F2', marginBottom: '1rem' }}>About ZED</p>
            <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3.25rem)', lineHeight: 1.1, letterSpacing: '-0.025em', color: text, marginBottom: '1.5rem' }}>
              Dating apps have been lying to you.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                "Every major dating app sorts by face. It's not subtle — it's the entire model. Swipe left or right in under two seconds. The outcome is predictable: people with conventional attractiveness get infinite matches. Everyone else stagnates.",
                "ZED was built as a direct rejection of that model. We start from a simple premise: the people you fall for in real life are almost never the ones you would have swiped right on from a headshot.",
                "We are a team of designers, engineers, and researchers who met over text conversations on forums, not on dating apps. We know what it's like to connect without a face involved. We built the platform we wished existed.",
              ].map((para, i) => (
                <p key={i} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: muted, lineHeight: 1.75, fontSize: '0.975rem' }}>{para}</p>
              ))}
            </div>
            <button onClick={() => navigate('/manifesto')}
              style={{ marginTop: '2rem', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.75rem 1.5rem', borderRadius: 14, background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(92,49,242,0.35)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Read the Full Manifesto →
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 32 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col gap-5">
            {[
              { label: 'Founded', value: '2025', sub: 'Built in a basement. Launched to 4,200+ users.' },
              { label: 'Mission', value: 'Anti-appearance', sub: 'Connect people on personality, not profile photos.' },
              { label: 'Model', value: 'Free forever', sub: 'Core features are always free. Premium unlocks are optional.' },
              { label: 'Support', value: '+234 704 179 5388', sub: 'Real humans. Mon–Fri 9 AM – 6 PM ET.' },
            ].map((item) => (
              <div key={item.label} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: '1.25rem 1.5rem', backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center justify-between">
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: muted }}>{item.label}</p>
                  <p style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: dark ? '#7C3AED' : '#5C31F2' }}>{item.value}</p>
                </div>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', color: muted, marginTop: 4 }}>{item.sub}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
