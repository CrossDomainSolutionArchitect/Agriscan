// Application metadata and configuration

export const APP_NAME = 'cdsa.ai Studio'
export const CONTACT_EMAIL = 'hello@cdsa.tech'

export const PRODUCTS = [
  {
    title: 'Agriscan',
    status: 'In Development',
    image: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600&auto=format&fit=crop&q=60',
    description: 'AI plant disease detection from a single photo. Trained on 38 crop diseases and validated for Southern African conditions.',
    tech: 'Plant disease screening tool · agricultural research use',
    route: '/agriscan',
  },
  {
    title: 'SkinScan',
    status: 'In Development',
    image: 'https://images.unsplash.com/photo-1730288951113-9cc087c14b83?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZGVybWF0b2xvZ3l8ZW58MHx8MHx8fDA%3D',
    description: 'AI dermatology assistant for acne, eczema, and psoriasis — built for remote diagnosis support.',
    tech: 'Screening tool · not a medical diagnosis',
    route: '/skinscan',
  },
]

export const METRICS = [
  { value: '2', label: 'Deployed AI Models' },
  { value: '38', label: 'Crop Diseases Detected' },
  { value: '3', label: 'Skin Conditions Analyzed' },
  { value: '100%', label: 'Focus on Southern Africa' },
]

export const HOW_IT_WORKS = [
  { step: '1', title: 'Choose Your Tool', desc: 'Select Agriscan or SkinScan.' },
  { step: '2', title: 'Capture or Upload', desc: 'Take a photo with your phone.' },
  { step: '3', title: 'Get Instant AI Insights', desc: 'Receive a diagnosis and recommendations.' },
]

export const FOOTER_LINKS = [
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Terms & Conditions', path: '/terms' },
  { label: 'Disclaimer', path: '/disclaimer' },
  { label: 'Cookie Policy', path: '/cookies' },
]