import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './PartnerPage.module.css'

function PartnerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    crops: '',
    message: '',
  })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch('https://formspree.io/f/xeewnede', {
        method: 'POST',
        body: new FormData(e.target),
        headers: {
          Accept: 'application/json',
        },
      })

      if (response.ok) {
        setStatus({
          type: 'success',
          message: '✓ Thank you for partnering with us! We\'ll respond within 48 hours at hello@cdsa.tech',
        })
        setFormData({
          name: '',
          email: '',
          organization: '',
          role: '',
          crops: '',
          message: '',
        })
        // Optionally redirect after 3 seconds
        setTimeout(() => {
          window.location.href = '/'
        }, 3000)
      } else {
        setStatus({
          type: 'error',
          message: '⚠️ Something went wrong. Please try again or email us directly at hello@cdsa.tech',
        })
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: '⚠️ Network error. Please check your connection and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <Link to="/" className={styles.backLink}>← Back to Home</Link>

        <div className={styles.header}>
          <h1>🤝 Partner with Us</h1>
          <p>Help us validate Agriscan for Southern African agriculture</p>
        </div>

        <div className={styles.formWrapper}>
          {status.type === 'success' && (
            <div className={styles.successMessage}>{status.message}</div>
          )}
          {status.type === 'error' && (
            <div className={styles.errorMessage}>{status.message}</div>
          )}

          <form id="partner-form" onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="organization">Organization / Institution</label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="role">Your Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                <option value="extension_officer">Agricultural Extension Officer</option>
                <option value="crop_scientist">Crop Scientist / Researcher</option>
                <option value="farmer_cooperative">Farmer Cooperative Representative</option>
                <option value="agri_business">Agri-Business Professional</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="crops">Which crops do you work with?</label>
              <input
                type="text"
                id="crops"
                name="crops"
                placeholder="e.g., maize, citrus, tomatoes, potatoes"
                value={formData.crops}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">How would you like to contribute?</label>
              <textarea
                id="message"
                name="message"
                rows="4"
                placeholder="e.g., Provide disease images, review model outputs, connect with farming communities..."
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            {/* Formspree honeypot */}
            <input type="text" name="_gotcha" style={{ display: 'none' }} />

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Partnership Request →'}
            </button>
            <p className={styles.formNote}>
              We'll respond within 48 hours from <strong>hello@cdsa.tech</strong>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PartnerPage