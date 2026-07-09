import React, { useState, useRef } from 'react'
import { predictPlantDisease } from '../../services/agriscanService'
import styles from './AgriscanUploader.module.css'
import { predictPlantDisease } from '../../services/agriscanService'
function AgriscanUploader() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
      setError(null)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
      setError(null)
    }
  }

  const handleAnalyze = async () => {
    if (!image) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const prediction = await predictPlantDisease(image)
      setResult(prediction)
    } catch (err) {
      setError(err.message || 'Failed to analyze image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Format the diagnosis text (handle markdown-like output)
  const formatDiagnosis = (text) => {
    if (!text) return null
    
    // Split by newlines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim())
    
    return lines.map((line, index) => {
      // Check if it's a header (starts with #)
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)?.[0]?.length || 1
        const content = line.replace(/^#+\s*/, '')
        const Tag = `h${Math.min(level + 1, 6)}`
        return React.createElement(Tag, { key: index, className: styles.diagnosisHeader }, content)
      }
      // Check for bold (**text**)
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={index} className={styles.diagnosisLine}>
            {parts.map((part, i) => {
              if (i % 2 === 1) return <strong key={i}>{part}</strong>
              return part
            })}
          </p>
        )
      }
      // Check for bullet points
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return <li key={index} className={styles.diagnosisBullet}>{line.trim().substring(1).trim()}</li>
      }
      // Regular paragraph
      return <p key={index} className={styles.diagnosisLine}>{line}</p>
    })
  }

  return (
    <div className={styles.container}>
      <h2>🌾 Agriscan</h2>
      <p className={styles.subtitle}>
        Upload a photo of a plant leaf for AI disease detection
      </p>

      {/* Upload Area */}
      {!preview && (
        <div 
          className={styles.uploadArea}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className={styles.uploadContent}>
            <span className={styles.uploadIcon}>🌿</span>
            <p>Drag & drop a leaf image here, or click to browse</p>
            <p className={styles.uploadHint}>Supports JPG, PNG, WEBP</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className={styles.fileInput}
          />
        </div>
      )}

      {/* Preview & Results */}
      {preview && (
        <div className={styles.previewSection}>
          <div className={styles.imageWrapper}>
            <img src={preview} alt="Plant leaf" className={styles.previewImage} />
            {!loading && !result && (
              <div className={styles.imageActions}>
                <button onClick={handleAnalyze} className={styles.analyzeBtn}>
                  🌾 Analyze Image
                </button>
                <button onClick={handleReset} className={styles.resetBtn}>
                  ✕ Change Image
                </button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner}></div>
              <p>Analyzing your plant image...</p>
              <p className={styles.loadingNote}>This may take a few seconds</p>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className={styles.results}>
              <h3>🌾 Diagnosis Result</h3>
              
              {/* Display confidence if available */}
              {result.confidence && (
                <div className={styles.confidenceBox}>
                  <span className={styles.confidenceLabel}>Confidence:</span>
                  <span className={styles.confidenceValue}>
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                  <div className={styles.confidenceBar}>
                    <div 
                      className={styles.confidenceFill}
                      style={{ width: `${(result.confidence * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Display the full diagnosis */}
              <div className={styles.diagnosisBox}>
                {formatDiagnosis(result.diagnosis)}
              </div>

              <div className={styles.resultActions}>
                <button onClick={handleReset} className={styles.newAnalysisBtn}>
                  🔄 New Analysis
                </button>
                <button 
                  onClick={() => window.print()} 
                  className={styles.printBtn}
                >
                  🖨️ Print Results
                </button>
              </div>

              <p className={styles.disclaimer}>
                ⚠️ This is an AI-powered tool for informational purposes only. 
                Always consult a qualified agricultural expert for crop disease advice.
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>⚠️</span>
              <p>{error}</p>
              <button onClick={handleReset} className={styles.retryBtn}>
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AgriscanUploader