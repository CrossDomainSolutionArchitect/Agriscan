// Agriscan API Service - Using REST API
const SPACE_NAME = 'Vernard/agriscan-ai-demo'
const API_URL = `https://${SPACE_NAME}.hf.space/api/predict`

// Helper: Convert File to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Predict plant disease from an image File
export async function predictPlantDisease(imageFile) {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile)
    
    // Build the request body - Agriscan expects a single image file
    const requestBody = {
      data: [
        {
          path: null,
          url: `data:${imageFile.type};base64,${base64Image}`,
          size: imageFile.size,
          orig_name: imageFile.name,
          mime_type: imageFile.type,
          is_stream: false,
          meta: {}
        }
      ]
    }
    
    // Call the API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`)
    }
    
    const result = await response.json()
    
    // Agriscan returns a string (Markdown) with the diagnosis
    // The result is in result.data[0] as a string
    const diagnosisText = result.data?.[0] || 'No diagnosis returned'
    
    // Try to parse if it contains JSON-like structure
    let parsedResult = null
    try {
      // Sometimes the response might be JSON stringified inside
      if (diagnosisText.includes('{') && diagnosisText.includes('}')) {
        const jsonMatch = diagnosisText.match(/\{.*\}/s)
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0])
        }
      }
    } catch (e) {
      // Not JSON, that's fine - it's plain text
    }
    
    return {
      diagnosis: parsedResult?.label || diagnosisText,
      confidence: parsedResult?.confidence || null,
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
    const response = await fetch(API_URL, { method: 'OPTIONS' })
    return { 
      status: response.ok ? 'healthy' : 'unhealthy', 
      space: SPACE_NAME,
      code: response.status
    }
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}