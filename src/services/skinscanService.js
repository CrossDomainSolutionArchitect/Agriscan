// SkinScan API Service - Communicates with Hugging Face Space
import { Client, handle_file } from 'gradio-client'

const SPACE_NAME = 'Vernard/scin-skin-classifier'

let client = null

// Initialize the client (singleton pattern)
async function getClient() {
  if (!client) {
    client = await Client.connect(SPACE_NAME)
  }
  return client
}

// Predict skin condition from an image URL or File
export async function predictSkinCondition(imageSource) {
  try {
    const client = await getClient()
    
    // If imageSource is a File object, we need to handle it differently
    let result
    if (imageSource instanceof File) {
      // Convert File to a format gradio-client expects
      const fileData = handle_file(imageSource)
      result = await client.predict('/predict', { image: fileData })
    } else if (typeof imageSource === 'string' && imageSource.startsWith('http')) {
      // URL image
      const fileData = handle_file(imageSource)
      result = await client.predict('/predict', { image: fileData })
    } else if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
      // Base64 image (from canvas/camera)
      const fileData = handle_file(imageSource)
      result = await client.predict('/predict', { image: fileData })
    } else {
      throw new Error('Unsupported image format')
    }
    
    // Parse the response
    // The API returns: { label: "Acne", confidences: [{label: "Acne", confidence: 0.95}, ...] }
    return {
      diagnosis: result.label,
      confidences: result.confidences || [],
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('SkinScan API error:', error)
    throw error
  }
}

// Get health status of the API
export async function getHealthStatus() {
  try {
    const client = await getClient()
    return { status: 'healthy', space: SPACE_NAME }
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}