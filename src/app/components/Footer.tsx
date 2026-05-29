import { useNavigate } from 'react-router'
import { Phone, Mail } from 'lucide-react'

interface FooterProps { dark: boolean }

export function Footer({ dark }: FooterProps) {
  const navigate = useNavigate()

  const text = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'
  const border = dark ? 'rgba(124,58,237,0.15)' : 'rgba(92,49,242,0.08)'

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const productLinks: { label: string; action: () => void }[] = [
    { label: 'Features', action: () => scrollTo('features') },
    { label: 'How It Works', action: () => scrollTo('how-it-works') },
    { label: 'Happy Hour', action: () => scrollTo('happy-hour') },
    { label: 'Roadmap', action: () => {} },
    { label: 'Changelog', action: () => {} },
  ]

  const legalLinks: { label: string; action: () => void }[] = [
    { label: 'Privacy Policy', action: () => navigate('/privacy') },
    { label: 'Terms of Service', action: () => navigate('/terms') },
    { label: 'Cookie Policy', action: () => navigate('/privacy#cookies') },
    { label: 'Manifesto', action: () => navigate('/manifesto') },
  ]

  return (
    <footer className="relative py-20 px-6"
      style={{ background: dark ? '#0A0914' : '#FBF9F4', borderTop: `1px solid ${border}` }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #5C31F2, #7C3AED)', boxShadow: '0 4px 16px rgba(92,49,242,0.4)' }}>
                <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>Z</span>
              </div>
              <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: '1.4rem', color: text, letterSpacing: '-0.02em' }}>ZED</span>
            </div>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', lineHeight: 1.65, color: muted, maxWidth: '280px', marginBottom: '1.5rem' }}>
              The anonymous dating space where who you are matters more than what you look like.
            </p>
            <div className="flex flex-col gap-2">
              <a href="tel:+15794713458" className="flex items-center gap-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', color: muted, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = muted)}>
                <Phone size={14} /> +1 (579) 471-3458
              </a>
              <a href="mailto:support@zed.app" className="flex items-center gap-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', color: muted, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = muted)}>
                <Mail size={14} /> support@zed.app
              </a>
            </div>
          </div>

          <div>
            <h4 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: text, marginBottom: '1.25rem' }}>Product</h4>
            <ul className="flex flex-col gap-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <button onClick={link.action}
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', color: muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = text)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = muted)}>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: text, marginBottom: '1.25rem' }}>Legal</h4>
            <ul className="flex flex-col gap-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <button onClick={link.action}
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', color: muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = text)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = muted)}>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: `1px solid ${border}` }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', color: muted }}>
            © 2026 Zed Technologies Inc. All rights reserved.
          </p>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', color: muted }}>
            Made with anonymity in mind.{' '}
            <span style={{ color: dark ? '#7C3AED' : '#5C31F2' }}>@ShadowDev99</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
