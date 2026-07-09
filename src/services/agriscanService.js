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

// Parse Markdown table from Agriscan output
function parseMarkdownTable(markdown) {
  const predictions = []
  
  // Try multiple patterns to handle different table formats
  const patterns = [
    // Pattern for: | #1 | `Label` | **21.66%** | `████...` |
    /\|\s*#\d+\s*\|\s*`([^`]+)`\s*\|\s*\*\*([\d.]+)%?\*\*\s*\|\s*[`█░]+\s*\|/g,
    // Pattern for: | #1 | `Label` | 21.66% | `████...` |
    /\|\s*#\d+\s*\|\s*`([^`]+)`\s*\|\s*([\d.]+)%?\s*\|\s*[`█░]+\s*\|/g
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
    // If we found predictions, stop trying other patterns
    if (predictions.length > 0) break
  }
  
  return predictions
}

// Extract top prediction from the Markdown
function extractTopPrediction(markdown) {
  // Look for "Top-1 Label: `Label`"
  const topLabelMatch = markdown.match(/Top-1 Label:\s*`([^`]+)`/)
  if (topLabelMatch) {
    return topLabelMatch[1].trim()
  }
  return null
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
    let confidences = parseMarkdownTable(rawOutput)
    
    // If the table parsed successfully, use the first prediction as diagnosis
    let topPrediction = null
    
    if (confidences.length > 0) {
      topPrediction = confidences[0].label
    } else {
      // If table parsing failed, try to extract from the "Top-1 Label"
      topPrediction = extractTopPrediction(rawOutput)
    }
    
    // If still no prediction, show a default message
    if (!topPrediction) {
      topPrediction = 'Unable to parse prediction. Please try again with a clearer image.'
    }
    
    // Return in the SAME FORMAT as SkinScan
    return {
      diagnosis: topPrediction,
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