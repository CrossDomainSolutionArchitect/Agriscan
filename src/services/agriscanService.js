// Agriscan API Service - Using @gradio/client
import { Client } from '@gradio/client'
import recommendationData from '../data/diseaseRecommendations.json'

const SPACE_NAME = 'Vernard/agriscan-ai-demo'

let client = null

// Initialize the client (singleton pattern)
async function getClient() {
  if (!client) {
    try {
      client = await Client.connect(SPACE_NAME)
    } catch (error) {
      console.error('Failed to connect to Agriscan API:', error)
      throw new Error('Could not connect to Agriscan API. Please try again later.')
    }
  }
  return client
}

// Parse Markdown table from Agriscan output
function parseMarkdownTable(markdown) {
  const predictions = []

  const patterns = [
    /\|\s*#\d+\s*\|\s*`([^`]+)`\s*\|\s*\*\*([\d.]+)%?\*\*\s*\|\s*[`█░]+\s*\|/g,
    /\|\s*#\d+\s*\|\s*`([^`]+)`\s*\|\s*([\d.]+)%?\s*\|\s*[`█░]+\s*\|/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(markdown)) !== null) {
      const label = match[1].trim()
      const confidence = parseFloat(match[2]) / 100
      if (!isNaN(confidence) && confidence > 0) {
        predictions.push({ label, confidence })
      }
    }
    if (predictions.length > 0) break
  }

  return predictions
}

// Extract top prediction from the Markdown
function extractTopPrediction(markdown) {
  const topLabelMatch = markdown.match(/Top-1 Label:\s*`([^`]+)`/)
  if (topLabelMatch) {
    return topLabelMatch[1].trim()
  }
  return null
}

// Extract top-1 confidence from the Markdown details block
function extractTopConfidence(markdown) {
  const match = markdown.match(/Top-1 Confidence:\s*`?([\d.]+)%?`?/)
  if (match) {
    return parseFloat(match[1]) / 100
  }
  return null
}

// Enrich a prediction with treatment recommendation and confidence gating
function enrichPrediction(prediction) {
  const { diagnosis, confidences } = prediction

  // Determine top confidence — prefer the parsed table, fall back to the details block
  const topConfidence =
    confidences.length > 0
      ? confidences[0].confidence
      : extractTopConfidence(prediction.rawOutput || '') ?? 0

  // Gate: reject low-confidence results
  if (topConfidence > 0 && topConfidence < 0.50) {
    return {
      ...prediction,
      topConfidence,
      recommendation: null,
      gated: true,
      gateReason: 'low-confidence',
      gateMessage:
        'The model is not confident about this result. Try a clearer, close-up photo of a single leaf, or consult an agricultural extension officer before applying any treatment.',
    }
  }

  // Gate: the model could not parse a prediction at all
  if (!diagnosis || diagnosis.startsWith('Unable to parse')) {
    return {
      ...prediction,
      topConfidence,
      recommendation: null,
      gated: true,
      gateReason: 'unparsed',
      gateMessage:
        'We could not interpret this image. This usually means the image is unclear, is not a leaf, or shows a disease the model has not seen. Please try a clearer close-up photo of a single leaf.',
    }
  }

  // Look up recommendation
  const rec = recommendationData.diseases[diagnosis]

  if (!rec) {
    return {
      ...prediction,
      topConfidence,
      recommendation: null,
      gated: false,
      gateMessage: 'No specific recommendation is available for this class.',
    }
  }

  return {
    ...prediction,
    topConfidence,
    recommendation: rec,
    gated: false,
    gateMessage: null,
  }
}

// Predict plant disease from an image File
export async function predictPlantDisease(imageFile) {
  try {
    const client = await getClient()

    const result = await client.predict('/predict', {
      image: imageFile,
    })

    const rawOutput = result.data?.[0] || 'No diagnosis returned'

    // Parse the markdown table into structured data
    const confidences = parseMarkdownTable(rawOutput)

    // Determine top prediction label
    let topPrediction = null
    if (confidences.length > 0) {
      topPrediction = confidences[0].label
    } else {
      topPrediction = extractTopPrediction(rawOutput)
    }

    if (!topPrediction) {
      topPrediction = 'Unable to parse prediction. Please try again with a clearer image.'
    }

    // Build the base prediction object
    const basePrediction = {
      diagnosis: topPrediction,
      confidences,
      timestamp: new Date().toISOString(),
      rawOutput,
      raw: result,
    }

    // Enrich with recommendation + gating
    return enrichPrediction(basePrediction)
  } catch (error) {
    console.error('Agriscan API error:', error)
    throw new Error(error.message || 'Failed to analyze plant image. Please try again.')
  }
}

// Get health status
export async function getHealthStatus() {
  try {
    await getClient()
    return { status: 'healthy', space: SPACE_NAME }
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}