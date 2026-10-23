import React from 'react'
import styles from './MetricsBar.module.css'

function MetricsBar() {
  return (
    <section className={styles.metrics}>
      <div className="container">
        <div className={styles.grid}>
          <div className={`${styles.panel} ${styles.solutionsPanel}`}>
            <span className={styles.kicker}>powered by one of the world's largest exclusive plant disease image databases</span>
            <h3>87k</h3>
            <p className={styles.unit}>Images</p>
            <img src="/images/all-veg.jpg" alt="Choose an AI diagnostic tool" width="600" height="265" />
            
            <span className={styles.note}>Agriscan for crops and disease detection, built for Southern African conditions.</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MetricsBar