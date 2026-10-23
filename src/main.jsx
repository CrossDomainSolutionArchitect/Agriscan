import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const app = (
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  clerkPubKey ? <ClerkProvider publishableKey={clerkPubKey}>{app}</ClerkProvider> : app
)