import React from 'react'
import { Link } from 'react-router-dom'
import styles from './HowItWorks.module.css'

function HowItWorks() {
  return (
    <section className={styles.howItWorks}>
      <div className="container">
        <div className={styles.contentPanel}>
          <div className={styles.sectionHeader}>
            <h2>How does this work</h2>
          </div>

          <div className={styles.steps}>
            <article className={styles.step}>
              <div className={styles.stepHeading}>
                <span className={styles.stepNumber}>.01</span>
                <h3>Farmer scans a crop leaf</h3>
              </div>
              <div className={styles.imageWrapper}>
                <img
                  src="/images/Maize_scan1.jpg"
                  alt="User scans their face with a phone"
                  className={styles.stepImage}
                  loading="lazy"
                />
              </div>
            </article>

            <article className={styles.step}>
              <div className={styles.stepHeading}>
                <span className={styles.stepNumber}>.02</span>
                <h3>Gets recommendations by categories</h3>
              </div>
              <div className={styles.imageWrapper}>
                <img
                  src="/images/Maize_scan_results1.jpg"
                  alt="Personalized recommendations shown by category"
                  className={styles.stepImage}
                  loading="lazy"
                />
              </div>
            </article>
          </div>

          <div className={styles.business}>
            <div>
              <span className={styles.kicker}>For business</span>
              <h3>Turn insight<br />into growth.</h3>
            </div>
            <div className={styles.results}>
              <p>Crop produce increases by <strong>30-50%</strong></p>
              <p>Sales growth by <strong>10-30%</strong></p>
              <Link className={styles.demoButton} to="/agriscan">
                <span>Go to demo</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks