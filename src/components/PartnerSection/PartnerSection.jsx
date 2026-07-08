import React from 'react'
import styles from './PartnerSection.module.css'

function PartnerSection() {
  return (
    <section className={styles.partner}>
      <div className="container">
        <h2>Partner With Us</h2>
        <p>
          Validating AI for Southern Africa. We're collaborating with agricultural experts and dermatologists to fine‑tune our models for local conditions.
        </p>
        <a href="mailto:hello@cdsa.tech" className={styles.btn}>Get in Touch</a>
      </div>
    </section>
  )
}

export default PartnerSection