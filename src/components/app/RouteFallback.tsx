import { useTheme } from '../../contexts/ThemeContext'

/**
 * Lightweight, dependency-free loading screen shown while a route chunk
 * is being fetched. Matches the app's gradient + brand purple so page
 * transitions feel intentional instead of blank.
 */
export function RouteFallback() {
  const { dark } = useTheme()

  const bg = dark
    ? 'linear-gradient(160deg, #0A0914 0%, #1C1236 50%, #0E1A24 100%)'
    : 'linear-gradient(160deg, #FBF9F4 0%, #E3DCF8 55%, #D9E7F9 100%)'
  const muted = dark ? '#A6A4C5' : '#7B78A8'

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: bg }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div
        className="w-12 h-12 rounded-2xl animate-pulse"
        style={{
          background: 'linear-gradient(135deg,#5C31F2,#7C3AED)',
          boxShadow: '0 8px 28px rgba(92,49,242,0.45)',
        }}
      />
      <p
        style={{
          color: muted,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.875rem',
          letterSpacing: '0.02em',
        }}
      >
        Loading…
      </p>
    </div>
  )
}
