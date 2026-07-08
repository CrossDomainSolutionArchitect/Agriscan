import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AGRISCAN_URL } from '../../config/constants'
import styles from './AgriscanPage.module.css'

function AgriscanPage() {
  const [loading, setLoading] = useState(true)
  const [showNote, setShowNote] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => { if (loading) setShowNote(true) }, 10000)
    return () => clearTimeout(timer)
  }, [loading])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/" className={styles.back}>← Back</Link>
        <h1>🌾 Agriscan</h1>
        <p>AI plant disease detection for Southern African farmers</p>
      </div>
      <div className={styles.iframeWrapper}>
        {loading && (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <p>Loading Agriscan...</p>
            {showNote && <p className={styles.note}>First load may take up to 60s.</p>}
          </div>
        )}
        <iframe
          src={AGRISCAN_URL}
          title="Agriscan"
          onLoad={() => setLoading(false)}
          className={styles.iframe}
          style={{ display: loading ? 'none' : 'block' }}
        />
      </div>
    </div>
  )
}

export default AgriscanPage