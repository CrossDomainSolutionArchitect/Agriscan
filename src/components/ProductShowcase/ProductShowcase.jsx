import React from 'react'
import styles from './ProductShowcase.module.css'

const products = [
  {
    title: 'Agriscan',
    status: 'Live',
    image: '/images/agriscan-maize-leaf.jpg', // real crop photo, not icon
    description: 'AI plant disease detection from a single photo — maize, citrus, tomato, and potato.',
    tech: 'EfficientNet · PlantVillage dataset · 38 classes',
    route: '/agriscan',
  },
  {
    title: 'SkinScan',
    status: 'In Development',
    image: '/images/skinscan-preview.jpg',
    description: 'AI dermatology assistant for acne, eczema, and psoriasis — built for remote diagnosis support.',
    tech: 'Screening tool · not a medical diagnosis',
    route: '/skinscan',
  },
]

function ProductShowcase() {
  return (
    <section id="products" className={styles.showcase}>
      <div className="container">
        <h2>Our Solutions</h2>
        <div className={styles.grid}>
          {products.map((p) => (
            <a key={p.title} href={p.route} className={styles.card}>
              <div className={styles.imageWrap}>
                <img src={p.image} alt={p.title} />
                <span className={styles.status} data-status={p.status}>{p.status}</span>
              </div>
              <div className={styles.body}>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <span className={styles.tech}>{p.tech}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductShowcase