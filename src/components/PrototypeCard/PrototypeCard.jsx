import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import styles from './PrototypeCard.module.css'

const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

function PrototypeCardView({ title, description, route, image, status, tech, isSignedIn, onClick }) {
  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0}>
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
            {isSignedIn ? 'Launch →' : clerkEnabled ? 'Sign in to access' : 'View solution →'}
          </span>
        </div>
      </div>
    </div>
  )
}

function AuthenticatedPrototypeCard(props) {
  const { isSignedIn } = useUser()
  const { openSignIn } = useClerk()
  const navigate = useNavigate()

  const handleClick = () => {
    if (isSignedIn) {
      navigate(props.route)
    } else {
      openSignIn({ afterSignInUrl: props.route, afterSignUpUrl: props.route })
    }
  }

  return <PrototypeCardView {...props} isSignedIn={isSignedIn} onClick={handleClick} />
}

function PrototypeCard(props) {
  const navigate = useNavigate()

  if (!clerkEnabled) {
    return <PrototypeCardView {...props} isSignedIn={false} onClick={() => navigate(props.route)} />
  }

  return <AuthenticatedPrototypeCard {...props} />
}

export default PrototypeCard