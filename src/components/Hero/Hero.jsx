import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Hero.module.css'

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.copy}>
          
          <h1>AgriScan Crop Disease Detection <br />Platform</h1>
          <p className={styles.subtitle}>
            Practical AI diagnostics for the field . Upload crop image
            and turn uncertainty into your next best step.
          </p>
          <div className={styles.ctaGroup}>
            <Link to="/agriscan" className={styles.primaryBtn}>Request Demo<span aria-hidden="true">↗</span></Link>
            
          </div>
         
        </div>

        <div className={styles.visual}>
          <img src="/images/man_maize.jpeg" alt="Farmer inspecting maize crops" />
        </div>
      </div>
    </section>
  )
}

export default Hero