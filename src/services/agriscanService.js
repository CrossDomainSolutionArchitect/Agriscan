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
    .replace(/,\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function findRecommendation(label) {
  const normalized = normalizeLabel(label)
  const entry = Object.entries(recommendations).find(([key]) => normalizeLabel(key) === normalized)
  return entry ? { diagnosis: entry[0], recommendation: entry[1] } : null
}

function scoreList(scores, limit = 5) {
  if (Array.isArray(scores)) {
    return scores
      .map((item) => ({ label: String(item.label || ''), confidence: Number(item.confidence) }))
      .filter((item) => item.label && Number.isFinite(item.confidence))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit)
  }
  return Object.entries(scores || {})
    .map(([label, confidence]) => ({ label, confidence: Number(confidence) }))
    .filter((item) => Number.isFinite(item.confidence))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit)
}

async function apiRequest(path, token, options = {}) {
  if (!API_BASE_URL) throw new Error('AgriScan API URL is not configured.')
  if (!token) throw new Error('Your sign-in session has expired. Please sign in again.')

  const response = await fetch(API_BASE_URL + path, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: 'Bearer ' + token },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = typeof body.detail === 'string' ? body.detail : null
    throw new Error(detail || ('AgriScan API request failed (' + response.status + ').'))
  }
  return body
}

export async function syncFarmerProfile(token, profile = {}) {
  const form = new FormData()
  const allowedFields = [
    'first_name', 'last_name', 'username', 'email_address', 'phone',
    'province', 'district', 'preferred_language',
  ]
  allowedFields.forEach((field) => {
    const value = profile[field]
    if (typeof value === 'string' && value.trim()) form.append(field, value.trim())
  })
  return apiRequest('/api/v1/me', token, { method: 'POST', body: form })
}

export async function predictPlantDisease(imageFile, token, cropType, personalDataConsent = false) {
  if (!imageFile) throw new Error('Choose a crop image before analysing.')
  if (!cropType) throw new Error('Select the crop type before analysing.')
  if (!personalDataConsent) throw new Error('Consent to personal-data processing is required.')

  const form = new FormData()
  form.append('image', imageFile)
  form.append('crop_type', cropType.toLowerCase())
  form.append('personal_data_consent', 'true')

  const response = await apiRequest('/api/v1/diagnoses', token, { method: 'POST', body: form })
  const diagnosis = response.diagnosis || {}
  const prediction = response.prediction || {}
  const leaf = prediction.leaf_detection || {}
  const cropBlock = prediction.crop_classifier || {}
  const diseaseBlock = prediction.disease_classifier || {}
  const cropPredictions = scoreList(cropBlock.top_predictions || prediction.crop_predictions, 3)
  const diseasePredictions = scoreList(diseaseBlock.top_predictions || prediction.disease_predictions, 5)

  const topDiseaseLabel = diseasePredictions[0]?.label || diagnosis.disease_name || 'Unclassified result'
  const topConfidence = diseasePredictions[0]?.confidence ?? Number(diagnosis.confidence || 0)
  const matchedRecommendation = findRecommendation(topDiseaseLabel)
  const reviewRequired = diagnosis.status === 'review_required'
  const gated = reviewRequired || topConfidence < MIN_RECOMMENDATION_CONFIDENCE || !matchedRecommendation

  let gateMessage = null
  if (reviewRequired) {
    gateMessage = 'The crop detector and requested crop or classifier results need review. Please confirm the crop and diagnosis with an agricultural expert.'
  } else if (!matchedRecommendation) {
    gateMessage = 'No recommendation is available for this model result. Please consult an agricultural expert.'
  } else if (topConfidence < MIN_RECOMMENDATION_CONFIDENCE) {
    gateMessage = 'The prediction confidence is ' + (topConfidence * 100).toFixed(1) + '%. Upload a clearer image before acting on this result.'
  }

  return {
    id: diagnosis.id,
    diagnosis: matchedRecommendation?.diagnosis || diagnosis.disease_name || topDiseaseLabel,
    cropPredictions,
    diseasePredictions,
    confidences: diseasePredictions,
    topConfidence,
    recommendation: matchedRecommendation?.recommendation || null,
    gated,
    gateMessage,
    timestamp: diagnosis.created_at || new Date().toISOString(),
    status: diagnosis.status || 'completed',
    predictedCrop: prediction.predicted_crop || null,
    requestedCrop: prediction.requested_crop || cropType.toLowerCase(),
    leafDetection: {
      model: leaf.model || 'YOLO11n',
      crop: leaf.crop || null,
      confidence: Number.isFinite(Number(leaf.confidence)) ? Number(leaf.confidence) : null,
      annotatedImage: leaf.annotated_image || null,
      detected: leaf.detected !== false,
    },
    details: prediction.details || '',
  }
}

export async function getDiagnosisHistory(token, limit = 20) {
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || 20))
  return apiRequest('/api/v1/diagnoses?limit=' + safeLimit, token)
}

export async function getHealthStatus() {
  if (!API_BASE_URL) return { status: 'unconfigured' }
  try {
    const response = await fetch(API_BASE_URL + '/health')
    if (!response.ok) throw new Error('API unavailable (' + response.status + ')')
    return await response.json()
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}
