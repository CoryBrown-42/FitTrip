// Fitbit Web API integration
// Uses OAuth 2.0 (Implicit Grant) for authentication and Fitbit REST API for data
// Docs: https://dev.fitbit.com/build/reference/web-api/

const FITBIT_CLIENT_ID = '23V34N' // User sets this from https://dev.fitbit.com/apps
const FITBIT_REDIRECT_URI = `${window.location.origin}/connections`
const FITBIT_API = 'https://api.fitbit.com'

const SCOPES = 'activity heartrate profile sleep weight'

let accessToken = null

export function isFitbitAvailable() {
    return !!FITBIT_CLIENT_ID
}

export function isFitbitConnected() {
    const token = localStorage.getItem('fitbit-access-token')
    return !!token
}

// Build the Fitbit OAuth authorization URL
function buildAuthUrl() {
    const params = new URLSearchParams({
        response_type: 'token',
        client_id: FITBIT_CLIENT_ID,
        redirect_uri: FITBIT_REDIRECT_URI,
        scope: SCOPES,
        expires_in: '31536000', // 1 year
    })
    return `https://www.fitbit.com/oauth2/authorize?${params.toString()}`
}

// Start the OAuth flow by redirecting to Fitbit
export function startFitbitAuth() {
    if (!FITBIT_CLIENT_ID) {
        throw new Error(
            'Fitbit Client ID not configured.\n' +
            '1. Go to https://dev.fitbit.com/apps and register an app\n' +
            '2. Set OAuth 2.0 Application Type to "Client"\n' +
            '3. Set Callback URL to ' + FITBIT_REDIRECT_URI + '\n' +
            '4. Copy the Client ID into src/services/fitbit.js'
        )
    }
    window.location.href = buildAuthUrl()
}

// Parse the access token from the URL hash after OAuth redirect
export function handleFitbitCallback() {
    const hash = window.location.hash
    if (!hash || !hash.includes('access_token')) return null

    const params = new URLSearchParams(hash.substring(1))
    const token = params.get('access_token')
    if (token) {
        accessToken = token
        localStorage.setItem('fitbit-access-token', token)
        // Clean the hash from the URL
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        return token
    }
    return null
}

// Load token from storage
export function loadFitbitToken() {
    const token = localStorage.getItem('fitbit-access-token')
    if (token) {
        accessToken = token
    }
    return token
}

// Disconnect — clear token
export function disconnectFitbit() {
    accessToken = null
    localStorage.removeItem('fitbit-access-token')
}

// Generic fetch helper
async function fetchFitbit(endpoint) {
    if (!accessToken) {
        loadFitbitToken()
    }
    if (!accessToken) throw new Error('Not authenticated with Fitbit')

    const res = await fetch(`${FITBIT_API}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (res.status === 401) {
        disconnectFitbit()
        throw new Error('Fitbit session expired. Please reconnect.')
    }
    if (!res.ok) {
        const body = await res.text()
        throw new Error(`Fitbit API error (${res.status}): ${body}`)
    }
    return res.json()
}

// --- Data fetching functions ---

export async function getProfile() {
    const data = await fetchFitbit('/1/user/-/profile.json')
    return data.user
}

export async function getSteps(days = 30) {
    const data = await fetchFitbit(`/1/user/-/activities/steps/date/today/${days}d.json`)
    return (data['activities-steps'] || []).map(d => ({
        date: d.dateTime,
        steps: parseInt(d.value) || 0,
    }))
}

export async function getCaloriesBurned(days = 30) {
    const data = await fetchFitbit(`/1/user/-/activities/calories/date/today/${days}d.json`)
    return (data['activities-calories'] || []).map(d => ({
        date: d.dateTime,
        calories: parseInt(d.value) || 0,
    }))
}

export async function getHeartRate(days = 30) {
    const data = await fetchFitbit(`/1/user/-/activities/heart/date/today/${days}d.json`)
    return (data['activities-heart'] || []).map(d => ({
        date: d.dateTime,
        restingHeartRate: d.value?.restingHeartRate || null,
        zones: d.value?.heartRateZones || [],
    }))
}

export async function getWeight(days = 30) {
    const today = new Date().toISOString().split('T')[0]
    const data = await fetchFitbit(`/1/user/-/body/log/weight/date/${today}/${days}d.json`)
    return (data.weight || []).map(d => ({
        date: d.date,
        weight: d.weight,
        bmi: d.bmi,
    }))
}

export async function getSleep(days = 30) {
    const today = new Date().toISOString().split('T')[0]
    const start = new Date()
    start.setDate(start.getDate() - days)
    const startStr = start.toISOString().split('T')[0]
    const data = await fetchFitbit(`/1.2/user/-/sleep/date/${startStr}/${today}.json`)
    return (data.sleep || []).map(d => ({
        date: d.dateOfSleep,
        duration: Math.round(d.duration / 60000), // minutes
        efficiency: d.efficiency,
        minutesAsleep: d.minutesAsleep,
        minutesAwake: d.minutesAwake,
    }))
}

// Fetch all Fitbit data in one call
export async function getAllFitbitData(days = 30) {
    const [steps, calories, heartRate, weight, sleep] = await Promise.all([
        getSteps(days).catch(() => []),
        getCaloriesBurned(days).catch(() => []),
        getHeartRate(days).catch(() => []),
        getWeight(days).catch(() => []),
        getSleep(days).catch(() => []),
    ])

    return { steps, calories, heartRate, weight, sleep }
}
