import { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
    User, Save, Dumbbell, Target, Settings,
    Check, ChevronRight
} from 'lucide-react'

export default function Profile() {
    const { state, dispatch } = useApp()
    const [form, setForm] = useState({ ...state.profile })
    const [saved, setSaved] = useState(false)

    function handleSave(e) {
        e.preventDefault()
        dispatch({ type: 'UPDATE_PROFILE', payload: form })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    function clearAllData() {
        if (confirm('Are you sure you want to clear ALL data? This includes workouts, goals, and connections. This cannot be undone!')) {
            localStorage.removeItem('fittrip-state')
            window.location.reload()
        }
    }

    // Stats overview
    const { stats } = state

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Profile</h1>
                <p className="text-dark-400 text-sm mt-1">Manage your profile and app settings</p>
            </div>

            {/* Profile form */}
            <form onSubmit={handleSave} className="glass-card p-6 space-y-5">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-brand-500/15 flex items-center justify-center">
                        <User className="w-8 h-8 text-brand-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                        <p className="text-sm text-dark-400">Help the AI coach personalize your experience</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-sm text-dark-300 mb-1.5">Display Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-dark-300 mb-1.5">Weight (lbs)</label>
                        <input
                            type="number"
                            value={form.weight || ''}
                            onChange={e => setForm(f => ({ ...f, weight: parseFloat(e.target.value) || null }))}
                            placeholder="e.g., 170"
                            className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-dark-300 mb-1.5">Height (inches)</label>
                        <input
                            type="number"
                            value={form.height || ''}
                            onChange={e => setForm(f => ({ ...f, height: parseFloat(e.target.value) || null }))}
                            placeholder="e.g., 70"
                            className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-dark-300 mb-1.5">Age</label>
                        <input
                            type="number"
                            value={form.age || ''}
                            onChange={e => setForm(f => ({ ...f, age: parseInt(e.target.value) || null }))}
                            placeholder="e.g., 28"
                            className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-dark-300 mb-1.5">Weekly Workout Target</label>
                        <input
                            type="number"
                            value={form.weeklyTarget}
                            onChange={e => setForm(f => ({ ...f, weeklyTarget: parseInt(e.target.value) || 1 }))}
                            min="1"
                            max="14"
                            className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                    {saved ? (
                        <>
                            <Check className="w-4 h-4" /> Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" /> Save Profile
                        </>
                    )}
                </button>
            </form>

            {/* Stats overview */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-brand-400" />
                    Your Stats
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-xl bg-dark-800/50">
                        <p className="text-2xl font-bold text-white">{stats.totalWorkouts}</p>
                        <p className="text-xs text-dark-400 mt-1">Total Workouts</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-dark-800/50">
                        <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
                        <p className="text-xs text-dark-400 mt-1">Day Streak</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-dark-800/50">
                        <p className="text-2xl font-bold text-white">{stats.caloriesBurned.toLocaleString()}</p>
                        <p className="text-xs text-dark-400 mt-1">Calories Burned</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-dark-800/50">
                        <p className="text-2xl font-bold text-white">{Math.round(stats.minutesExercised / 60)}</p>
                        <p className="text-xs text-dark-400 mt-1">Hours Active</p>
                    </div>
                </div>
            </div>

            {/* Data summary */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-brand-400" />
                    Data & Storage
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
                        <div>
                            <p className="text-sm text-white">Workouts logged</p>
                            <p className="text-xs text-dark-500">Stored locally in your browser</p>
                        </div>
                        <span className="text-sm font-medium text-brand-400">{state.workouts.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
                        <div>
                            <p className="text-sm text-white">Goals created</p>
                            <p className="text-xs text-dark-500">{state.goals.filter(g => g.completed).length} completed</p>
                        </div>
                        <span className="text-sm font-medium text-brand-400">{state.goals.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
                        <div>
                            <p className="text-sm text-white">Google Fit</p>
                        </div>
                        <span className={`text-sm font-medium ${state.googleFit.connected ? 'text-emerald-400' : 'text-dark-500'}`}>
                            {state.googleFit.connected ? 'Connected' : 'Not connected'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
                        <div>
                            <p className="text-sm text-white">Renpho Data</p>
                        </div>
                        <span className={`text-sm font-medium ${state.renpho.connected ? 'text-emerald-400' : 'text-dark-500'}`}>
                            {state.renpho.connected ? `${state.renpho.data?.length || 0} records` : 'No data'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Danger zone */}
            <div className="glass-card p-6 border-red-500/20">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-dark-400 mb-4">
                    This will permanently delete all your workouts, goals, and connected data.
                </p>
                <button
                    onClick={clearAllData}
                    className="px-5 py-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-xl text-sm font-medium transition-colors"
                >
                    Clear All Data
                </button>
            </div>
        </div>
    )
}
