// Agriscan API Service - Using @gradio/client (identical to SkinScan pattern)
import { Client } from '@gradio/client'

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

// Parse Markdown table from Agriscan output into { label, confidence } array
function parseMarkdownTable(markdown) {
  // Match all table rows with this pattern: | #1 | `Label` | 21.66% | `███...` |
  const rowRegex = /\|\s*#\d+\s*\|\s*`([^`]+)`\s*\|\s*([\d.]+)%?\s*\|\s*[`█░]+\s*\|/g
  const predictions = []
  let match

  while ((match = rowRegex.exec(markdown)) !== null) {
    const label = match[1].trim()
    const confidence = parseFloat(match[2]) / 100  // Convert to 0-1
    if (!isNaN(confidence)) {
      predictions.push({ label, confidence })
    }
  }

  return predictions
}

// Predict plant disease from an image File
export async function predictPlantDisease(imageFile) {
  try {
    const client = await getClient()

    // The API expects the image as a File object
    const result = await client.predict('/predict', {
      image: imageFile
    })

    // Get the raw Markdown output
    const rawOutput = result.data?.[0] || 'No diagnosis returned'

    // Parse the Markdown table into structured data
    const confidences = parseMarkdownTable(rawOutput)

    // Extract top prediction (first item)
    let topPrediction = null
    if (confidences.length > 0) {
      topPrediction = confidences[0].label
    }

    // Return in the SAME FORMAT as SkinScan
    return {
      diagnosis: topPrediction || 'No prediction available',
      confidences: confidences,
      timestamp: new Date().toISOString(),
      raw: result
    }
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