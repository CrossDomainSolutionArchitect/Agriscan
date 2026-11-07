import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import Navbar from '../../components/Navbar/Navbar'
import Loader from '../../components/Loader/Loader'
import { getDiagnosisHistory, syncFarmerProfile, deleteFarmerData } from '../../services/agriscanService'
import styles from './ProfilePage.module.css'

function displayValue(value) {
  return value && String(value).trim() ? value : 'Not provided'
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [consents, setConsents] = useState([])
  const [diagnoses, setDiagnoses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [databaseErased, setDatabaseErased] = useState(false)

  const loadAccount = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = await getToken({ skipCache: true })
      if (!token) throw new Error('Your session has expired. Sign in again to view your account.')
      const [me, history] = await Promise.all([
        syncFarmerProfile(token),
        getDiagnosisHistory(token, 50),
      ])
      setProfile(me.farmer || null)
      setConsents(Array.isArray(me.consents) ? me.consents : [])
      setDiagnoses(Array.isArray(history.items) ? history.items : [])
    } catch (loadError) {
      setError(loadError.message || 'Your account information could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    if (isLoaded && isSignedIn) loadAccount()
  }, [isLoaded, isSignedIn, loadAccount])

  const handleDeleteAccount = async () => {
    if (confirmation !== 'DELETE' || !user?.deleteSelfEnabled || deleting) return
    setDeleting(true)
    setError('')
    try {
      const token = await getToken({ skipCache: true })
      if (!token) throw new Error('Your session has expired. Sign in again before deleting your account.')
      await deleteFarmerData(token)
      setDatabaseErased(true)
      await user.delete()
      navigate('/', { replace: true })
    } catch (deleteError) {
      setError(databaseErased
        ? 'Your AgriScan database records have been deleted, but Clerk could not finish deleting the sign-in account. Please contact support to complete account removal.'
        : (deleteError.message || 'Account deletion could not be completed. No account deletion was confirmed.'))
      setDeleting(false)
    }
  }

  if (!isLoaded) return <Loader />
  if (!isSignedIn || !user) return <Loader />

  const email = user.primaryEmailAddress?.emailAddress || profile?.email_address
  const phone = user.primaryPhoneNumber?.phoneNumber || profile?.phone
  const activeConsent = consents.find((item) => item.consent_type === 'personal_data_processing' && !item.withdrawn_at)

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.pageTop}>
          <div>
            <span className={styles.eyebrow}>YOUR DATA · AGRISCAN</span>
            <h1>My profile</h1>
            <p>Review the information associated with your AgriScan account and the records saved from your analyses.</p>
          </div>
          <Link to="/agriscan" className={styles.backLink}>← Back to AgriScan</Link>
        </div>

        {error && <div className={styles.error} role="alert">{error}</div>}

        {loading ? <div className={styles.loading}>Loading your account information…</div> : (
          <>
            <section className={styles.card}>
              <div className={styles.cardHeading}>
                <div><span className={styles.sectionLabel}>01 · ACCOUNT</span><h2>Personal information</h2></div>
                <span className={styles.status}>Your account</span>
              </div>
              <div className={styles.profileGrid}>
                <div className={styles.profileIdentity}>
                  <img className={styles.avatar} src={user.imageUrl} alt="" />
                  <div><strong>{user.fullName || user.username || 'AgriScan farmer'}</strong><span>{email || 'No primary email address'}</span></div>
                </div>
                <div className={styles.field}><span>First name</span><strong>{displayValue(profile?.first_name || user.firstName)}</strong></div>
                <div className={styles.field}><span>Last name</span><strong>{displayValue(profile?.last_name || user.lastName)}</strong></div>
                <div className={styles.field}><span>Username</span><strong>{displayValue(profile?.username || user.username)}</strong></div>
                <div className={styles.field}><span>Email address</span><strong>{displayValue(email)}</strong></div>
                <div className={styles.field}><span>Phone number</span><strong>{displayValue(phone)}</strong></div>
                <div className={styles.field}><span>Province</span><strong>{displayValue(profile?.province)}</strong></div>
                <div className={styles.field}><span>District</span><strong>{displayValue(profile?.district)}</strong></div>
                <div className={styles.field}><span>Preferred language</span><strong>{displayValue(profile?.preferred_language)}</strong></div>
                <div className={styles.field}><span>AgriScan profile created</span><strong>{formatDate(profile?.created_at)}</strong></div>
              </div>
              <p className={styles.helper}>Your sign-in details are managed securely by Clerk. This page displays the profile information currently shared with AgriScan.</p>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeading}>
                <div><span className={styles.sectionLabel}>02 · HISTORY</span><h2>My diagnosis records</h2></div>
                <span className={styles.count}>{diagnoses.length} records</span>
              </div>
              {diagnoses.length ? (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>Date</th><th>Crop</th><th>Finding</th><th>Confidence</th><th>Status</th></tr></thead>
                    <tbody>{diagnoses.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDate(item.created_at)}</td>
                        <td>{item.crop_type}</td>
                        <td>{item.disease_name || 'Not classified'}</td>
                        <td>{Number.isFinite(Number(item.confidence)) ? (Number(item.confidence) * 100).toFixed(1) + '%' : '—'}</td>
                        <td><span className={styles.recordStatus}>{String(item.status || 'unknown').replace('_', ' ')}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <p className={styles.empty}>No diagnosis records are currently associated with your account.</p>}
              <p className={styles.helper}>Uploaded photographs are processed in memory and are not retained in AgriScan storage. Diagnosis details are saved to your account.</p>
            </section>

            <section className={styles.card}>
              <div className={styles.cardHeading}>
                <div><span className={styles.sectionLabel}>03 · PRIVACY</span><h2>Consent and data use</h2></div>
                <span className={activeConsent ? styles.status : styles.neutralStatus}>{activeConsent ? 'Active consent' : 'No active consent'}</span>
              </div>
              {activeConsent ? (
                <div className={styles.consentRow}>
                  <div><strong>Personal-data processing</strong><span>Policy version {activeConsent.policy_version || '—'}</span></div>
                  <span>Granted {formatDate(activeConsent.granted_at)}</span>
                </div>
              ) : <p className={styles.empty}>There is no active personal-data processing consent recorded for this account.</p>}
              <p className={styles.helper}>You can stop using AgriScan at any time. Deleting your account removes your AgriScan farmer profile and associated diagnosis and consent records.</p>
            </section>

            <section className={styles.dangerCard}>
              <span className={styles.sectionLabel}>04 · YOUR DATA RIGHTS</span>
              <h2>Delete my account and data</h2>
              <p>This is permanent. AgriScan will delete your farmer profile, diagnosis history and consent records from its database. Your Clerk sign-in account will also be deleted, ending your active sessions. This action cannot be undone.</p>
              {!user.deleteSelfEnabled ? (
                <div className={styles.notice}>Self-service account deletion is not enabled for this Clerk account yet. The administrator must enable <strong>Allow users to delete their own accounts</strong> in the Clerk Dashboard before this action can be completed.</div>
              ) : !showDelete ? (
                <button className={styles.deleteButton} type="button" onClick={() => setShowDelete(true)}>Delete my account</button>
              ) : (
                <div className={styles.confirmBox}>
                  <label htmlFor="delete-confirm">Type <strong>DELETE</strong> to confirm permanent account removal.</label>
                  <input id="delete-confirm" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" />
                  <div className={styles.confirmActions}>
                    <button className={styles.cancelButton} type="button" onClick={() => { setShowDelete(false); setConfirmation('') }} disabled={deleting}>Cancel</button>
                    <button className={styles.deleteButton} type="button" onClick={handleDeleteAccount} disabled={confirmation !== 'DELETE' || deleting}>{deleting ? 'Deleting account…' : 'Permanently delete account'}</button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default ProfilePage
