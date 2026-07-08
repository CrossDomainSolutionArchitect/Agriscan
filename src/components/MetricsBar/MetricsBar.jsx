import React from 'react'
import styles from './MetricsBar.module.css'

const metrics = [
  { value: '2', label: 'Deployed AI Models' },
  { value: '38', label: 'Crop Diseases Detected' },
  { value: '3', label: 'Skin Conditions Analyzed' },
  { value: '100%', label: 'Focus on Southern Africa' },
]

function MetricsBar() {
  return (
    <section className={styles.metrics}>
      <div className="container">
        <div className={styles.grid}>
          {metrics.map((m, i) => (
            <div key={i} className={styles.item}>
              <span className={styles.value}>{m.value}</span>
              <span className={styles.label}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MetricsBar