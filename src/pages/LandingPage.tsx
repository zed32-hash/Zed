import { useNavigate } from 'react-router'
import { Navbar } from '../app/components/Navbar'
import { Hero } from '../app/components/Hero'
import { Marquee } from '../app/components/Marquee'
import { About } from '../app/components/About'
import { Features } from '../app/components/Features'
import { HowItWorks } from '../app/components/HowItWorks'
import { HappyHour } from '../app/components/HappyHour'
import { Waitlist } from '../app/components/Waitlist'
import { Footer } from '../app/components/Footer'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'

export function LandingPage() {
  const { dark, toggleDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar
        dark={dark}
        onToggleDark={toggleDark}
        onLaunchApp={() => navigate(user ? '/app' : '/signup')}
      />
      <Hero dark={dark} onLaunchApp={() => navigate(user ? '/app' : '/signup')} />
      <Marquee dark={dark} />
      <About dark={dark} />
      <Features dark={dark} />
      <div id="how-it-works">
        <HowItWorks dark={dark} />
      </div>
      <HappyHour dark={dark} />
      <Waitlist dark={dark} />
      <Footer dark={dark} />
    </div>
  )
}
