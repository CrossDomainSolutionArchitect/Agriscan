// Application metadata and configuration

export const APP_NAME = 'cdsa.ai Studio'
export const CONTACT_EMAIL = 'hello@cdsa.tech'

export const PRODUCTS = [
  {
    title: 'SkinScan',
    status: 'In Development',
    description: 'Support clearer skin, face, nails, hair and teeth analysis from a single image.',
    tech: 'SkinScan · screening support, not a medical diagnosis',
    route: '/skinscan',
  },
  {
    title: 'Agriscan',
    status: 'In Development',
    description: 'Identify crop disease from a field photo and make more informed growing decisions.',
    tech: 'Agriscan · trained for Southern African conditions',
    route: '/agriscan',
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