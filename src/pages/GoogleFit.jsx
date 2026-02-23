import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import {
    Link2, ExternalLink, Upload, FileSpreadsheet,
    Check, X, RefreshCw, Activity, Scale, Heart,
    Footprints, Moon, Info, AlertCircle, Download
} from 'lucide-react'
import {
    isFitbitAvailable, startFitbitAuth, handleFitbitCallback,
    loadFitbitToken, disconnectFitbit, getAllFitbitData,
    registerNativeAuthListener
} from '../services/fitbit'
import { parseRenphoCSV, getRenphoSummary, generateSampleRenphoData } from '../services/renpho'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts'

export default function GoogleFit() {
    const { state, dispatch } = useApp()
    const [loadingFitbit, setLoadingFitbit] = useState(false)
    const [loadingRenpho, setLoadingRenpho] = useState(false)
    const [error, setError] = useState(null)
    const fileInputRef = useRef(null)

    const { fitbit, renpho } = state
    const renphoSummary = renpho?.data ? getRenphoSummary(renpho.data) : null

    // Check for Fitbit OAuth callback on mount
    useEffect(() => {
        // Web: check URL hash for token
        const token = handleFitbitCallback()
        if (token) {
            fetchFitbitData()
        }

        // Native: listen for deep link callback from system browser
        registerNativeAuthListener((nativeToken) => {
            if (nativeToken) {
                fetchFitbitData()
            }
        })
    }, [])

    // Fitbit connection
    async function connectFitbit() {
        setError(null)
        try {
            startFitbitAuth()
        } catch (err) {
            setError(err.message || 'Failed to start Fitbit connection')
        }
    }

    async function fetchFitbitData() {
        setLoadingFitbit(true)
        setError(null)
        try {
            const data = await getAllFitbitData(30)
            dispatch({ type: 'SET_FITBIT_DATA', payload: data })
            if (data.activities && data.activities.length > 0) {
                dispatch({ type: 'IMPORT_FITBIT_ACTIVITIES', payload: data.activities })
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch Fitbit data')
        } finally {
            setLoadingFitbit(false)
        }
    }

    function handleDisconnectFitbit() {
        disconnectFitbit()
        dispatch({ type: 'DISCONNECT_FITBIT' })
    }

    // Renpho CSV import
    function handleRenphoFile(e) {
        const file = e.target.files?.[0]
        if (!file) return

        setLoadingRenpho(true)
        setError(null)

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const csv = event.target.result
                const data = parseRenphoCSV(csv)
                if (data.length === 0) {
                    setError('No valid data found in CSV. Make sure it\'s a Renpho export file.')
                    return
                }
                dispatch({ type: 'IMPORT_RENPHO_CSV', payload: data })
            } catch (err) {
                setError('Failed to parse CSV: ' + err.message)
            } finally {
                setLoadingRenpho(false)
            }
        }
        reader.onerror = () => {
            setError('Failed to read file')
            setLoadingRenpho(false)
        }
        reader.readAsText(file)
    }

    function loadSampleRenpho() {
        const data = generateSampleRenphoData()
        dispatch({ type: 'IMPORT_RENPHO_CSV', payload: data })
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Connections</h1>
                <p className="text-dark-400 text-sm mt-1">Connect your fitness devices and import health data</p>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-300">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="whitespace-pre-line">{error}</div>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="mt-2 text-xs text-red-400 hover:text-red-200"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Connection cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fitbit */}
                <div className="glass-card p-6">
                    <div className="flex items-start gap-4 mb-5">
                        <div className="w-12 h-12 rounded-xl bg-teal-500/15 flex items-center justify-center shrink-0">
                            <Activity className="w-6 h-6 text-teal-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">Fitbit</h3>
                            <p className="text-sm text-dark-400 mt-0.5">
                                Sync steps, calories, heart rate, sleep & weight
                            </p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${fitbit.connected
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-dark-700 text-dark-400'
                            }`}>
                            {fitbit.connected ? 'Connected' : 'Disconnected'}
                        </div>
                    </div>

                    <div className="space-y-3 text-sm text-dark-400 mb-5">
                        <div className="flex items-center gap-2">
                            <Footprints className="w-4 h-4" /> Daily steps & distance
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4" /> Heart rate tracking
                        </div>
                        <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4" /> Weight history
                        </div>
                        <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4" /> Sleep data
                        </div>
                    </div>

                    {fitbit.connected ? (
                        <div className="space-y-3">
                            <button
                                onClick={fetchFitbitData}
                                disabled={loadingFitbit}
                                className="w-full py-2.5 bg-dark-800 hover:bg-dark-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${loadingFitbit ? 'animate-spin' : ''}`} />
                                Refresh Data
                            </button>
                            <button
                                onClick={handleDisconnectFitbit}
                                className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-colors"
                            >
                                Disconnect
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <button
                                onClick={connectFitbit}
                                className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <Link2 className="w-4 h-4" />
                                Connect Fitbit
                            </button>
                            {!isFitbitAvailable() && (
                                <div className="flex items-start gap-2 text-xs text-dark-500">
                                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>Requires a Fitbit Developer App. Register at dev.fitbit.com, then add your Client ID to src/services/fitbit.js.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Renpho */}
                <div className="glass-card p-6">
                    <div className="flex items-start gap-4 mb-5">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
                            <Scale className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">Renpho Scale</h3>
                            <p className="text-sm text-dark-400 mt-0.5">
                                Import body composition data from CSV export
                            </p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${renpho.connected
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-dark-700 text-dark-400'
                            }`}>
                            {renpho.connected ? `${renpho.data?.length || 0} records` : 'No data'}
                        </div>
                    </div>

                    <div className="space-y-3 text-sm text-dark-400 mb-5">
                        <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4" /> Weight tracking
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Body fat percentage
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4" /> Muscle mass & BMI
                        </div>
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4" /> Full body composition metrics
                        </div>
                    </div>

                    <div className="space-y-3">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleRenphoFile}
                            ref={fileInputRef}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loadingRenpho}
                            className="w-full py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {loadingRenpho ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4" />
                            )}
                            Import Renpho CSV
                        </button>
                        <button
                            onClick={loadSampleRenpho}
                            className="w-full py-2.5 bg-dark-800 hover:bg-dark-700 text-dark-300 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Load Sample Data
                        </button>
                        <div className="flex items-start gap-2 text-xs text-dark-500">
                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>Open the Renpho app → Profile → Export Data → Save as CSV, then import here.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Renpho data visualization */}
            {renpho.connected && renpho.data?.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">Body Composition Trends</h2>

                    {/* Summary cards */}
                    {renphoSummary && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                {
                                    label: 'Current Weight',
                                    value: `${renphoSummary.latest.weight} lb`,
                                    change: renphoSummary.weightChange,
                                },
                                {
                                    label: 'Body Fat',
                                    value: `${renphoSummary.latest.bodyFat || '—'}%`,
                                    change: renphoSummary.bodyFatChange,
                                },
                                {
                                    label: 'Muscle Mass',
                                    value: `${renphoSummary.latest.muscleMass || '—'} lb`,
                                },
                                {
                                    label: 'BMR',
                                    value: `${renphoSummary.latest.bmr || '—'} cal`,
                                },
                            ].map((item, i) => (
                                <div key={i} className="glass-card p-4">
                                    <p className="text-xs text-dark-400 mb-1">{item.label}</p>
                                    <p className="text-xl font-bold text-white">{item.value}</p>
                                    {item.change && (
                                        <p className={`text-xs mt-1 ${parseFloat(item.change) < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {parseFloat(item.change) > 0 ? '+' : ''}{item.change}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Weight chart */}
                    <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold text-white mb-4">Weight Trend</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={renpho.data.filter(d => d.weight)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: 12,
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    dot={{ fill: '#22c55e', r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Body fat chart */}
                    {renpho.data.some(d => d.bodyFat) && (
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold text-white mb-4">Body Fat % Trend</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={renpho.data.filter(d => d.bodyFat)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                                    <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #334155',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontSize: 12,
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="bodyFat"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        dot={{ fill: '#8b5cf6', r: 3 }}
                                        name="Body Fat %"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="muscleMass"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ fill: '#3b82f6', r: 3 }}
                                        name="Muscle Mass"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Detailed data table */}
                    <div className="glass-card p-5 overflow-x-auto">
                        <h3 className="text-sm font-semibold text-white mb-4">Measurement History</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-dark-400 border-b border-dark-700">
                                    <th className="text-left py-2 pr-4">Date</th>
                                    <th className="text-right py-2 px-3">Weight</th>
                                    <th className="text-right py-2 px-3">Body Fat</th>
                                    <th className="text-right py-2 px-3">Muscle</th>
                                    <th className="text-right py-2 px-3">BMI</th>
                                    <th className="text-right py-2 px-3">BMR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...renpho.data].reverse().slice(0, 15).map((record, i) => (
                                    <tr key={i} className="border-b border-dark-800/50 text-dark-200">
                                        <td className="py-2 pr-4">{record.date}</td>
                                        <td className="text-right py-2 px-3">{record.weight || '—'}</td>
                                        <td className="text-right py-2 px-3">{record.bodyFat ? `${record.bodyFat}%` : '—'}</td>
                                        <td className="text-right py-2 px-3">{record.muscleMass || '—'}</td>
                                        <td className="text-right py-2 px-3">{record.bmi || '—'}</td>
                                        <td className="text-right py-2 px-3">{record.bmr || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Fitbit data visualization */}
            {fitbit.connected && fitbit.data && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">Fitbit Activity Data</h2>

                    {/* Summary cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            {
                                label: 'Today\'s Steps',
                                value: fitbit.data.steps?.length > 0
                                    ? fitbit.data.steps[fitbit.data.steps.length - 1].steps.toLocaleString()
                                    : '—',
                            },
                            {
                                label: 'Today\'s Calories',
                                value: fitbit.data.calories?.length > 0
                                    ? fitbit.data.calories[fitbit.data.calories.length - 1].calories.toLocaleString()
                                    : '—',
                            },
                            {
                                label: 'Resting HR',
                                value: fitbit.data.heartRate?.length > 0
                                    ? (fitbit.data.heartRate.filter(h => h.restingHeartRate).pop()?.restingHeartRate || '—') + ' bpm'
                                    : '—',
                            },
                            {
                                label: 'Last Sleep',
                                value: fitbit.data.sleep?.length > 0
                                    ? `${Math.round(fitbit.data.sleep[fitbit.data.sleep.length - 1].minutesAsleep / 60 * 10) / 10} hrs`
                                    : '—',
                            },
                        ].map((item, i) => (
                            <div key={i} className="glass-card p-4">
                                <p className="text-xs text-dark-400 mb-1">{item.label}</p>
                                <p className="text-xl font-bold text-white">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Steps chart */}
                    {fitbit.data.steps?.length > 0 && (
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold text-white mb-4">Steps (Last 30 Days)</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={fitbit.data.steps}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                                    <YAxis stroke="#64748b" fontSize={11} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #334155',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontSize: 12,
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="steps"
                                        stroke="#14b8a6"
                                        strokeWidth={2}
                                        dot={{ fill: '#14b8a6', r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Heart rate chart */}
                    {fitbit.data.heartRate?.some(h => h.restingHeartRate) && (
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold text-white mb-4">Resting Heart Rate</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={fitbit.data.heartRate.filter(h => h.restingHeartRate)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                                    <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #334155',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontSize: 12,
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="restingHeartRate"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        dot={{ fill: '#ef4444', r: 3 }}
                                        name="Resting HR"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
