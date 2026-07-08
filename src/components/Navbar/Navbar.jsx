import React from 'react'
import { Link } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import styles from './Navbar.module.css'

function Navbar() {
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

export default Navbar