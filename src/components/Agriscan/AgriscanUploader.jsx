import React, { useState } from 'react'
import { predictPlantDisease } from '../../services/agriscanService'
import styles from './AgriscanUploader.module.css'

const crops = [
  { number: '.01', title: 'Maize', image: '/images/Maizee.jpg' },
  { number: '.02', title: 'Tomato', image: '/images/Tomatos.jpg' },
  { number: '.03', title: 'Citrus', image: '/images/Citrus.jpg' },
  { number: '.04', title: 'Potato', image: '/images/Potato.jpg' },
]

function AgriscanUploader() {
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
  }

  return (
    <div className={styles.container}>
      <h2>What do you want to check?</h2>
      <p className={styles.subtitle}>
        Choose an area to explore with AI-powered analysis and recommendations.
      </p>

      <div className={styles.cropOptions}>
        {crops.map((crop) => (
          <article className={styles.cropOption} key={crop.title}>
            <img src={crop.image} alt={`${crop.title} crop`} loading="lazy" />
            <div className={styles.cropContent}>
              <span className={styles.cropNumber}>{crop.number}</span>
              <h3>{crop.title}</h3>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.requestOption}>
        <div>
          <span className={styles.kicker}>Bring Agriscan to your farm</span>
          <h3>Smarter crop health starts here.</h3>
        </div>
        <p>Get AI-powered crop disease analysis and recommendations tailored to your operation. Request a demo to explore Agriscan with your team.</p>
        <a href="/partner" className={styles.demoLink}>Request demo <span aria-hidden="true">↗</span></a>
      </div>

      {!preview && (
        <div className={styles.uploadUnavailable} role="status">
          <span className={styles.uploadIcon}>🌿</span>
          <p>Image upload is currently unavailable.</p>
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
              <p>Analyzing your image...</p>
              <p className={styles.loadingNote}>This may take a few seconds</p>
            </div>
          )}

          {/* Results - IDENTICAL to SkinScan */}
          {result && !loading && (
            <div className={styles.results}>
              <h3>🌾 Diagnosis Result</h3>
              <div className={styles.diagnosisBox}>
                <span className={styles.diagnosisLabel}>Predicted Condition:</span>
                <span className={styles.diagnosisValue}>
                  {result.diagnosis && !result.diagnosis.startsWith('Unable to parse') 
                    ? result.diagnosis 
                    : 'No clear prediction - try a different image'}
                </span>
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