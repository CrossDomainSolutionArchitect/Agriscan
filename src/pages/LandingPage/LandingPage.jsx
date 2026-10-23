import React from 'react'
import Navbar from '../../components/Navbar/Navbar'
import Hero from '../../components/Hero/Hero'
import MetricsBar from '../../components/MetricsBar/MetricsBar'
import HowItWorks from '../../components/HowItWorks/HowItWorks'
import PartnerSection from '../../components/PartnerSection/PartnerSection'
import Footer from '../../components/Footer/Footer'
import styles from './LandingPage.module.css'

function LandingPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <Hero />
      <MetricsBar />
      <HowItWorks />
      <PartnerSection />
      <Footer />
    </div>
  )
}

export default LandingPage