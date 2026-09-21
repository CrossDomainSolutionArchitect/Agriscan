import React from 'react'
import { Link } from 'react-router-dom'
import SkinScanUploader from '../../components/SkinScan/SkinScanUploader'
import styles from './SkinScanPage.module.css'

function SkinScanPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/" className={styles.back}>← Back to home</Link>
      </div>
      
      <SkinScanUploader />
      
      <div className={styles.footerNote}>
        <p>
          <strong>Privacy:</strong> Your images are processed anonymously. 
          We do not store or share your uploaded photos.
        </p>
      </div>
    </div>
  )
}

export default SkinScanPage