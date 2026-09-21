import React, { useEffect, useState } from 'react'
import styles from './Hero.module.css'

function Hero() {
  const [activeSlide, setActiveSlide] = useState(0)
  const slides = [
    { title: 'Healthcare', image: '/images/healtK1.jpg', description: 'Clearer insight for every patient.' },
    { title: 'Agriculture', image: '/images/maize1.jpg', description: 'Healthier crops, stronger harvests.' },
    { title: 'Universities', image: '/images/LLb.jpg', description: 'Turn research into practical action.' },
    { title: 'Retail', image: '/images/AIScan.jpg', description: 'Smarter decisions at every touchpoint.' },
  ]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 4500)

    return () => window.clearInterval(timer)
  }, [slides.length])

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.copy}>
          
          <h1>AI Diagnostic<br />Studio</h1>
          <p className={styles.subtitle}>
            Practical AI diagnostics for the field and the clinic. Upload one image
            and turn uncertainty into your next best step.
          </p>
          <div className={styles.ctaGroup}>
            <a href="/partner" className={styles.primaryBtn}>Request Demo<span aria-hidden="true">↗</span></a>
            
          </div>
         
        </div>

        <div className={styles.visual} aria-label="AI diagnostic sectors">
          <div className={styles.slides}>
            {slides.map((slide, index) => (
              <div
                className={`${styles.slide} ${index === activeSlide ? styles.activeSlide : ''}`}
                key={slide.title}
                aria-hidden={index !== activeSlide}
              >
                <img src={slide.image} alt={`${slide.title} AI diagnostics`} />
                <div className={styles.slideShade} />
                <div className={styles.slideContent}>
                  
                  <h2>{slide.title}</h2>
                  <p>{slide.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.slideControls} aria-label="Choose a sector">
            {slides.map((slide, index) => (
              <button
                type="button"
                className={`${styles.slideButton} ${index === activeSlide ? styles.activeButton : ''}`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Show ${slide.title}`}
                aria-current={index === activeSlide ? 'true' : undefined}
                key={slide.title}
              >
                <span>{slide.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero