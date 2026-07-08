import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Disclaimer.module.css'

function Disclaimer() {
  return (
    <div className={styles.page}>
      <div className="container">
        <Link to="/" className={styles.back}>← Back to home</Link>
        <h1>Disclaimer</h1>
        <p className={styles.date}>Last updated: 8 July 2026</p>

        <section>
          <h2>1. AI Tools Are Not Professional Advice</h2>
          <p>
            <strong>Agriscan</strong> and <strong>SkinScan</strong> are artificial intelligence‑based 
            tools developed by cdsa.ai Studio. They provide automated analysis of plant images and 
            skin photographs to suggest possible diseases or conditions.
          </p>
          <p>
            <strong>These tools are for informational and educational purposes only.</strong> They 
            are <strong>not</strong> a substitute for professional:
          </p>
          <ul>
            <li><strong>Agricultural</strong> advice from a qualified agronomist, plant pathologist, or extension officer.</li>
            <li><strong>Medical or dermatological</strong> advice, diagnosis, or treatment from a licensed healthcare professional.</li>
          </ul>
          <p>
            Always seek the advice of a qualified professional with any questions you may have 
            regarding a specific plant disease or skin condition. Never disregard professional 
            advice or delay in seeking it because of something you have read or seen on our platform.
          </p>
        </section>

        <section>
          <h2>2. No Guarantee of Accuracy</h2>
          <p>
            While we strive to make our AI models as accurate as possible, we cannot guarantee 
            that the results are always correct. The AI may produce false positives or false 
            negatives. We strongly recommend that you verify any AI‑generated diagnosis with 
            a professional before taking action.
          </p>
        </section>

        <section>
          <h2>3. Limitation of Liability</h2>
          <p>
            cdsa.ai Studio, its founders, employees, and affiliates are not liable for any 
            loss, damage, injury, or expense arising from the use of our AI tools. This includes 
            but is not limited to:
          </p>
          <ul>
            <li>Crop loss or financial damage from misdiagnosis of plant diseases.</li>
            <li>Health complications from misdiagnosis of skin conditions.</li>
            <li>Any reliance on the information provided by our platform.</li>
          </ul>
          <p>
            You use our services at your own risk.
          </p>
        </section>

        <section>
          <h2>4. No Medical Device Certification</h2>
          <p>
            SkinScan is not a registered medical device in South Africa or any other jurisdiction. 
            It is not intended to be used for clinical diagnosis or treatment decisions. It is a 
            research and educational tool.
          </p>
        </section>

        <section>
          <h2>5. User Responsibility</h2>
          <p>
            By using Agriscan or SkinScan, you accept full responsibility for how you interpret 
            and act upon the AI outputs. You agree that you are responsible for your own decisions 
            and actions.
          </p>
        </section>

        <section>
          <h2>6. External Links</h2>
          <p>
            Our platform may link to external resources for further reading. We do not endorse 
            or take responsibility for the content or accuracy of those external sites.
          </p>
        </section>

        <section>
          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about this disclaimer, please contact us at:<br />
            📧 <a href="mailto:hello@cdsa.tech">hello@cdsa.tech</a>
          </p>
        </section>
      </div>
    </div>
  )
}

export default Disclaimer