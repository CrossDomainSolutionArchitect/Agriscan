import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { predictPlantDisease, syncFarmerProfile } from '../../services/agriscanService'
import styles from './AgriscanUploader.module.css'

const crops = [
  { number: '.01', title: 'Maize', image: '/images/Maizee.jpg' },
  { number: '.02', title: 'Tomato', image: '/images/Tomatos.jpg' },
  { number: '.03', title: 'Potato', image: '/images/Potato.jpg' },
]

function formatPredictionLabel(label) {
  const parts = String(label || '').split('___')
  return (parts.length > 1 ? parts[1] : parts[0]).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function PredictionList({ title, items, emptyMessage }) {
  return (
    <section className={styles.predictionPanel}>
      <h4>{title}</h4>
      {items?.length ? (
        <div className={styles.predictionList}>
          {items.map((item, index) => {
            const confidence = Math.max(0, Math.min(1, Number(item.confidence) || 0))
            return (
              <div className={styles.predictionRow} key={item.label || index}>
                <div className={styles.predictionTopline}>
                  <span className={styles.predictionLabel}>{formatPredictionLabel(item.label)}</span>
                  <strong>{(confidence * 100).toFixed(1)}%</strong>
                </div>
                <div className={styles.predictionTrack}>
                  <span className={styles.predictionFill} style={{ width: String(confidence * 100) + '%' }} />
                </div>
              </div>
            )
          })}
        </div>
      ) : <p className={styles.emptyPredictions}>{emptyMessage || 'No classifier scores were returned.'}</p>}
    </section>
  )
}

function AgriscanUploader() {
  const { getToken, isLoaded: authLoaded, isSignedIn } = useAuth()
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [personalDataConsent, setPersonalDataConsent] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  // Clerk session claims carry the verified profile fields used by the
  // existing backend upsert. Force a fresh token so newly configured claims
  // are available immediately rather than waiting for token cache expiry.
  useEffect(() => {
    if (!authLoaded || !isSignedIn) return undefined
    let active = true
    getToken({ skipCache: true })
      .then((token) => active && token ? syncFarmerProfile(token) : null)
      .catch((syncError) => console.warn('AgriScan profile synchronisation failed:', syncError.message))
    return () => { active = false }
  }, [authLoaded, isSignedIn, getToken])

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

  useEffect(() => () => stopCamera(), [])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const openUpload = (crop = null) => {
    if (crop) setSelectedCrop(crop)
    setError(null)
    setIsUploadOpen(true)
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setIsCameraOpen(false)
  }

  const setSelectedImage = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Please select an image file.')
    if (file.size > 8 * 1024 * 1024) return setError('The image must be 8 MB or smaller.')
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setPersonalDataConsent(false)
    setResult(null)
    setError(null)
    setIsUploadOpen(false)
  }

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported by this browser. Choose an image instead.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }, audio: false,
      })
      streamRef.current = stream
      setIsCameraOpen(true)
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (cameraError) {
      setError(cameraError.name === 'NotAllowedError'
        ? 'Camera permission was denied. Allow camera access or choose an image instead.'
        : 'Could not access the camera. Choose an image instead.')
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
      if (!blob) return setError('Could not capture the photo. Please try again.')
      setSelectedImage(new File([blob], 'agriscan-' + Date.now() + '.jpg', { type: 'image/jpeg' }))
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) setSelectedImage(file)
    event.target.value = ''
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) setSelectedImage(file)
  }

  const handleAnalyze = async () => {
    if (!image) return setError('Upload a leaf photograph before analysis.')
    if (!selectedCrop || !['maize', 'tomato', 'potato'].includes(selectedCrop.title.toLowerCase())) {
      return setError('Select maize, tomato or potato before analysing.')
    }
    if (!personalDataConsent) return setError('Please accept the personal-data processing notice before submitting your image.')

    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const token = await getToken({ skipCache: true })
      if (!token) throw new Error('Your sign-in session has expired. Please sign in again.')
      await syncFarmerProfile(token)
      setResult(await predictPlantDisease(image, token, selectedCrop.title.toLowerCase(), personalDataConsent))
    } catch (err) {
      setError(err.message || 'Failed to analyse the image. Please try again.')
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
    setPersonalDataConsent(false)
    setIsUploadOpen(false)
  }

  const leafDetection = result?.leafDetection

  return (
    <div className={styles.container}>
      <header className={styles.pageIntro}>
        <span className={styles.eyebrow}>AgriScan · AI Agricultural Intelligence</span>
        <h2>Upload a leaf photograph</h2>
        <p>AgriScan uses YOLO11n for leaf detection, followed by EfficientNetB0 for crop identification and disease prediction.</p>
      </header>

      <div className={styles.cropOptions}>
        {crops.map((crop) => (
          <button
            className={[styles.cropOption, selectedCrop?.title === crop.title ? styles.cropOptionSelected : ''].join(' ')}
            key={crop.title}
            type="button"
            onClick={() => setSelectedCrop(crop)}
            aria-pressed={selectedCrop?.title === crop.title}
            aria-label={'Select ' + crop.title}
          >
            <img src={crop.image} alt={crop.title + ' crop'} loading="lazy" />
            <div className={styles.cropContent}>
              <span className={styles.cropNumber}>{crop.number}</span>
              <h3>{crop.title}</h3>
            </div>
          </button>
        ))}
      </div>

      <section className={styles.uploadWorkspace}>
        <div className={styles.uploadPanel}>
          <div className={styles.uploadPanelHeading}>
            <div><span className={styles.panelEyebrow}>01 · Image input</span><h3>Upload a leaf photograph</h3></div>
            <span className={styles.supportedCrops}>Maize · Tomato · Potato</span>
          </div>

          {!preview ? (
            <button type="button" className={styles.dropzoneButton} onClick={() => openUpload()}>
              <span className={styles.uploadIcon} aria-hidden="true">↑</span>
              <strong>Drop Image Here - or - Click to Upload</strong>
              <span>JPG, PNG or WEBP · Maximum 8 MB</span>
            </button>
          ) : (
            <div
              className={[styles.previewBox, isDragging ? styles.previewBoxDragging : ''].join(' ')}
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <img src={preview} alt="Selected leaf photograph" className={styles.previewImage} />
              <div className={styles.previewActions}>
                <span>{image?.name}</span>
                <button type="button" className={styles.textButton} onClick={() => openUpload()}>Replace image</button>
              </div>
            </div>
          )}

          <label className={styles.consentLabel}>
            <input type="checkbox" checked={personalDataConsent} onChange={(event) => setPersonalDataConsent(event.target.checked)} disabled={!image} />
            <span>I agree that AgriScan may process this image to provide a crop-health diagnosis and save the diagnosis details to my account. The image is processed in memory and is not stored. See the <Link to="/privacy">Privacy Policy</Link>.</span>
          </label>

          <div className={styles.uploadActions}>
            <button type="button" onClick={handleAnalyze} className={styles.analyzeBtn} disabled={!image || !selectedCrop || !personalDataConsent || loading}>
              {loading ? 'Analysing…' : 'Analyse Image'}
            </button>
            {image && <button type="button" onClick={handleReset} className={styles.resetBtn} disabled={loading}>Clear</button>}
          </div>
          <p className={styles.privacyNote}>Your photograph is analysed in memory and is not saved to storage.</p>
          {error && <div className={styles.errorBox} role="alert"><strong>Analysis could not continue</strong><p>{error}</p></div>}
        </div>

        <aside className={styles.pipelineCard}>
          <span className={styles.panelEyebrow}>Analysis workflow</span>
          <h3>Three-stage AI assessment</h3>
          <ol className={styles.pipelineSteps}>
            <li><span>01</span><div><strong>YOLO11n</strong><small>Detects the leaf and isolates its region.</small></div></li>
            <li><span>02</span><div><strong>EfficientNetB0 · Crop</strong><small>Ranks the likely crop identities.</small></div></li>
            <li><span>03</span><div><strong>EfficientNetB0 · Disease</strong><small>Ranks disease and healthy-leaf classes.</small></div></li>
          </ol>
        </aside>
      </section>

      {loading && (
        <section className={styles.processingPanel} aria-live="polite">
          <div className={styles.spinner} />
          <div><h3>Analysing your leaf photograph</h3><p>Running YOLO11n detection, crop classification and disease prediction.</p></div>
          <ol className={styles.processingSteps}><li>YOLO11n leaf detection</li><li>EfficientNetB0 crop identification</li><li>EfficientNetB0 disease prediction</li></ol>
        </section>
      )}

      {result && !loading && (
        <section className={styles.results} aria-live="polite">
          <div className={styles.resultsHeading}>
            <div><span className={styles.panelEyebrow}>02 · Model output</span><h3>AgriScan analysis results</h3></div>
            <span className={result.status === 'review_required' ? styles.reviewStatus : styles.completeStatus}>
              {result.status === 'review_required' ? 'Review required' : 'Analysis completed'}
            </span>
          </div>

          <div className={styles.finalDiagnosis}>
            <div>
              <span className={styles.diagnosisLabel}>Predicted condition</span>
              <h4>{result.diagnosis || 'No clear prediction'}</h4>
              <p>Requested crop: {result.requestedCrop || selectedCrop?.title?.toLowerCase()} · Model crop: {result.predictedCrop || 'Unclassified'}</p>
            </div>
            <div className={styles.diagnosisConfidence}><strong>{(result.topConfidence * 100).toFixed(1)}%</strong><span>Disease confidence</span></div>
          </div>

          {result.gated && result.gateMessage && (
            <div className={styles.reviewNotice} role="status"><strong>Verify before taking action</strong><p>{result.gateMessage}</p></div>
          )}

          <div className={styles.stageResults}>
            <section className={styles.stageCard}>
              <div className={styles.stageHeading}><span>01</span><div><h4>YOLO11n leaf detection</h4><p>Detected leaf region used as input to EfficientNetB0.</p></div></div>
              <img src={leafDetection?.annotatedImage || preview} alt="YOLO11n annotated leaf detection" className={styles.detectionImage} />
              <div className={styles.detectionMetrics}>
                <div><span>Detected crop</span><strong>{leafDetection?.crop || 'Leaf region detected'}</strong></div>
                <div><span>Detection confidence</span><strong>{typeof leafDetection?.confidence === 'number' ? (leafDetection.confidence * 100).toFixed(1) + '%' : 'Not returned'}</strong></div>
                <div><span>Detector</span><strong>{leafDetection?.model || 'YOLO11n'}</strong></div>
              </div>
            </section>

            <PredictionList title="Crop classifier — top predictions" items={result.cropPredictions} emptyMessage="No crop classifier scores were returned." />
            <PredictionList title="Disease classifier — top predictions" items={result.diseasePredictions} emptyMessage="No disease classifier scores were returned." />
          </div>

          {!result.gated && result.recommendation && (
            <section className={styles.recommendation}>
              <div className={styles.recommendationHeader}>
                <h4>Recommended action</h4>
                <span className={[styles.urgency, styles[result.recommendation.urgency] || ''].join(' ')}>
                  {String(result.recommendation.urgency || 'monitor').toUpperCase()} URGENCY
                </span>
              </div>
              <p className={styles.recommendationSummary}>{result.recommendation.summary}</p>
              {result.recommendation.symptoms && <p className={styles.recommendationSymptoms}><strong>What to look for:</strong> {result.recommendation.symptoms}</p>}
              {result.recommendation.actions?.length > 0 && (
                <div><strong>What to do</strong><ul className={styles.recommendationActions}>{result.recommendation.actions.map((action, index) => <li key={index}>{action}</li>)}</ul></div>
              )}
              {result.recommendation.consultExpert && <p className={styles.expertNote}>Confirm this diagnosis with a qualified agricultural extension officer before applying chemical treatment.</p>}
            </section>
          )}

          <div className={styles.resultFooter}>
            <p>Research prototype: model scores are not guarantees of correctness. Validate predictions through field observations and qualified agricultural advice.</p>
            <div className={styles.resultActions}>
              <button type="button" onClick={handleReset} className={styles.newAnalysisBtn}>New analysis</button>
              <button type="button" onClick={() => window.print()} className={styles.printBtn}>Print results</button>
            </div>
          </div>
        </section>
      )}

      <div className={styles.requestOption}>
        <div><span className={styles.kicker}>Bring AgriScan to your farm</span><h3>Smarter crop health starts here.</h3></div>
        <p>Request a demonstration to explore AgriScan with your farming operation or organisation.</p>
        <Link to="/agriscan" className={styles.demoLink}>Request demo <span aria-hidden="true">↗</span></Link>
      </div>

      {isUploadOpen && (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => { stopCamera(); setIsUploadOpen(false) }}>
          <div className={styles.uploadModal} role="dialog" aria-modal="true" aria-labelledby="upload-modal-title" onClick={(event) => event.stopPropagation()}>
            <button className={styles.closeButton} type="button" onClick={() => { stopCamera(); setIsUploadOpen(false) }} aria-label="Close upload dialog">×</button>
            <span className={styles.modalKicker}>AgriScan image input</span>
            <h3 id="upload-modal-title">Upload a leaf photograph</h3>
            <p>Drop Image Here - or - Click to Upload</p>
            {!selectedCrop && (
              <label className={styles.cropSelector}>
                <strong>Crop type</strong>
                <select value={selectedCrop?.title || ''} onChange={(event) => setSelectedCrop(crops.find((crop) => crop.title === event.target.value) || null)}>
                  <option value="">Select crop</option>
                  {crops.map((crop) => <option key={crop.title} value={crop.title}>{crop.title}</option>)}
                </select>
              </label>
            )}
            <label className={styles.uploadDropzone} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { handleDrop(event); setIsUploadOpen(false) }}>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className={styles.fileInput} />
              <span className={styles.uploadIcon}>↑</span>
              <strong>Click to Upload</strong>
              <span className={styles.uploadHint}>JPG, PNG or WEBP · Maximum 8 MB</span>
            </label>
            {!isCameraOpen ? (
              <button className={styles.cameraButton} type="button" onClick={startCamera}><span aria-hidden="true">◉</span> Use camera</button>
            ) : (
              <div className={styles.cameraPanel}>
                <video ref={videoRef} autoPlay muted playsInline className={styles.cameraPreview} />
                <div className={styles.cameraActions}>
                  <button className={styles.captureButton} type="button" onClick={capturePhoto}>Capture photo</button>
                  <button className={styles.cancelButton} type="button" onClick={stopCamera}>Cancel camera</button>
                </div>
              </div>
            )}
            {error && <p className={styles.modalError} role="alert">{error}</p>}
            <button className={styles.cancelButton} type="button" onClick={() => setIsUploadOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgriscanUploader
