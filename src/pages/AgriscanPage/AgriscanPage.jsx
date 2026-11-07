import React from 'react'
import { Link } from 'react-router-dom'
import AgriscanUploader from '../../components/Agriscan/AgriscanUploader'
import styles from './AgriscanPage.module.css'

function AgriscanPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/" className={styles.back}>← Back to home</Link>
      </div>
      
      <AgriscanUploader />
      
      <div className={styles.footerNote}>
        <p>
          <strong>Privacy:</strong> Your image is sent to the configured AI inference service for analysis and is not stored in the AgriScan database. Diagnosis metadata is saved to your account.
        </p>
      </div>
    </div>
  )
}

export default AgriscanPage