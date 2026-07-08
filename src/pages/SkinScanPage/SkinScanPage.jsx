import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SKINSCAN_URL } from '../../config/constants'
import styles from './SkinScanPage.module.css'

function SkinScanPage() {
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
        <h1>🔬 SkinScan</h1>
        <p>AI dermatology assistant for acne, eczema, and psoriasis</p>
      </div>
      <div className={styles.iframeWrapper}>
        {loading && (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <p>Loading SkinScan...</p>
            {showNote && <p className={styles.note}>First load may take up to 60s.</p>}
          </div>
        )}
        <iframe
          src={SKINSCAN_URL}
          title="SkinScan"
          onLoad={() => setLoading(false)}
          className={styles.iframe}
          style={{ display: loading ? 'none' : 'block' }}
        />
      </div>
    </div>
  )
}

export default SkinScanPage