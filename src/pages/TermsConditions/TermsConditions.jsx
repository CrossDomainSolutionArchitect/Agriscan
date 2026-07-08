import React from 'react'
import { Link } from 'react-router-dom'
import styles from './TermsConditions.module.css'

function TermsConditions() {
  return (
    <div className={styles.page}>
      <div className="container">
        <Link to="/" className={styles.back}>← Back to home</Link>
        <h1>Terms &amp; Conditions</h1>
        <p className={styles.date}>Last updated: 8 July 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the cdsa.ai Studio website and our AI diagnostic tools 
            (Agriscan and SkinScan), you agree to be bound by these Terms &amp; Conditions. 
            If you do not agree, please do not use our services.
          </p>
        </section>

        <section>
          <h2>2. Description of Services</h2>
          <p>
            cdsa.ai Studio provides AI-powered image analysis for agricultural plant diseases 
            (Agriscan) and dermatological skin conditions (SkinScan). These tools are for 
            informational and educational purposes only and are not a substitute for professional 
            advice.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            To access certain features, you may need to create an account. You are responsible 
            for maintaining the confidentiality of your account credentials and for all activities 
            that occur under your account.
          </p>
        </section>

        <section>
          <h2>4. User Content</h2>
          <p>
            By uploading images to our platform, you grant us a non‑exclusive, royalty‑free, 
            worldwide licence to use, reproduce, and display the content for the purpose of 
            providing the AI diagnostic service and improving our models. You retain all 
            ownership rights to your content.
          </p>
          <p>
            You warrant that you have the right to upload the images and that they do not 
            infringe any third‑party rights.
          </p>
        </section>

        <section>
          <h2>5. Intellectual Property</h2>
          <p>
            All content, trademarks, logos, and software on our website are the property of 
            cdsa.ai Studio or its licensors and are protected by copyright and intellectual 
            property laws. You may not reproduce, distribute, or create derivative works 
            without our prior written consent.
          </p>
        </section>

        <section>
          <h2>6. Disclaimers and Limitation of Liability</h2>
          <p>
            Our AI tools are provided "as is" and "as available" without warranties of any kind, 
            express or implied. We do not guarantee the accuracy, completeness, or reliability 
            of the diagnostic results.
          </p>
          <p>
            To the fullest extent permitted by law, cdsa.ai Studio shall not be liable for any 
            direct, indirect, incidental, consequential, or punitive damages arising from your 
            use of our services or inability to use them.
          </p>
          <p>
            <strong>Please read our full <Link to="/disclaimer">Disclaimer</Link> for more details.</strong>
          </p>
        </section>

        <section>
          <h2>7. Third‑Party Links</h2>
          <p>
            Our website may contain links to third‑party websites. We are not responsible for 
            their content or privacy practices. We encourage you to read their terms and privacy 
            policies.
          </p>
        </section>

        <section>
          <h2>8. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to our services at any time 
            without notice for violation of these terms or for any other reason.
          </p>
        </section>

        <section>
          <h2>9. Governing Law</h2>
          <p>
            These Terms &amp; Conditions are governed by and construed in accordance with the laws 
            of the Republic of South Africa. Any disputes shall be subject to the exclusive 
            jurisdiction of the courts of South Africa.
          </p>
        </section>

        <section>
          <h2>10. Changes to Terms</h2>
          <p>
            We may revise these terms at any time. Continued use of our services after changes 
            constitutes your acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about these Terms &amp; Conditions, please contact us at:<br />
            📧 <a href="mailto:hello@cdsa.tech">hello@cdsa.tech</a>
          </p>
        </section>
      </div>
    </div>
  )
}

export default TermsConditions