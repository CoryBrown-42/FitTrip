// Fitbit Web API integration
// Uses OAuth 2.0 (Implicit Grant) for authentication and Fitbit REST API for data
// Docs: https://dev.fitbit.com/build/reference/web-api/

import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import { App } from '@capacitor/app'

const FITBIT_CLIENT_ID = '23V34N' // User sets this from https://dev.fitbit.com/apps
const FITBIT_API = 'https://api.fitbit.com'
const SCOPES = 'activity heartrate profile sleep weight'

// On native, use a custom URL scheme redirect; on web, use the current origin
function getRedirectUri() {
    if (Capacitor.isNativePlatform()) {
        return 'com.fittrip.app://connections'
    }
    return `${window.location.origin}/connections`
}

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
        redirect_uri: getRedirectUri(),
        scope: SCOPES,
        expires_in: '31536000', // 1 year
    })
    return `https://www.fitbit.com/oauth2/authorize?${params.toString()}`
}

// Start the OAuth flow
// On native: opens system browser and listens for deep link callback
// On web: redirects in the same window
export async function startFitbitAuth() {
    if (!FITBIT_CLIENT_ID) {
        throw new Error(
            'Fitbit Client ID not configured.\n' +
            '1. Go to https://dev.fitbit.com/apps and register an app\n' +
            '2. Set OAuth 2.0 Application Type to "Client"\n' +
            '3. Set Callback URL to ' + getRedirectUri() + '\n' +
            '4. Copy the Client ID into src/services/fitbit.js'
        )
    }

    if (Capacitor.isNativePlatform()) {
        await Browser.open({ url: buildAuthUrl() })
    } else {
        window.location.href = buildAuthUrl()
    }
}

// Listen for deep link OAuth callback on native platforms
// Call this once at app startup
let deepLinkListenerRegistered = false
export function registerNativeAuthListener(onToken) {
    if (!Capacitor.isNativePlatform() || deepLinkListenerRegistered) return
    deepLinkListenerRegistered = true

    App.addListener('appUrlOpen', async ({ url }) => {
        // URL looks like: com.fittrip.app://connections#access_token=...
        if (url && url.includes('access_token')) {
            const hashPart = url.split('#')[1]
            if (hashPart) {
                const params = new URLSearchParams(hashPart)
                const token = params.get('access_token')
                if (token) {
                    accessToken = token
                    localStorage.setItem('fitbit-access-token', token)
                    await Browser.close()
                    if (onToken) onToken(token)
                }
            }
        }
    })
}

// Parse the access token from the URL hash after OAuth redirect (web only)
export function handleFitbitCallback() {
    if (Capacitor.isNativePlatform()) return null

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
// Map Fitbit activity names to app workout types and muscle groups
export const FITBIT_TYPE_MAP = {
    'Walk': { type: 'Walking', muscleGroup: 'Full Body' },
    'Run': { type: 'Running', muscleGroup: 'Legs' },
    'Bike': { type: 'Cycling', muscleGroup: 'Legs' },
    'Swim': { type: 'Swimming', muscleGroup: 'Full Body' },
    'Yoga': { type: 'Yoga', muscleGroup: 'Core' },
    'Strength Training': { type: 'Strength', muscleGroup: 'Full Body' },
    'HIIT': { type: 'HIIT', muscleGroup: 'Full Body' },
    'Cardio': { type: 'Cardio', muscleGroup: 'Full Body' },
    'Rowing': { type: 'Cardio', muscleGroup: 'Back' },
    'Boxing': { type: 'Boxing', muscleGroup: 'Arms' },
    'Other': { type: 'Other', muscleGroup: 'Full Body' },
}

// Convert Fitbit activity to app workout format
export function mapFitbitActivityToWorkout(activity) {
    const mapping = FITBIT_TYPE_MAP[activity.activityName] || FITBIT_TYPE_MAP['Other']
    return {
        name: activity.activityName,
        type: mapping.type,
        muscleGroup: mapping.muscleGroup,
        duration: Math.round(activity.duration / 60000),
        calories: activity.calories,
        date: activity.startTime.split('T')[0],
        notes: activity.description || '',
        exercises: [],
        source: 'fitbit',
        fitbitLogId: activity.logId,
    }
}

// Fetch Fitbit activities (exercise logs)
export async function getActivities(days = 30) {
    const afterDate = new Date()
    afterDate.setDate(afterDate.getDate() - days)
    const afterStr = afterDate.toISOString().split('T')[0]
    const data = await fetchFitbit(`/1/user/-/activities/list.json?afterDate=${afterStr}&sort=asc&limit=100&offset=0`)
    return (data.activities || []).map(mapFitbitActivityToWorkout)
}

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
    const [steps, calories, heartRate, weight, sleep, activities] = await Promise.all([
        getSteps(days).catch(() => []),
        getCaloriesBurned(days).catch(() => []),
        getHeartRate(days).catch(() => []),
        getWeight(days).catch(() => []),
        getSleep(days).catch(() => []),
        getActivities(days).catch(() => []),
    ])
    return { steps, calories, heartRate, weight, sleep, activities }
}
