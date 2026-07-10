// SkinScan API Service - Using @gradio/client
import { Client } from '@gradio/client'

const SPACE_NAME = 'Vernard/scin-skin-classifier'

let client = null

// Initialize the client (singleton pattern)
async function getClient() {
  if (!client) {
    try {
      client = await Client.connect(SPACE_NAME)
    } catch (error) {
      console.error('Failed to connect to SkinScan API:', error)
      throw new Error('Could not connect to SkinScan API. Please try again later.')
    }
  }
  return client
}

// Predict skin condition from an image File
export async function predictSkinCondition(imageFile) {
  try {
    const client = await getClient()
    
    // The API expects the image as a File object
    const result = await client.predict('/predict', {
      image: imageFile
    })
    
    // Parse the response - the structure might be nested
    let predictionData = result.data
    
    // Sometimes the result is nested differently
    if (result.data && Array.isArray(result.data)) {
      predictionData = result.data[0]
    }
    
    return {
      diagnosis: predictionData.label || predictionData,
      confidences: predictionData.confidences || [],
      timestamp: new Date().toISOString(),
      raw: result
    }
  } catch (error) {
    console.error('SkinScan API error:', error)
    throw new Error(error.message || 'Failed to analyze image. Please try again.')
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
