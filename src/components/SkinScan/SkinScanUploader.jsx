import React, { useState } from 'react'
import { predictSkinCondition } from '../../services/skinscanService'
import styles from './SkinScanUploader.module.css'

const checkOptions = [
  { number: '.01', title: 'Teeth', description: 'Analysis and recommendations for improving facial skin', image: '/images/teeth.jpg' },
  { number: '.02', title: 'Nails', description: 'Professional analysis of nail condition in 5 minutes', image: '/images/Nailts.jpg' },
  { number: '.03', title: 'Skin', description: 'Analysis and recommendations for improving skin', image: '/images/Skin.jpg' },
  { number: '.04', title: 'Hair', description: 'Professional analysis of hair condition in 5 minutes', image: '/images/Hair.jpg' },
]

function SkinScanUploader() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
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
  }

  return (
    <div className={styles.container}>
      <h2>What do you want to check?</h2>
      <p className={styles.subtitle}>
        Choose an area to explore with AI-powered analysis and recommendations.
      </p>

      <div className={styles.checkOptions}>
        {checkOptions.map((option) => (
          <article className={styles.checkOption} key={option.title}>
            <img src={option.image} alt={`${option.title} analysis`} className={styles.optionImage} loading="lazy" />
            <span className={styles.optionNumber}>{option.number}</span>
            <h3>{option.title}</h3>
            <p>{option.description}</p>
          </article>
        ))}
      </div>

      <div className={styles.makeupOption}>
        <div>
          <span className={styles.kicker}>Try on makeup online</span>
          <h3>Find your perfect shade in real time.</h3>
        </div>
        <p>Upload a photo or use your webcam to find the perfect shade of lipstick, eye shadow and blush in real time.<br /><br />Find out what suits you and create your own unique look without breaking the bank. Try it now and find your dream makeup!</p>
        <a href="/#/agriscan" className={styles.demoLink}>Request demo <span aria-hidden="true">↗</span></a>
      </div>

      {!preview && (
        <div className={styles.uploadUnavailable} role="status">
          <span className={styles.uploadIcon}>📷</span>
          <p>Image upload is currently unavailable.</p>
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

          {/* Results - IDENTICAL to SkinScan */}
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