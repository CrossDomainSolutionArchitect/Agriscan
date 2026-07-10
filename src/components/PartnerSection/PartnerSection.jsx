import React from 'react'
import { Link } from 'react-router-dom'
import styles from './PartnerSection.module.css'

function PartnerSection() {
  return (
    <section className={styles.partner}>
      <div className="container">
        <h2>Partner With Us</h2>
        <p>
          Validating AI for Southern Africa. We're collaborating with agricultural experts and dermatologists to fine‑tune our models for local conditions.
        </p>
        <Link to="/partner" className={styles.btn}>
          Get in Touch <span className={styles.arrow}>→</span>
        </Link>
      </div>
    </section>
  )
}

export default PartnerSection