import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import styles from './PrototypeCard.module.css'

function PrototypeCard({ title, icon, description, route, image, status, tech }) {
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
      {image && (
        <div className={styles.cardImage}>
          <img src={image} alt={title} loading="lazy" />
          {status && <span className={styles.statusBadge}>{status}</span>}
        </div>
      )}
      <div className={styles.cardContent}>
        <h3>{title}</h3>
        <p>{description}</p>
        {tech && <span className={styles.techNote}>{tech}</span>}
        <div className={styles.action}>
          <span className={styles.badge}>
            {isSignedIn ? 'Launch →' : 'Sign in to access'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PrototypeCard