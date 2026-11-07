// AgriScan application API client. AI inference is called server-side by FastAPI.
import recommendationData from '../data/diseaseRecommendations.json'

const API_BASE_URL = (import.meta.env.VITE_AGRISCAN_API_URL || '').replace(/\/$/, '')
const MIN_RECOMMENDATION_CONFIDENCE = 0.6
const recommendations = recommendationData.diseases

function parseMarkdownTable(markdown) {
  const predictions = []
  const patterns = [
    /\|\s*#\d+\s*\|\s*`([^`]+)`\s*\|\s*\*\*([\d.]+)%?\*\*\s*\|\s*[\`█░]+\s*\|/g,
    /\|\s*#\d+\s*\|\s*`([^`]+)`\s*\|\s*([\d.]+)%?\s*\|\s*[\`█░]+\s*\|/g,
  ]
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(markdown)) !== null) {
      const confidence = Number.parseFloat(match[2]) / 100
      if (Number.isFinite(confidence) && confidence > 0) {
        predictions.push({ label: match[1].trim(), confidence })
      }
    }
    if (predictions.length) break
  }
  return predictions
}

function extractTopPrediction(markdown) {
  return markdown.match(/Top-1 Label:\s*`([^`]+)`/)?.[1]?.trim() || null
}

function normalizeLabel(label) {
  return label.replace(/[`"]/g, '').replace(/___|__/g, ' ')
    .replace(/[_-]+/g, ' ').replace(/,\s*/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase()
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
    throw new Error('AgriScan API URL is not configured. Set VITE_AGRISCAN_API_URL.')
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
    throw new Error(body.detail || `AgriScan API request failed (${response.status}).`)
  }
  return body
}

export async function predictPlantDisease(imageFile, token, cropType) {
  if (!token) throw new Error('Your sign-in session has expired. Please sign in again.')
  if (!cropType) throw new Error('Select the crop type before analyzing the image.')

  const form = new FormData()
  form.append('image', imageFile)
  form.append('crop_type', cropType.toLowerCase())

  const result = await apiRequest('/api/v1/diagnoses', token, {
    method: 'POST',
    body: form,
  })

  const rawOutput = result.raw_output || ''
  const confidences = result.confidences?.length
    ? result.confidences
    : parseMarkdownTable(rawOutput)
  const topPrediction = result.diagnosis || confidences[0]?.label ||
    extractTopPrediction(rawOutput) ||
    'Unable to parse prediction. Please try again with a clearer image.'
  const topConfidence = Number(result.top_confidence ?? confidences[0]?.confidence ?? 0)
  const matchedRecommendation = findRecommendation(topPrediction)
  const gated = topConfidence < MIN_RECOMMENDATION_CONFIDENCE || !matchedRecommendation
  const gateMessage = !matchedRecommendation
    ? 'No recommendation is available for this model result. Please consult an agricultural expert.'
    : topConfidence < MIN_RECOMMENDATION_CONFIDENCE
      ? `The prediction confidence is ${(topConfidence * 100).toFixed(1)}%. Upload a clearer image before acting on this result.`
      : null

  return {
    id: result.diagnosis_id,
    diagnosis: matchedRecommendation?.diagnosis || topPrediction,
    confidences,
    topConfidence,
    recommendation: matchedRecommendation?.recommendation || null,
    gated,
    gateMessage,
    timestamp: result.created_at || new Date().toISOString(),
    status: result.status,
  }
}

export async function getDiagnosisHistory(token) {
  return apiRequest('/api/v1/diagnoses?limit=100', token)
}

export async function getHealthStatus() {
  if (!API_BASE_URL) return { status: 'unconfigured' }
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    if (!response.ok) throw new Error('API unavailable')
    return await response.json()
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}
