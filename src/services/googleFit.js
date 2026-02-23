// Google Fit REST API integration
// Uses OAuth 2.0 for authentication and Google Fitness REST API for data

const GOOGLE_FIT_API = 'https://www.googleapis.com/fitness/v1/users/me'

// You'll need to set up a Google Cloud project and enable the Fitness API
// Then create OAuth 2.0 credentials (Web application type)
// Add http://localhost:3000 as an authorized redirect URI
const GOOGLE_CLIENT_ID = '909037773010-fcd70bkpef25ds3kbaiq738uom023rck.apps.googleusercontent.com'

const SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.sleep.read',
    'https://www.googleapis.com/auth/fitness.nutrition.read',
].join(' ')

let tokenClient = null
let accessToken = null

export function isGoogleFitAvailable() {
    return !!GOOGLE_CLIENT_ID
}

export function initGoogleFit() {
    return new Promise((resolve, reject) => {
        if (!GOOGLE_CLIENT_ID) {
            reject(new Error('Google Client ID not configured. Set up OAuth credentials in Google Cloud Console.'))
            return
        }

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.onload = () => {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: SCOPES,
                callback: (response) => {
                    if (response.error) {
                        reject(response)
                        return
                    }
                    accessToken = response.access_token
                    resolve(response)
                },
            })
            resolve(tokenClient)
        }
        script.onerror = reject
        document.head.appendChild(script)
    })
}

export function requestGoogleFitAccess() {
    return new Promise((resolve, reject) => {
        if (!tokenClient) {
            reject(new Error('Google Fit not initialized'))
            return
        }
        tokenClient.callback = (response) => {
            if (response.error) {
                reject(response)
                return
            }
            accessToken = response.access_token
            resolve(response)
        }
        tokenClient.requestAccessToken()
    })
}

async function fetchFitData(endpoint, body = null) {
    if (!accessToken) throw new Error('Not authenticated')

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    }

    if (body) {
        options.method = 'POST'
        options.body = JSON.stringify(body)
    }

    const res = await fetch(`${GOOGLE_FIT_API}${endpoint}`, options)
    if (!res.ok) throw new Error(`Google Fit API error: ${res.status}`)
    return res.json()
}

export async function getStepsData(startTime, endTime) {
    const body = {
        aggregateBy: [{
            dataTypeName: 'com.google.step_count.delta',
            dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
        }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startTime,
        endTimeMillis: endTime,
    }
    return fetchFitData('/dataset:aggregate', body)
}

export async function getCaloriesData(startTime, endTime) {
    const body = {
        aggregateBy: [{
            dataTypeName: 'com.google.calories.expended',
            dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'
        }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startTime,
        endTimeMillis: endTime,
    }
    return fetchFitData('/dataset:aggregate', body)
}

export async function getHeartRateData(startTime, endTime) {
    const body = {
        aggregateBy: [{
            dataTypeName: 'com.google.heart_rate.bpm',
        }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startTime,
        endTimeMillis: endTime,
    }
    return fetchFitData('/dataset:aggregate', body)
}

export async function getWeightData(startTime, endTime) {
    const body = {
        aggregateBy: [{
            dataTypeName: 'com.google.weight',
        }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startTime,
        endTimeMillis: endTime,
    }
    return fetchFitData('/dataset:aggregate', body)
}

export async function getSleepData(startTime, endTime) {
    const body = {
        aggregateBy: [{
            dataTypeName: 'com.google.sleep.segment',
        }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startTime,
        endTimeMillis: endTime,
    }
    return fetchFitData('/dataset:aggregate', body)
}

export async function getAllFitData(days = 7) {
    const endTime = Date.now()
    const startTime = endTime - (days * 86400000)

    try {
        const [steps, calories, heartRate, weight] = await Promise.allSettled([
            getStepsData(startTime, endTime),
            getCaloriesData(startTime, endTime),
            getHeartRateData(startTime, endTime),
            getWeightData(startTime, endTime),
        ])

        return {
            steps: steps.status === 'fulfilled' ? steps.value : null,
            calories: calories.status === 'fulfilled' ? calories.value : null,
            heartRate: heartRate.status === 'fulfilled' ? heartRate.value : null,
            weight: weight.status === 'fulfilled' ? weight.value : null,
        }
    } catch (error) {
        console.error('Error fetching Google Fit data:', error)
        throw error
    }
}

// Parse Google Fit aggregate response into simple arrays
export function parseFitBuckets(data, valueExtractor) {
    if (!data?.bucket) return []
    return data.bucket.map(bucket => {
        const date = new Date(parseInt(bucket.startTimeMillis))
        const dataset = bucket.dataset?.[0]
        const point = dataset?.point?.[0]
        const value = point ? valueExtractor(point) : 0
        return { date: date.toISOString().split('T')[0], value }
    })
}

export function parseSteps(data) {
    return parseFitBuckets(data, point => point.value?.[0]?.intVal || 0)
}

export function parseCalories(data) {
    return parseFitBuckets(data, point => Math.round(point.value?.[0]?.fpVal || 0))
}

export function parseWeight(data) {
    return parseFitBuckets(data, point => point.value?.[0]?.fpVal || 0).filter(d => d.value > 0)
}

export function parseHeartRate(data) {
    return parseFitBuckets(data, point => Math.round(point.value?.[0]?.fpVal || 0)).filter(d => d.value > 0)
}
