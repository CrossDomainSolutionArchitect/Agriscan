import React from 'react'
import PrototypeCard from '../PrototypeCard/PrototypeCard'
import styles from './ProductShowcase.module.css'

function ProductShowcase() {
  return (
    <section id="products" className={styles.showcase}>
      <div className="container">
        <h2>Our Solutions</h2>
        <div className={styles.grid}>
          <PrototypeCard
            title="Agriscan"
            icon="🌾"
            description="AI plant disease detection from a single photo. Trained on 38 crop diseases and being validated for SA conditions."
            route="/agriscan"
          />
          <PrototypeCard
            title="SkinScan"
            icon="🔬"
            description="AI dermatology assistant for acne, eczema, and psoriasis. Built for remote diagnosis support."
            route="/skinscan"
          />
        </div>
      </div>
    </section>
  )
}

export default ProductShowcase