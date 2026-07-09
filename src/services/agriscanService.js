// Agriscan API Service - Using @gradio/client
import { Client } from '@gradio/client'

const SPACE_NAME = 'Vernard/agriscan-ai-demo'

let client = null

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

// Parse the Markdown table from Agriscan output
function parseAgriscanTable(markdown) {
  // Extract the table rows between the header and the footer
  const tableRegex = /\|\s*#\d+\s*\|\s*`([^`]+)`\s*\|\s*([\d.]+)%?\s*\|\s*[`█░]+\s*\|/g
  const predictions = []
  let match
  
  while ((match = tableRegex.exec(markdown)) !== null) {
    const label = match[1].trim()
    const confidence = parseFloat(match[2]) / 100  // Convert to 0-1
    predictions.push({ label, confidence })
  }
  
  return predictions
}

// Predict plant disease
export async function predictPlantDisease(imageFile) {
  try {
    const client = await getClient()
    const result = await client.predict('/predict', {
      image: imageFile
    })
    
    const rawOutput = result.data?.[0] || 'No diagnosis returned'
    
    // Parse the table
    const predictions = parseAgriscanTable(rawOutput)
    
    // Determine top prediction
    let topPrediction = null
    if (predictions.length > 0) {
      topPrediction = predictions[0] // Already sorted by rank
    }
    
    return {
      predictions: predictions,
      topPrediction: topPrediction,
      rawOutput: rawOutput,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Agriscan API error:', error)
    throw new Error(error.message || 'Failed to analyze plant image. Please try again.')
  }
}