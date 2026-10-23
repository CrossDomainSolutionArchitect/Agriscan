import React, { useEffect, useRef, useState } from 'react'
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
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (!isUploadOpen) {
      stopCamera()
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsUploadOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isUploadOpen])

  useEffect(() => {
    return () => stopCamera()
  }, [])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const openUpload = (crop = null) => {
    setSelectedCrop(crop)
    setError(null)
    setIsUploadOpen(true)
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setIsCameraOpen(false)
  }

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported by this browser. Choose an image instead.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      setIsCameraOpen(true)
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (cameraError) {
      setError(
        cameraError.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow camera access or choose an image instead.'
          : 'Could not access the camera. Choose an image instead.'
      )
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video?.videoWidth || !video.videoHeight) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Could not capture the photo. Please try again.')
        return
      }

      const file = new File([blob], `agriscan-${Date.now()}.jpg`, { type: 'image/jpeg' })
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
      setError(null)
      setIsUploadOpen(false)
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      event.target.value = ''
      return
    }

    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError(null)
    setIsUploadOpen(false)
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
    setSelectedCrop(null)
  }

  return (
    <div className={styles.container}>
      <h2>What do you want to check?</h2>
      <p className={styles.subtitle}>
        Choose an area to explore with AI-powered analysis and recommendations.
      </p>

      <div className={styles.cropOptions}>
        {crops.map((crop) => (
          <button
            className={styles.cropOption}
            key={crop.title}
            type="button"
            onClick={() => openUpload(crop)}
            aria-label={`Upload a ${crop.title} image`}
          >
            <img src={crop.image} alt={`${crop.title} crop`} loading="lazy" />
            <div className={styles.cropContent}>
              <span className={styles.cropNumber}>{crop.number}</span>
              <h3>{crop.title}</h3>
            </div>
          </button>
        ))}
      </div>

      <div className={styles.requestOption}>
        <div>
          <span className={styles.kicker}>Bring Agriscan to your farm</span>
          <h3>Smarter crop health starts here.</h3>
        </div>
        <p>Get AI-powered crop disease analysis and recommendations tailored to your operation. Request a demo to explore Agriscan with your team.</p>
        <a href="/#/agriscan" className={styles.demoLink}>Request demo <span aria-hidden="true">↗</span></a>
      </div>

      {!preview && (
        <button className={styles.uploadButton} type="button" onClick={() => openUpload()}>
          Upload a crop image
          <span aria-hidden="true">↗</span>
        </button>
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

      {isUploadOpen && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onClick={() => {
            stopCamera()
            setIsUploadOpen(false)
          }}
        >
          <div
            className={styles.uploadModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              type="button"
              onClick={() => {
                stopCamera()
                setIsUploadOpen(false)
              }}
              aria-label="Close upload dialog"
            >
              ×
            </button>
            <span className={styles.modalKicker}>Agriscan analysis</span>
            <h3 id="upload-modal-title">
              Upload {selectedCrop ? `${selectedCrop.title.toLowerCase()} ` : ''}photo
            </h3>
            <p>Use a clear photo of the crop or leaf for the best result.</p>
            <label className={styles.uploadDropzone}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              <span className={styles.uploadIcon}>↑</span>
              <strong>Choose an image</strong>
              <span className={styles.uploadHint}>JPG, PNG or WEBP</span>
            </label>
            {!isCameraOpen ? (
              <button className={styles.cameraButton} type="button" onClick={startCamera}>
                <span aria-hidden="true">◉</span>
                Use camera
              </button>
            ) : (
              <div className={styles.cameraPanel}>
                <video ref={videoRef} autoPlay muted playsInline className={styles.cameraPreview} />
                <div className={styles.cameraActions}>
                  <button className={styles.captureButton} type="button" onClick={capturePhoto}>
                    Capture photo
                  </button>
                  <button className={styles.cancelButton} type="button" onClick={stopCamera}>
                    Cancel camera
                  </button>
                </div>
              </div>
            )}
            {error && (
              <p className={styles.modalError} role="alert">
                {error}
              </p>
            )}
            <button
              className={styles.cancelButton}
              type="button"
              onClick={() => setIsUploadOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgriscanUploader