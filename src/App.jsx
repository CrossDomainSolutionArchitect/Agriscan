import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import LandingPage from './pages/LandingPage/LandingPage'
import AgriscanPage from './pages/AgriscanPage/AgriscanPage'
import SkinScanPage from './pages/SkinScanPage/SkinScanPage'
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions/TermsConditions'
import Disclaimer from './pages/Disclaimer/Disclaimer'
import CookiePolicy from './pages/CookiePolicy/CookiePolicy'
const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useUser()
  if (!isLoaded) return <div className="loading-screen">Loading...</div>
  if (!isSignedIn) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/agriscan" element={<ProtectedRoute><AgriscanPage /></ProtectedRoute>} />
      <Route path="/skinscan" element={<ProtectedRoute><SkinScanPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
<Route path="/terms" element={<TermsConditions />} />
<Route path="/disclaimer" element={<Disclaimer />} />
<Route path="/cookies" element={<CookiePolicy />} />
    </Routes>
  )
}

export default App