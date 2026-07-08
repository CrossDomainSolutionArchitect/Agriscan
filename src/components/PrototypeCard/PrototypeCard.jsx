import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import styles from './PrototypeCard.module.css'

function PrototypeCard({ title, icon, description, route }) {
  const { isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const navigate = useNavigate()

  const handleClick = () => {
    if (isSignedIn) {
      navigate(route)
    } else {
      openSignIn({ afterSignInUrl: route, afterSignUpUrl: route })
    }
  }

  return (
    <div className={styles.card} onClick={handleClick} role="button" tabIndex={0}>
      <div className={styles.icon}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className={styles.action}>
        <span className={styles.badge}>
          {isSignedIn ? 'Launch →' : 'Sign in to access'}
        </span>
      </div>
    </div>
  )
}

export default PrototypeCard