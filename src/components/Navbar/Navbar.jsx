import React from 'react'
import { Link } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import styles from './Navbar.module.css'

const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

function AuthenticatedNavbar() {
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navInner}`}>
        {/* Logo only – no text */}
        <Link to="/" className={styles.logoLink}>
          <img 
            src="/cdsa-logo.png"   // ← change to your actual filename
            alt="cdsa.ai Studio"
            className={styles.logoImg}
          />
        </Link>
        
        <div className={styles.navRight}>
          {isSignedIn ? (
            <>
              <span className={styles.user}>👋 {user?.firstName || 'User'}</span>
              <button onClick={() => signOut()} className={styles.signOut}>
                Sign Out
              </button>
            </>
          ) : (
            <span className={styles.guest}>Explore our AI tools</span>
          )}
        </div>
      </div>
    </nav>
  )
}

function Navbar() {
  if (!clerkEnabled) {
    return (
      <nav className={styles.navbar}>
        <div className={`container ${styles.navInner}`}>
          <a href="/" className={styles.logoLink}>
            <img src="/cdsa-logo.png" alt="cdsa.ai Studio" className={styles.logoImg} />
          </a>
          <span className={styles.guest}>Explore our AI tools</span>
        </div>
      </nav>
    )
  }

  return <AuthenticatedNavbar />
}

export default Navbar