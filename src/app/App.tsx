import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { Toaster } from 'sonner'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ProtectedRoute } from '../components/app/ProtectedRoute'
import { MessageNotifications } from '../components/app/MessageNotifications'
import { MatchNotifications } from '../components/app/MatchNotifications'
import { RouteFallback } from '../components/app/RouteFallback'

// Landing is the first paint for most visitors — keep it eager for the fastest LCP.
import { LandingPage } from '../pages/LandingPage'

// Everything else is split into its own chunk and loaded on demand.
const SignupPage = lazy(() => import('../pages/SignupPage').then((m) => ({ default: m.SignupPage })))
const OnboardingPage = lazy(() => import('../pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })))
const DiscoveryPage = lazy(() => import('../pages/DiscoveryPage').then((m) => ({ default: m.DiscoveryPage })))
const InboxPage = lazy(() => import('../pages/InboxPage').then((m) => ({ default: m.InboxPage })))
const ChatPage = lazy(() => import('../pages/ChatPage').then((m) => ({ default: m.ChatPage })))
const RoomsPage = lazy(() => import('../pages/RoomsPage').then((m) => ({ default: m.RoomsPage })))
const AdminPage = lazy(() => import('../pages/AdminPage').then((m) => ({ default: m.AdminPage })))
const ManifestoPage = lazy(() => import('../pages/ManifestoPage').then((m) => ({ default: m.ManifestoPage })))
const PrivacyPage = lazy(() => import('../pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('../pages/TermsPage').then((m) => ({ default: m.TermsPage })))

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <MessageNotifications />
          <MatchNotifications />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/manifesto" element={<ManifestoPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/app" element={<ProtectedRoute><DiscoveryPage /></ProtectedRoute>} />
              <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
              <Route path="/rooms" element={<ProtectedRoute><RoomsPage /></ProtectedRoute>} />
              <Route path="/chat/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Toaster
            position="top-center"
            toastOptions={{ unstyled: true }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
