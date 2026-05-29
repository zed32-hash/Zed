import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ProtectedRoute } from '../components/app/ProtectedRoute'
import { LandingPage } from '../pages/LandingPage'
import { SignupPage } from '../pages/SignupPage'
import { OnboardingPage } from '../pages/OnboardingPage'
import { DiscoveryPage } from '../pages/DiscoveryPage'
import { InboxPage } from '../pages/InboxPage'
import { ChatPage } from '../pages/ChatPage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DiscoveryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inbox"
              element={
                <ProtectedRoute>
                  <InboxPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:chatId"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
