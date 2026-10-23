import React from 'react'
import { Link } from 'react-router-dom'
import styles from './CookiePolicy.module.css'

function CookiePolicy() {
  return (
    <div className={styles.page}>
      <div className="container">
        <Link to="/" className={styles.back}>← Back to home</Link>
        <h1>Cookie Policy</h1>
        <p className={styles.date}>Last updated: 8 July 2026</p>

        <section>
          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your device by websites you visit. 
            They are widely used to make websites work more efficiently and to provide useful 
            information to site owners.
          </p>
        </section>

        <section>
          <h2>2. How We Use Cookies</h2>
          <p>cdsa.ai Studio uses cookies for the following purposes:</p>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for the website to function (e.g., for user authentication via Clerk). These cannot be disabled.</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site (e.g., which pages are popular, how long users stay). We use these to improve user experience.</li>
            <li><strong>Preference Cookies:</strong> Remember your preferences, such as language or region settings.</li>
          </ul>
        </section>

        <section>
          <h2>3. Third‑Party Cookies</h2>
          <p>
            We use third‑party services that may place cookies on your device. These include:
          </p>
          <ul>
            <li><strong>Clerk:</strong> For authentication – their cookies are necessary for secure sign‑in.</li>
            <li><strong>Google Analytics (if used):</strong> To track site usage and performance.</li>
            <li><strong>Hugging Face (iframes):</strong> Their embedded spaces may use their own cookies.</li>
          </ul>
          <p>
            We do not control third‑party cookies and recommend you review their respective policies.
          </p>
        </section>

        <section>
          <h2>4. Your Consent</h2>
          <p>
            By using our website, you consent to our use of cookies as described in this policy. 
            You can withdraw your consent at any time by adjusting your browser settings.
          </p>
        </section>

        <section>
          <h2>5. Managing Cookies</h2>
          <p>
            Most web browsers allow you to control cookies through their settings. You can:
          </p>
          <ul>
            <li>Delete all cookies stored on your device.</li>
            <li>Block all cookies (though this may affect functionality).</li>
            <li>Set your browser to warn you before a cookie is stored.</li>
          </ul>
          <p>
            For more information, visit the help pages of your browser (Chrome, Firefox, Safari, etc.).
          </p>
        </section>

        <section>
          <h2>6. Changes to This Policy</h2>
          <p>
            We may update our Cookie Policy from time to time. We will notify you of any 
            significant changes by posting a notice on our website.
          </p>
        </section>

        <section>
          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about our use of cookies, please contact us at:<br />
            📧 <a href="mailto:agriscan@cdsa.tech">agriscan@cdsa.tech</a>
          </p>
        </section>
      </div>
    </div>
  )
}

export default CookiePolicy