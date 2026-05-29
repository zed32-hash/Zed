import { motion } from 'motion/react'
import { Ghost, Zap, Lock, MessageSquare, Eye, UserCheck, MapPin, Flame } from 'lucide-react'

interface FeaturesProps { dark: boolean }

const features = [
  {
    icon: Lock,
    tag: 'Anonymous Identity',
    title: 'A face that isn\'t yours.',
    body: 'Pick an alias. Get a generated avatar. Your email, your face, and your real name never surface to anyone. You are whoever you choose to be, and nothing more.',
    accent: '#5C31F2',
    iconBgLight: 'rgba(92,49,242,0.1)',
    iconBgDark: 'rgba(124,58,237,0.15)',
  },
  {
    icon: MessageSquare,
    tag: 'The Crucible',
    title: '20 messages. Make them count.',
    body: 'A hard daily limit on messages forces intentional conversation. No spam, no lazy openers. Every message you send has to mean something.',
    accent: '#FF844B',
    iconBgLight: 'rgba(255,132,75,0.1)',
    iconBgDark: 'rgba(255,132,75,0.15)',
  },
  {
    icon: Eye,
    tag: 'Tiered Reveals',
    title: 'Depth clears the blur.',
    body: 'Photos and personal details unlock incrementally as conversations deepen. 0 messages: full blur. 16+ messages: partial reveal. 51+: fully visible. Earn the reveal.',
    accent: '#06b6d4',
    iconBgLight: 'rgba(6,182,212,0.1)',
    iconBgDark: 'rgba(6,182,212,0.12)',
  },
  {
    icon: Zap,
    tag: 'Happy Hour',
    title: 'Blind matching. Every night.',
    body: 'At 8 PM sharp, the algorithm goes blind. Two strangers, 5 minutes, no context. A mutual verdict decides if it continues. No awkward lingering if it doesn\'t.',
    accent: '#FF5353',
    iconBgLight: 'rgba(255,83,83,0.1)',
    iconBgDark: 'rgba(255,83,83,0.12)',
  },
  {
    icon: Ghost,
    tag: 'Ghost Mode',
    title: 'Disappear when you need to.',
    body: 'Toggle Ghost Mode from the nav bar to vanish from the swipe deck and Happy Hour queue entirely. Your active chats continue. You just can\'t be found.',
    accent: '#8B5CF6',
    iconBgLight: 'rgba(139,92,246,0.1)',
    iconBgDark: 'rgba(139,92,246,0.12)',
  },
  {
    icon: Flame,
    tag: 'Vibe Matching',
    title: 'Connected by personality.',
    body: 'Choose 3–7 interest tags that describe you. The swipe deck surfaces profiles with the highest tag overlap — the more you share, the higher they rank.',
    accent: '#f59e0b',
    iconBgLight: 'rgba(245,158,11,0.1)',
    iconBgDark: 'rgba(245,158,11,0.12)',
  },
  {
    icon: MapPin,
    tag: 'Proximity',
    title: 'Nearby, not exact.',
    body: 'Optional location matching surfaces people in your area. We store only a rough geohash — never your precise GPS coordinates. Privacy by architecture.',
    accent: '#22c55e',
    iconBgLight: 'rgba(34,197,94,0.1)',
    iconBgDark: 'rgba(34,197,94,0.12)',
  },
  {
    icon: UserCheck,
    tag: 'Safe Reporting',
    title: 'A community that self-regulates.',
    body: 'Report bad actors in one tap. Three verified reports triggers an automatic review. Repeat offenders are permanently removed. No harassment survives here.',
    accent: '#ec4899',
    iconBgLight: 'rgba(236,72,153,0.1)',
    iconBgDark: 'rgba(236,72,153,0.12)',
  },
]

export function Features({ dark }: FeaturesProps) {
  const text = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'
  const sectionBg = dark
    ? 'linear-gradient(180deg, #0E0B1E 0%, #0A0914 100%)'
    : 'linear-gradient(180deg, #F4F0FC 0%, #FBF9F4 100%)'

  return (
    <section id="features" className="relative py-24 px-6 overflow-hidden" style={{ background: sectionBg }}>
      <div className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat', backgroundSize: '256px 256px', mixBlendMode: dark ? 'overlay' : 'multiply',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: dark ? '#7C3AED' : '#5C31F2', marginBottom: '1rem' }}>
            Product
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.025em', color: text, marginBottom: '1rem' }}>
            Everything built around connection,<br />
            <span style={{ background: 'linear-gradient(135deg,#5C31F2,#FF844B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>nothing built around vanity.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.05rem', color: muted, maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
            Eight mechanics that work together to make conversations feel like they actually matter.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div key={f.tag}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: i * 0.07 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="relative p-6 rounded-2xl overflow-hidden group"
                style={{
                  background: dark ? 'rgba(28,18,54,0.55)' : 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${dark ? 'rgba(124,58,237,0.18)' : 'rgba(92,49,242,0.1)'}`,
                  boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 24px rgba(92,49,242,0.06)',
                }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `${f.accent}22` }} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: dark ? f.iconBgDark : f.iconBgLight, border: `1px solid ${f.accent}22` }}>
                  <Icon size={18} style={{ color: f.accent }} />
                </div>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: f.accent, marginBottom: '0.5rem' }}>{f.tag}</p>
                <h3 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: text, marginBottom: '0.6rem', lineHeight: 1.25 }}>{f.title}</h3>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', lineHeight: 1.65, color: muted }}>{f.body}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
