import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className="container">
        {/* Legal Links Row */}
        <div className={styles.links}>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/disclaimer">Disclaimer</Link>
          <Link to="/cookies">Cookie Policy</Link>
        </div>

        {/* Contact & Copyright */}
        <div className={styles.bottom}>
          <p className={styles.contact}>
            📧 <a href="mailto:hello@cdsa.tech">hello@cdsa.tech</a>
          </p>
          <p className={styles.copyright}>
            &copy; {currentYear} cdsa.ai Studio — AI for Southern Africa
          </p>
          <p className={styles.disclaimer}>
            <strong>Disclaimer:</strong> AI-Powered Diagnostics are AI-powered tools for informational purposes only. 
            Not a substitute for professional medical, dermatological, or agricultural advice.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer