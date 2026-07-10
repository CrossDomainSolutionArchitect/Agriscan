import React from 'react'
import styles from './HowItWorks.module.css'

function HowItWorks() {
  return (
    <section className={styles.howItWorks}>
      <div className="container">
        <div className={styles.imageWrapper}>
          <img 
            src="/images/howitworks-banner.jpg" 
            alt="How Agriscan and SkinScan work - Choose your tool, capture or upload an image, and get instant AI insights"
            className={styles.bannerImage}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}

export default HowItWorks