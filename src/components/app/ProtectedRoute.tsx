import { Navigate } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, needsOnboarding } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #FBF9F4 0%, #E3DCF8 55%, #D9E7F9 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: 'linear-gradient(135deg, #5C31F2, #7C3AED)', boxShadow: '0 8px 24px rgba(92,49,242,0.4)' }}
          >
            <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, color: '#fff', fontSize: '1.3rem' }}>Z</span>
          </div>
          <p style={{ color: '#7B78A8', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem' }}>Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/signup" replace />
  if (needsOnboarding) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}
