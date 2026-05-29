import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const sections = [
  {
    heading: 'We are tired of the highlight reel.',
    body: `Every other dating app starts with a face. A filtered, curated, perfect face. You swipe on symmetry and call it chemistry. You match on a jaw angle and wonder why the conversation dies in two messages. The whole system optimises for first impressions at the expense of everything that actually matters.

ZED was built in protest.`,
  },
  {
    heading: 'Anonymity is not a gimmick.',
    body: `When you remove a face from the equation, something strange happens — people actually talk. Not small talk. Real talk. You are forced to bring yourself to the conversation, because there is nothing else to hide behind.

Your avatar is abstract. Your name is a chosen alias. Your photos stay locked. The only currency here is how you think, what you say, and the vibe you bring.`,
  },
  {
    heading: 'The Crucible: 20 messages per day.',
    body: `This is not a bug. It is the core mechanic.

When you have unlimited messages, you spam. You ghost. You send "hey" to forty people and wait to see who bites. ZED kills that dynamic entirely. Twenty messages per day per conversation. Forced scarcity. Every message becomes intentional.

People who hate this rule are people who were never going to be serious anyway.`,
  },
  {
    heading: 'Earn the reveal. Don\'t expect it.',
    body: `Photos, voice notes, real names — they are not free. They are unlocked incrementally as a conversation deepens. This is how it should work. Trust is built through conversation, not handed out with a profile visit.

Depth clears the blur. The more you connect, the more you see. If you are here for instant gratification, there are a hundred other apps for that.`,
  },
  {
    heading: 'Happy Hour is chaos. That\'s the point.',
    body: `Every night at 8 PM, the algorithm goes blind. No tag matching, no proximity filters. Just two strangers thrown into a 5-minute speed conversation with no context, no profiles, no hints.

You get a verdict window at the end. Mutual interest? The chat continues. One-sided or neither? It dissolves. Clean. No awkward lingering. No ghosting anxiety.`,
  },
  {
    heading: 'Ghost Mode respects your autonomy.',
    body: `Some nights you don't want to be found. Ghost Mode removes you from the discovery pool entirely — you won't appear in anyone's swipe deck, and you won't be matched in Happy Hour. Your existing chats continue unaffected.

Privacy is not a premium feature. It is a right.`,
  },
  {
    heading: 'This is the manifesto.',
    body: `We believe the best relationships start with curiosity, not attraction. We believe the best conversations happen between strangers who have nothing to prove. We believe that if you cannot hold someone's interest with words alone, a face was never going to save you.

ZED is not for everyone. It is for people who are interesting.

Drop your alias. Start talking.`,
  },
]

export function ManifestoPage() {
  const navigate = useNavigate()
  const { dark, toggleDark } = useTheme()

  const bg = dark
    ? 'linear-gradient(160deg, #0A0914 0%, #1C1236 60%, #0E1A24 100%)'
    : 'linear-gradient(160deg, #FBF9F4 0%, #E3DCF8 60%, #D9E7F9 100%)'
  const text = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'
  const border = dark ? 'rgba(124,58,237,0.2)' : 'rgba(92,49,242,0.12)'

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat', backgroundSize: '256px 256px', mixBlendMode: dark ? 'overlay' : 'multiply',
        }}
      />

      <div style={{ position: 'fixed', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', zIndex: 50 }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: dark ? 'rgba(28,18,54,0.7)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: `1px solid ${border}`, borderRadius: 12, padding: '0.5rem 1rem', color: muted, fontSize: '0.875rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <ArrowLeft size={15} /> Back
        </button>
        <button onClick={toggleDark} style={{ background: dark ? 'rgba(28,18,54,0.7)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: `1px solid ${border}`, borderRadius: 12, padding: '0.5rem', color: muted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '6rem 2rem 4rem', position: 'relative', zIndex: 10 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: dark ? '#7C3AED' : '#5C31F2', marginBottom: '1rem' }}>ZED Manifesto</p>
          <h1 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: text, marginBottom: '1rem' }}>
            Personality over{' '}
            <span style={{ background: 'linear-gradient(135deg,#5C31F2,#FF844B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>aesthetics.</span>
          </h1>
          <p style={{ color: muted, fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '4rem' }}>
            This is what we believe and why we built ZED the way we did.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
          {sections.map((section, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.05 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                <div style={{ flexShrink: 0, width: 2, marginTop: 6, height: '100%', background: 'linear-gradient(180deg,#5C31F2,transparent)' }} />
                <div>
                  <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', lineHeight: 1.2, color: text, marginBottom: '1rem', letterSpacing: '-0.02em' }}>{section.heading}</h2>
                  {section.body.split('\n\n').map((para, j) => (
                    <p key={j} style={{ color: muted, fontSize: '1rem', lineHeight: 1.75, marginBottom: '0.75rem' }}>{para}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ marginTop: '5rem', textAlign: 'center', borderTop: `1px solid ${border}`, paddingTop: '3rem' }}>
          <button onClick={() => navigate('/signup')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.875rem 2rem', borderRadius: 16, background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', color: '#fff', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(92,49,242,0.4)' }}>
            Drop Your Alias →
          </button>
          <p style={{ color: muted, fontSize: '0.8rem', marginTop: '1rem' }}>Free to join. No face required.</p>
        </motion.div>
      </div>
    </div>
  )
}
