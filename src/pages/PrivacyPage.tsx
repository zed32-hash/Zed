import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export function PrivacyPage() {
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
          <h1 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: text, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Privacy Policy</h1>
          <p style={{ color: muted, marginBottom: '3rem', fontSize: '0.9rem' }}>Last updated: May 29, 2026</p>
        </motion.div>

        {[
          { title: '1. What We Collect', content: 'We collect your email address for authentication, an alias (username) you choose, vibe tags you select, an approximate geohash of your location (your precise coordinates are never stored), and messages sent within the platform. We do not collect your real name, phone number, or any photo unless you voluntarily share one in an unlocked conversation.' },
          { title: '2. How We Use Your Data', content: 'Your email is used solely for account authentication. Your alias, avatar, and tags are used to match you with other users. Your geohash is used to surface geographically nearby profiles — the precision is intentionally low. Your messages are stored only for the duration the conversation is active and are automatically removed when a chat expires.' },
          { title: '3. Anonymity by Design', content: 'ZED is built on the principle of anonymity. Your real identity is never displayed to other users. No photos, no full names, no phone numbers are ever required or displayed. Your alias can be changed at any time. If you delete your account, all associated data is permanently removed within 30 days.' },
          { title: '4. Data Sharing', content: 'We do not sell, rent, or trade your personal data to any third party. We use Firebase (Google) as our backend infrastructure, which means data is stored on Google-managed servers. We may share data with law enforcement only when required by valid legal process.' },
          { title: '5. Cookies', content: 'We use strictly necessary cookies for session authentication only. We do not use advertising cookies or third-party tracking pixels. You can clear cookies at any time via your browser settings, which will log you out of the platform.' },
          { title: '6. Security', content: 'All data is transmitted over HTTPS. Database access is secured by Firebase Security Rules that enforce per-user read/write permissions. No employee has access to your private messages. Reports are visible only to the admin team for moderation purposes.' },
          { title: '7. Your Rights', content: 'You have the right to access, export, or delete your data at any time. To submit a data request, contact us at officialzed@zohomail.com or call +234 704 179 5388. We will respond within 30 days. EU and UK users have additional rights under GDPR and UK GDPR respectively.' },
          { title: '8. Changes to This Policy', content: 'We may update this policy as the platform evolves. Significant changes will be notified via in-app alert. Continued use of ZED after changes constitutes acceptance of the updated policy.' },
          { title: '9. Contact', content: 'Zed Technologies Inc. — officialzed@zohomail.com — +234 704 179 5388' },
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
