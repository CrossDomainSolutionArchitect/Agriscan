// Agriscan API Service - Using @gradio/client
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

// Predict plant disease from an image File
export async function predictPlantDisease(imageFile) {
  try {
    const client = await getClient()
    
    // The API expects the image as a File object
    const result = await client.predict('/predict', {
      image: imageFile
    })
    
    // Parse the response
    // Agriscan returns a string (Markdown) in the first data element
    let diagnosisText = result.data?.[0] || 'No diagnosis returned'
    
    // Try to extract any structured data if present
    let confidence = null
    let parsedLabel = null
    
    try {
      // Sometimes the response might contain JSON-like structure
      if (diagnosisText.includes('{') && diagnosisText.includes('}')) {
        const jsonMatch = diagnosisText.match(/\{.*\}/s)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          parsedLabel = parsed.label
          confidence = parsed.confidence
        }
      }
    } catch (e) {
      // Not JSON, that's fine - it's plain text
    }
    
    return {
      diagnosis: parsedLabel || diagnosisText,
      confidence: confidence || null,
      fullResponse: diagnosisText,
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