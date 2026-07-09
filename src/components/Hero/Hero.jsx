import React from 'react'
import styles from './Hero.module.css'

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.badge}>Built in SA · Trained for Southern African conditions</div>
      <h1>AI-Powered Diagnostics <br /><span>for Southern Africa</span></h1>
      <p className={styles.subtitle}>
        Computer vision models trained to detect crop disease and skin conditions
        from a single photo — built for the field, not the lab.
      </p>
      <div className={styles.ctaGroup}>
        <a href="#products" className={styles.primaryBtn}>Explore Our Solutions</a>
        <a href="/agriscan" className={styles.secondaryBtn}>See a Sample Scan →</a>
      </div>
    </section>
  )
}

export default Hero