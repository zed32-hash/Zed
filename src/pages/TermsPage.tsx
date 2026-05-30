import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export function TermsPage() {
  const navigate = useNavigate()
  const { dark, toggleDark } = useTheme()
  const bg = dark ? 'linear-gradient(160deg,#0A0914 0%,#1C1236 60%,#0E1A24 100%)' : 'linear-gradient(160deg,#FBF9F4 0%,#E3DCF8 60%,#D9E7F9 100%)'
  const text = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'
  const border = dark ? 'rgba(124,58,237,0.2)' : 'rgba(92,49,242,0.12)'
  const cardBg = dark ? 'rgba(28,18,54,0.5)' : 'rgba(255,255,255,0.6)'

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ position: 'fixed', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', zIndex: 50 }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: dark ? 'rgba(28,18,54,0.7)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: `1px solid ${border}`, borderRadius: 12, padding: '0.5rem 1rem', color: muted, fontSize: '0.875rem', cursor: 'pointer' }}>
          <ArrowLeft size={15} /> Back
        </button>
        <button onClick={toggleDark} style={{ background: dark ? 'rgba(28,18,54,0.7)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: `1px solid ${border}`, borderRadius: 12, padding: '0.5rem', color: muted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '6rem 2rem 4rem', position: 'relative', zIndex: 10 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: dark ? '#7C3AED' : '#5C31F2', marginBottom: '1rem' }}>Legal</p>
          <h1 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: text, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Terms of Service</h1>
          <p style={{ color: muted, marginBottom: '3rem', fontSize: '0.9rem' }}>Last updated: May 29, 2026</p>
        </motion.div>

        {[
          { title: '1. Acceptance of Terms', content: 'By accessing or using ZED ("the Platform"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the Platform. You must be at least 18 years old to create an account.' },
          { title: '2. Eligible Users', content: 'You must be 18 years of age or older. You must not have been previously banned from the Platform. You must provide a valid email address. Creating multiple accounts to evade a ban is prohibited and will result in permanent removal.' },
          { title: '3. Acceptable Use', content: 'You agree not to: harass, abuse, threaten, or harm other users; share explicit or non-consensual content; use the platform for commercial solicitation or spam; impersonate another person or entity; attempt to circumvent the message limits or other platform mechanics; use automated scripts or bots to interact with the platform.' },
          { title: '4. Anonymity and Identity', content: 'ZED is an anonymous platform. You may not attempt to de-anonymize another user without their explicit consent. Sharing another user\'s personal information (doxxing) is a permanent bannable offense. We will cooperate with law enforcement in cases involving credible threats or illegal activity.' },
          { title: '5. Content and Messaging', content: 'You retain ownership of any content you post. By posting, you grant ZED a non-exclusive, royalty-free license to display that content within the platform. Content that violates these Terms may be removed without notice. Conversations are subject to report-based moderation. ZED does not actively monitor message content except when a report is filed.' },
          { title: '6. Account Suspension and Termination', content: 'ZED may suspend or permanently terminate your account if you violate these Terms. Accounts that receive 3 or more valid reports may be automatically suspended pending review. You may appeal a suspension by contacting officialzed@zohomail.com or calling +1 (579) 471-3458.' },
          { title: '7. Limitation of Liability', content: 'ZED is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability to you shall not exceed the greater of $100 or the amount you paid to ZED in the past 12 months.' },
          { title: '8. Changes to These Terms', content: 'We may update these Terms at any time. Continued use of the platform after changes constitutes acceptance. Material changes will be communicated via in-app notification with at least 7 days notice.' },
          { title: '9. Governing Law', content: 'These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict of law principles. Disputes shall be resolved through binding arbitration, except where prohibited by law.' },
          { title: '10. Contact', content: 'Zed Technologies Inc. — officialzed@zohomail.com — +1 (579) 471-3458' },
        ].map((sec, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: '1.5rem', marginBottom: '1rem', backdropFilter: 'blur(12px)' }}>
            <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: text, marginBottom: '0.75rem' }}>{sec.title}</h2>
            <p style={{ color: muted, lineHeight: 1.75, fontSize: '0.9rem' }}>{sec.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
