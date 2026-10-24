import React, { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { SignIn, SignUp, useUser } from '@clerk/clerk-react'
import Loader from './components/Loader/Loader'

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage/LandingPage'))
const AgriscanPage = lazy(() => import('./pages/AgriscanPage/AgriscanPage'))
const SkinScanPage = lazy(() => import('./pages/SkinScanPage/SkinScanPage'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy/PrivacyPolicy'))
const TermsConditions = lazy(() => import('./pages/TermsConditions/TermsConditions'))
const Disclaimer = lazy(() => import('./pages/Disclaimer/Disclaimer'))
const CookiePolicy = lazy(() => import('./pages/CookiePolicy/CookiePolicy'))
const PartnerPage = lazy(() => import('./pages/PartnerPage/PartnerPage')) // NEW

const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser()
  const location = useLocation()

  if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) return <Navigate to="/" replace />
  if (!isLoaded) return <Loader />
  if (!isSignedIn) {
    return <Navigate to={`/sign-up?redirect_url=${encodeURIComponent(location.pathname)}`} replace />
  }
  return children
}

function ClerkAuthPage({ mode }) {
  const location = useLocation()
  const redirectUrl = new URLSearchParams(location.search).get('redirect_url') || '/agriscan'
  const Component = mode === 'sign-in' ? SignIn : SignUp

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 1rem' }}>
      <Component
        routing="path"
        path={`/${mode}`}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl={redirectUrl}
      />
    </div>
  )
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const redirectPath = params.get('path')
    if (redirectPath) {
      navigate(redirectPath, { replace: true })
    }
  }, [location, navigate])

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<ClerkAuthPage mode="sign-in" />} />
        <Route path="/sign-up" element={<ClerkAuthPage mode="sign-up" />} />
        <Route path="/agriscan" element={<ProtectedRoute><AgriscanPage /></ProtectedRoute>} />
        <Route path="/skinscan" element={<ProtectedRoute><SkinScanPage /></ProtectedRoute>} />
        <Route path="/partner" element={<PartnerPage />} /> {/* NEW */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App