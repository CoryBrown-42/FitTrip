import { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext(null)

const initialState = {
    workouts: [],
    goals: [],
    profile: {
        name: 'Fitness Enthusiast',
        weight: null,
        height: null,
        age: null,
        weeklyTarget: 4,
    },
    googleFit: {
        connected: false,
        data: null,
    },
    fitbit: {
        connected: false,
        data: null,
    },
    renpho: {
        connected: false,
        data: null,
    },
    stats: {
        totalWorkouts: 0,
        currentStreak: 0,
        caloriesBurned: 0,
        minutesExercised: 0,
    }
}

function loadState() {
    try {
        const saved = localStorage.getItem('fittrip-state')
        if (saved) {
            return { ...initialState, ...JSON.parse(saved) }
        }
    } catch (e) {
        console.error('Failed to load state:', e)
    }
    return initialState
}

function calculateStats(workouts) {
    const totalWorkouts = workouts.length
    const caloriesBurned = workouts.reduce((sum, w) => sum + (w.calories || 0), 0)
    const minutesExercised = workouts.reduce((sum, w) => sum + (w.duration || 0), 0)

    // Calculate streak
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const workoutDates = [...new Set(workouts.map(w => {
        const d = new Date(w.date)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
    }))].sort((a, b) => b - a)

    if (workoutDates.length > 0) {
        const msPerDay = 86400000
        let checkDate = today.getTime()
        // Allow today or yesterday as start
        if (workoutDates[0] === checkDate || workoutDates[0] === checkDate - msPerDay) {
            checkDate = workoutDates[0]
            for (const date of workoutDates) {
                if (date === checkDate) {
                    currentStreak++
                    checkDate -= msPerDay
                } else if (date < checkDate) {
                    break
                }
            }
        }
    }

    return { totalWorkouts, currentStreak, caloriesBurned, minutesExercised }
}

function reducer(state, action) {
    switch (action.type) {
        case 'ADD_WORKOUT': {
            const workouts = [...state.workouts, { ...action.payload, id: Date.now() }]
            return { ...state, workouts, stats: calculateStats(workouts) }
        }
        case 'DELETE_WORKOUT': {
            const workouts = state.workouts.filter(w => w.id !== action.payload)
            return { ...state, workouts, stats: calculateStats(workouts) }
        }
        case 'ADD_GOAL': {
            const goals = [...state.goals, { ...action.payload, id: Date.now(), createdAt: new Date().toISOString() }]
            return { ...state, goals }
        }
        case 'UPDATE_GOAL': {
            const goals = state.goals.map(g => g.id === action.payload.id ? { ...g, ...action.payload } : g)
            return { ...state, goals }
        }
        case 'DELETE_GOAL': {
            const goals = state.goals.filter(g => g.id !== action.payload)
            return { ...state, goals }
        }
        case 'UPDATE_PROFILE': {
            return { ...state, profile: { ...state.profile, ...action.payload } }
        }
        case 'SET_GOOGLE_FIT_DATA': {
            return { ...state, googleFit: { connected: true, data: action.payload } }
        }
        case 'DISCONNECT_GOOGLE_FIT': {
            return { ...state, googleFit: { connected: false, data: null } }
        }
        case 'SET_FITBIT_DATA': {
            return { ...state, fitbit: { connected: true, data: action.payload } }
        }
        case 'DISCONNECT_FITBIT': {
            return { ...state, fitbit: { connected: false, data: null } }
        }
        case 'SET_RENPHO_DATA': {
            return { ...state, renpho: { connected: true, data: action.payload } }
        }
        case 'IMPORT_RENPHO_CSV': {
            return { ...state, renpho: { connected: true, data: action.payload } }
        }
        default:
            return state
    }
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, null, loadState)

    // Stats are recalculated below via calculateStats(state.workouts)

    // Persist state
    useEffect(() => {
        const toSave = { ...state }
        localStorage.setItem('fittrip-state', JSON.stringify(toSave))
    }, [state])

    // Recalculate stats from loaded workouts
    const stats = calculateStats(state.workouts)

    return (
        <AppContext.Provider value={{ state: { ...state, stats }, dispatch }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const ctx = useContext(AppContext)
    if (!ctx) throw new Error('useApp must be inside AppProvider')
    return ctx
}
