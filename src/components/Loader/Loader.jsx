import React from 'react'
import styles from './Loader.module.css'

function Loader() {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loaderContent}>
        <img 
          src="/cdsa-logo.png" 
          alt="cdsa.ai Studio"
          className={styles.loaderLogo}
        />
        <div className={styles.loaderBar}>
          <div className={styles.loaderFill}></div>
        </div>
        <p className={styles.loaderText}>Loading cdsa.ai Studio...</p>
      </div>
    </div>
  )
}

export default Loader