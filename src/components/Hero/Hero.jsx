import React from 'react'
import styles from './Hero.module.css'

function Hero() {
  return (
    <section className={styles.hero}>
      <h1>AI-Powered Diagnostics <br /><span>for Southern Africa</span></h1>
      <p className={styles.subtitle}>
        Empowering agriculture and healthcare with computer vision.
      </p>
      <div className={styles.ctaGroup}>
        <a href="#products" className={styles.primaryBtn}>Explore Our Solutions</a>
      </div>
    </section>
  )
}

export default Hero