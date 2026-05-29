import { useNavigate } from 'react-router'
import { Navbar } from '../app/components/Navbar'
import { Hero } from '../app/components/Hero'
import { Marquee } from '../app/components/Marquee'
import { HowItWorks } from '../app/components/HowItWorks'
import { HappyHour } from '../app/components/HappyHour'
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
      <HowItWorks dark={dark} />
      <HappyHour dark={dark} />
      <Footer dark={dark} />
    </div>
  )
}
