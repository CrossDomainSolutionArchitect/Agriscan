import React from 'react'
import PrototypeCard from '../PrototypeCard/PrototypeCard'
import { PRODUCTS } from '../../config/metadata'
import styles from './ProductShowcase.module.css'

function ProductShowcase() {
  return (
    <section id="products" className={styles.showcase}>
      <div className="container">
        <h2>Our Solutions</h2>
        <div className={styles.grid}>
          {PRODUCTS.map((product) => (
            <PrototypeCard
              key={product.title}
              title={product.title}
              icon=""
              description={product.description}
              route={product.route}
              image={product.image}
              status={product.status}
              tech={product.tech}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductShowcase