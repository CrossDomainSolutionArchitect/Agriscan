import React from 'react'
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
                <h3>User scans the teeth, face, nails & hair</h3>
              </div>
              <div className={styles.imageWrapper}>
                <img
                  src="/images/t-t.png"
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
                  src="/images/removed-back.jpg"
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
              <p>Average check increase by <strong>29%</strong></p>
              <p>Sales growth by <strong>11%</strong></p>
              <a className={styles.demoButton} href="#products">
                <span>Go to demo</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks