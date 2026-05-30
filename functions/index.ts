import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

const db = admin.firestore()

/**
 * Auto-suspend accounts when reportCount reaches 3.
 * Fires on every write to /reports/{reportId}.
 * Looks up the reported user and sets status to 'suspended' if reportCount >= 3.
 */
export const autoSuspendOnReport = functions.firestore
  .document('reports/{reportId}')
  .onCreate(async (snap) => {
    const reportData = snap.data()
    const reportedId: string = reportData?.reportedId

    if (!reportedId) {
      console.warn('autoSuspendOnReport: missing reportedId', snap.id)
      return null
    }

    const userRef = db.doc(`users/${reportedId}`)

    return db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef)
      if (!userSnap.exists) {
        console.warn(`autoSuspendOnReport: user ${reportedId} not found`)
        return
      }

      const userData = userSnap.data()!
      const currentCount: number = userData.reportCount || 0
      const newCount = currentCount + 1

      if (newCount >= 3 && userData.status !== 'suspended') {
        console.log(`autoSuspendOnReport: suspending user ${reportedId} (reportCount=${newCount})`)
        tx.update(userRef, {
          reportCount: newCount,
          status: 'suspended',
          suspendedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      } else {
        tx.update(userRef, { reportCount: newCount })
      }
    })
  })

/**
 * Also listen directly to users/{uid} reportCount field updates
 * as a safety net — if reportCount is manually incremented and reaches 3.
 */
export const suspendOnReportCountThreshold = functions.firestore
  .document('users/{uid}')
  .onUpdate(async (change) => {
    const before = change.before.data()
    const after = change.after.data()

    if (after.reportCount === before.reportCount) return null
    if (after.status === 'suspended') return null
    if (after.reportCount < 3) return null

    console.log(`suspendOnReportCountThreshold: suspending user ${change.after.id} (reportCount=${after.reportCount})`)

    return change.after.ref.update({
      status: 'suspended',
      suspendedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  })
