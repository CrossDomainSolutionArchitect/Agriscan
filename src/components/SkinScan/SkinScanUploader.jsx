import React, { useState, useRef } from 'react'
import { predictSkinCondition } from '../../services/skinscanService'
import styles from './SkinScanUploader.module.css'

function SkinScanUploader() {
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
      const prediction = await predictSkinCondition(image)
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

  return (
    <div className={styles.container}>
      <h2>🔬 SkinScan</h2>
      <p className={styles.subtitle}>
        Upload a photo of a skin condition for AI analysis
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
            <span className={styles.uploadIcon}>📷</span>
            <p>Drag & drop an image here, or click to browse</p>
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
            <img src={preview} alt="Skin condition" className={styles.previewImage} />
            {!loading && !result && (
              <div className={styles.imageActions}>
                <button onClick={handleAnalyze} className={styles.analyzeBtn}>
                  🔬 Analyze Image
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
              <p>Analyzing your image...</p>
              <p className={styles.loadingNote}>This may take a few seconds</p>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className={styles.results}>
              <h3>Diagnosis Result</h3>
              <div className={styles.diagnosisBox}>
                <span className={styles.diagnosisLabel}>Predicted Condition:</span>
                <span className={styles.diagnosisValue}>{result.diagnosis}</span>
              </div>

              <div className={styles.confidenceSection}>
                <h4>Confidence Scores</h4>
                {result.confidences && result.confidences.length > 0 ? (
                  <div className={styles.confidenceList}>
                    {result.confidences.map((item, index) => (
                      <div key={index} className={styles.confidenceItem}>
                        <span className={styles.confidenceLabel}>{item.label}</span>
                        <div className={styles.confidenceBar}>
                          <div 
                            className={styles.confidenceFill}
                            style={{ width: `${(item.confidence || 0) * 100}%` }}
                          />
                        </div>
                        <span className={styles.confidenceValue}>
                          {((item.confidence || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noConfidence}>No confidence data available</p>
                )}
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
                Always consult a qualified healthcare professional for medical advice.
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

export default SkinScanUploader