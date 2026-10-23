import React from 'react'
import { Link } from 'react-router-dom'
import styles from './PrivacyPolicy.module.css'

function PrivacyPolicy() {
  return (
    <div className={styles.page}>
      <div className="container">
        <Link to="/" className={styles.back}>← Back to home</Link>
        <h1>Privacy Policy</h1>
        <p className={styles.date}>Last updated: 8 July 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            cdsa.ai Studio ("we", "our", "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your 
            personal information when you visit our website and use our AI diagnostic tools 
            (Agriscan and SkinScan).
          </p>
          <p>
            We comply with the <strong>Protection of Personal Information Act (POPIA)</strong> 
            and other applicable South African data protection laws.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <ul>
            <li><strong>Personal Identifiable Information:</strong> Name, email address, and any other information you voluntarily provide.</li>
            <li><strong>Images:</strong> Photos of plants or skin that you upload for AI diagnosis. These images are processed to provide results and may be used (anonymously) to improve our models.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our website (pages visited, time spent, etc.) via cookies and analytics tools.</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>Provide, maintain, and improve our AI diagnostic services.</li>
            <li>Respond to your inquiries and send you administrative updates.</li>
            <li>Analyse usage patterns to enhance user experience.</li>
            <li>Comply with legal obligations and protect our rights.</li>
          </ul>
        </section>

        <section>
          <h2>4. Legal Basis for Processing (POPIA)</h2>
          <p>We process your personal information based on:</p>
          <ul>
            <li><strong>Consent:</strong> You have given us explicit consent to process your data for specific purposes (e.g., uploading images).</li>
            <li><strong>Legitimate Interests:</strong> To provide and improve our services, and to communicate with you.</li>
            <li><strong>Legal Obligations:</strong> When required by law or regulatory authorities.</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Sharing and Third Parties</h2>
          <p>
            We do not sell or rent your personal information to third parties. We may share your data with:
          </p>
          <ul>
            <li><strong>Service Providers:</strong> Hosting, email delivery, and analytics partners (e.g., Clerk, DigitalOcean, Hugging Face) who process data on our behalf under strict confidentiality agreements.</li>
            <li><strong>Legal Authorities:</strong> If required by law or to protect our rights and safety.</li>
          </ul>
          <p>
            Any images you upload are processed anonymously for model improvement and are not stored with your personal identifiers unless you explicitly consent.
          </p>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, or as required by law. Images uploaded for diagnosis are deleted after 30 days unless you request otherwise.
          </p>
        </section>

        <section>
          <h2>7. Your Rights Under POPIA</h2>
          <p>You have the following rights:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal information we hold.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements).</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interests.</li>
            <li><strong>Withdraw Consent:</strong> Withdraw your consent at any time.</li>
          </ul>
          <p>To exercise these rights, contact us at <a href="mailto:agriscan@cdsa.tech">agriscan@cdsa.tech</a>.</p>
        </section>

        <section>
          <h2>8. Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, loss, or alteration. However, no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2>9. Cookies</h2>
          <p>
            We use cookies to enhance your experience and analyse site usage. You can control cookie preferences through your browser settings. See our <Link to="/cookies">Cookie Policy</Link> for more details.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of significant changes by posting a notice on our website or by email.
          </p>
        </section>

        <section>
          <h2>11. Contact Us</h2>
          <p>
            For any questions or concerns about this Privacy Policy, please contact us at:<br />
            📧 <a href="mailto:agriscan@cdsa.tech">agriscan@cdsa.tech</a>
          </p>
        </section>

        <section>
          <h2>12. Complaints</h2>
          <p>
            If you believe we have violated your privacy rights, you have the right to lodge a complaint with the <strong>Information Regulator of South Africa</strong>:
            <br />
            <a href="https://www.justice.gov.za/inforeg/" target="_blank" rel="noopener noreferrer">https://www.justice.gov.za/inforeg/</a>
          </p>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPolicy