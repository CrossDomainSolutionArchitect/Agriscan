// AgriScan API client for the integrated FastAPI + Gradio Space.
import recommendationData from '../data/diseaseRecommendations.json'

const API_BASE_URL = (import.meta.env.VITE_AGRISCAN_API_URL || '').replace(/\/$/, '')
const MIN_RECOMMENDATION_CONFIDENCE = 0.6
const recommendations = recommendationData.diseases

function normalizeLabel(label) {
  return String(label || '')
    .replace(/[\x60"]/g, '')
    .replace(/___|__/g, ' ')
    .replace(/[_-]+/g, ' ')
    .replace(/,\\s*/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function findRecommendation(label) {
  const normalized = normalizeLabel(label)
  const entry = Object.entries(recommendations).find(
    ([key]) => normalizeLabel(key) === normalized
  )
  return entry ? { diagnosis: entry[0], recommendation: entry[1] } : null
}

async function apiRequest(path, token, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('AgriScan API URL is not configured. Set VITE_AGRISCAN_API_URL in the website build environment.')
  }
  if (!token) {
    throw new Error('Your sign-in session has expired. Please sign in again.')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = typeof body.detail === 'string' ? body.detail : null
    throw new Error(detail || `AgriScan API request failed (${response.status}).`)
  }
  return body
}

export async function predictPlantDisease(imageFile, token, cropType, personalDataConsent = false) {
  if (!imageFile) throw new Error('Choose a crop image before analyzing.')
  if (!cropType) throw new Error('Select the crop type before analyzing.')
  if (!personalDataConsent) throw new Error('Consent to personal-data processing is required.')

  const form = new FormData()
  form.append('image', imageFile)
  form.append('crop_type', cropType.toLowerCase())
  form.append('personal_data_consent', 'true')

  const response = await apiRequest('/api/v1/diagnoses', token, {
    method: 'POST',
    body: form,
  })

  const diagnosis = response.diagnosis || {}
  const prediction = response.prediction || {}
  const diseaseScores = prediction.disease_predictions || {}
  const confidences = Object.entries(diseaseScores)
    .map(([label, confidence]) => ({ label, confidence: Number(confidence) }))
    .filter((item) => Number.isFinite(item.confidence))
    .sort((a, b) => b.confidence - a.confidence)

  const topLabel = confidences[0]?.label || diagnosis.disease_name || 'Unclassified result'
  const topConfidence = confidences[0]?.confidence ?? Number(diagnosis.confidence || 0)
  const matchedRecommendation = findRecommendation(topLabel)
  const reviewRequired = diagnosis.status === 'review_required'
  const gated = reviewRequired || topConfidence < MIN_RECOMMENDATION_CONFIDENCE || !matchedRecommendation

  let gateMessage = null
  if (reviewRequired) {
    gateMessage = 'The crop detector and requested crop or classifier results need review. Please confirm the crop and diagnosis with an agricultural expert.'
  } else if (!matchedRecommendation) {
    gateMessage = 'No recommendation is available for this model result. Please consult an agricultural expert.'
  } else if (topConfidence < MIN_RECOMMENDATION_CONFIDENCE) {
    gateMessage = `The prediction confidence is ${(topConfidence * 100).toFixed(1)}%. Upload a clearer image before acting on this result.`
  }

  return {
    id: diagnosis.id,
    diagnosis: matchedRecommendation?.diagnosis || topLabel,
    confidences,
    topConfidence,
    recommendation: matchedRecommendation?.recommendation || null,
    gated,
    gateMessage,
    timestamp: diagnosis.created_at || new Date().toISOString(),
    status: diagnosis.status || 'completed',
    predictedCrop: prediction.predicted_crop || null,
    requestedCrop: prediction.requested_crop || cropType.toLowerCase(),
    details: prediction.details || '',
  }
}

export async function getDiagnosisHistory(token, limit = 20) {
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || 20))
  return apiRequest(`/api/v1/diagnoses?limit=${safeLimit}`, token)
}

export async function getHealthStatus() {
  if (!API_BASE_URL) return { status: 'unconfigured' }
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    if (!response.ok) throw new Error(`API unavailable (${response.status})`)
    return await response.json()
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}
