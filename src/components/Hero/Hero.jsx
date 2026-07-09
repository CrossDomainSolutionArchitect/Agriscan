import React from 'react'
import styles from './Hero.module.css'

function Hero() {
  return (
    <section className={styles.hero}>
      <span className={styles.eyebrow}>cdsa.ai Studio</span>
      <h1>
        AI Diagnostics, Built for <br />
        <span>Southern African Conditions</span>
      </h1>
      <p className={styles.subtitle}>
        Agriscan uses computer vision trained across 38 crop disease classes to help
        maize, citrus, tomato, and potato farmers spot disease before it spreads.
      </p>
      <div className={styles.ctaGroup}>
        <a href="#agriscan" className={styles.primaryBtn}>Try Agriscan</a>
        <a href="#how-it-works" className={styles.secondaryBtn}>See how it works</a>
      </div>
      <div className={styles.statsRow}>
        <div><strong>38</strong><span>disease classes</span></div>
        <div><strong>4</strong><span>crops covered</span></div>
        <div><strong>ZA</strong><span>built for local conditions</span></div>
      </div>
    </section>
  )
}

export default Hero