import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import Loader from './components/Loader/Loader'
import LandingPage from './pages/LandingPage/LandingPage'
import AgriscanPage from './pages/AgriscanPage/AgriscanPage'
import SkinScanPage from './pages/SkinScanPage/SkinScanPage'
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions/TermsConditions'
import Disclaimer from './pages/Disclaimer/Disclaimer'
import CookiePolicy from './pages/CookiePolicy/CookiePolicy'

const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser()
  
  // Show loader while Clerk is initializing
  if (!isLoaded) {
    return <Loader />
  }
  
  // Redirect to home if not signed in
  if (!isSignedIn) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  // Handle redirect from 404.html
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const redirectPath = params.get('path')

    if (redirectPath) {
      // Clean the URL and navigate to the intended path
      navigate(redirectPath, { replace: true })
    }
  }, [location, navigate])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/agriscan" element={<ProtectedRoute><AgriscanPage /></ProtectedRoute>} />
      <Route path="/skinscan" element={<ProtectedRoute><SkinScanPage /></ProtectedRoute>} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsConditions />} />
      <Route path="/disclaimer" element={<Disclaimer />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App