import React from 'react'
import styles from './HowItWorks.module.css'

const steps = [
  { step: '1', title: 'Choose Your Tool', desc: 'Select Agriscan or SkinScan.' },
  { step: '2', title: 'Capture or Upload', desc: 'Take a photo with your phone.' },
  { step: '3', title: 'Get Instant AI Insights', desc: 'Receive a diagnosis and recommendations.' },
]

function HowItWorks() {
  return (
    <section className={styles.howItWorks}>
      <div className="container">
        <h2>How It Works</h2>
        <div className={styles.steps}>
          {steps.map((s) => (
            <div key={s.step} className={styles.step}>
              <div className={styles.number}>{s.step}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks