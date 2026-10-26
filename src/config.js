// false = login chhara jekeu dashboard/editor e dhukte parbe (shudhu blog likhar shomoy er jonno).
export const ADMIN_LOCK = true

// The one admin account (Firebase Auth > Email/Password). Its password is the secret code typed
// in the Dashboard popup, so the code itself never ships in the site's JavaScript.
// firestore.rules checks the same email.
export const ADMIN_EMAIL = 'admin@fxsadnan.com'

// ForexFactory calendar and expert outlook files, kept up to date by the GitHub Actions in .github/workflows.
export const FF_DATA_URL = 'https://raw.githubusercontent.com/fahimsadnan99/fxSadnan/ff-data'
