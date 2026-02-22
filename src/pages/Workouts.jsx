import { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
    Dumbbell, Plus, Trash2, Calendar, Clock, Flame,
    Search, Filter, ChevronDown, X
} from 'lucide-react'
import { format } from 'date-fns'

const WORKOUT_TYPES = [
    'Strength', 'Cardio', 'HIIT', 'Yoga', 'Stretching',
    'Running', 'Cycling', 'Swimming', 'Walking', 'CrossFit',
    'Pilates', 'Boxing', 'Dance', 'Sports', 'Other'
]

const MUSCLE_GROUPS = [
    'Full Body', 'Upper Body', 'Lower Body', 'Core', 'Back',
    'Chest', 'Shoulders', 'Arms', 'Legs', 'Glutes'
]

const EMPTY_WORKOUT = {
    name: '',
    type: 'Strength',
    muscleGroup: 'Full Body',
    duration: 30,
    calories: 200,
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    exercises: [],
}

const EMPTY_EXERCISE = {
    name: '',
    sets: 3,
    reps: 10,
    weight: 0,
    unit: 'lbs',
}

export default function Workouts() {
    const { state, dispatch } = useApp()
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ ...EMPTY_WORKOUT })
    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    const filteredWorkouts = [...state.workouts]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .filter(w => {
            const matchSearch = !search || w.name.toLowerCase().includes(search.toLowerCase())
            const matchType = !filterType || w.type === filterType
            return matchSearch && matchType
        })

    function addExercise() {
        setForm(f => ({ ...f, exercises: [...f.exercises, { ...EMPTY_EXERCISE }] }))
    }

    function updateExercise(index, field, value) {
        setForm(f => ({
            ...f,
            exercises: f.exercises.map((e, i) => i === index ? { ...e, [field]: value } : e)
        }))
    }

    function removeExercise(index) {
        setForm(f => ({ ...f, exercises: f.exercises.filter((_, i) => i !== index) }))
    }

    function handleSubmit(e) {
        e.preventDefault()
        if (!form.name.trim()) return
        dispatch({ type: 'ADD_WORKOUT', payload: form })
        setForm({ ...EMPTY_WORKOUT })
        setShowForm(false)
    }

    function deleteWorkout(id) {
        if (confirm('Delete this workout?')) {
            dispatch({ type: 'DELETE_WORKOUT', payload: id })
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Workouts</h1>
                    <p className="text-dark-400 text-sm mt-1">Track and log your training sessions</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 self-start"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Cancel' : 'Log Workout'}
                </button>
            </div>

            {/* Add workout form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5 glow-border">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-brand-400" />
                        New Workout
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">Workout Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g., Morning Push Day"
                                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">Workout Type</label>
                            <select
                                value={form.type}
                                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                            >
                                {WORKOUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">Muscle Group</label>
                            <select
                                value={form.muscleGroup}
                                onChange={e => setForm(f => ({ ...f, muscleGroup: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors appearance-none"
                            >
                                {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">Duration (minutes)</label>
                            <input
                                type="number"
                                value={form.duration}
                                onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 0 }))}
                                min="1"
                                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">Calories Burned</label>
                            <input
                                type="number"
                                value={form.calories}
                                onChange={e => setForm(f => ({ ...f, calories: parseInt(e.target.value) || 0 }))}
                                min="0"
                                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Exercises */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm text-dark-300">Exercises (optional)</label>
                            <button
                                type="button"
                                onClick={addExercise}
                                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add Exercise
                            </button>
                        </div>
                        {form.exercises.map((ex, i) => (
                            <div key={i} className="flex flex-wrap gap-2 mb-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Exercise name"
                                    value={ex.name}
                                    onChange={e => updateExercise(i, 'name', e.target.value)}
                                    className="flex-1 min-w-[150px] px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Sets"
                                    value={ex.sets}
                                    onChange={e => updateExercise(i, 'sets', parseInt(e.target.value) || 0)}
                                    className="w-16 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
                                    min="0"
                                />
                                <span className="text-dark-500 text-xs">×</span>
                                <input
                                    type="number"
                                    placeholder="Reps"
                                    value={ex.reps}
                                    onChange={e => updateExercise(i, 'reps', parseInt(e.target.value) || 0)}
                                    className="w-16 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
                                    min="0"
                                />
                                <input
                                    type="number"
                                    placeholder="Weight"
                                    value={ex.weight}
                                    onChange={e => updateExercise(i, 'weight', parseFloat(e.target.value) || 0)}
                                    className="w-20 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
                                    min="0"
                                />
                                <select
                                    value={ex.unit}
                                    onChange={e => updateExercise(i, 'unit', e.target.value)}
                                    className="px-2 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500 appearance-none"
                                >
                                    <option value="lbs">lbs</option>
                                    <option value="kg">kg</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => removeExercise(i)}
                                    className="p-2 text-dark-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm text-dark-300 mb-1.5">Notes</label>
                        <textarea
                            value={form.notes}
                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            placeholder="How did the workout feel? Any PRs?"
                            rows={2}
                            className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-colors"
                    >
                        Save Workout
                    </button>
                </form>
            )}

            {/* Search & filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search workouts..."
                        className="w-full pl-10 pr-4 py-2.5 bg-dark-800/60 border border-dark-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500/50 transition-colors"
                    />
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-2.5 bg-dark-800/60 border border-dark-700 rounded-xl text-sm text-dark-300 hover:text-white flex items-center gap-2 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        {filterType || 'All Types'}
                        <ChevronDown className="w-3 h-3" />
                    </button>
                    {showFilters && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-10 py-1 max-h-60 overflow-y-auto">
                            <button
                                onClick={() => { setFilterType(''); setShowFilters(false) }}
                                className="w-full px-4 py-2 text-left text-sm text-dark-300 hover:bg-dark-700 hover:text-white"
                            >
                                All Types
                            </button>
                            {WORKOUT_TYPES.map(t => (
                                <button
                                    key={t}
                                    onClick={() => { setFilterType(t); setShowFilters(false) }}
                                    className="w-full px-4 py-2 text-left text-sm text-dark-300 hover:bg-dark-700 hover:text-white"
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Workout list */}
            <div className="space-y-3">
                {filteredWorkouts.length > 0 ? (
                    filteredWorkouts.map(w => (
                        <div key={w.id} className="glass-card p-4 hover:bg-dark-800/40 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0">
                                    <Dumbbell className="w-6 h-6 text-brand-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="text-sm font-semibold text-white">{w.name}</h4>
                                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                                <span className="text-xs text-dark-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {format(new Date(w.date), 'MMM d, yyyy')}
                                                </span>
                                                <span className="text-xs text-dark-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {w.duration} min
                                                </span>
                                                <span className="text-xs text-dark-400 flex items-center gap-1">
                                                    <Flame className="w-3 h-3" /> {w.calories} cal
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 bg-brand-500/15 text-brand-400 rounded-lg text-xs font-medium">
                                                {w.type}
                                            </span>
                                            <button
                                                onClick={() => deleteWorkout(w.id)}
                                                className="p-1.5 text-dark-600 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Exercises preview */}
                                    {w.exercises?.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {w.exercises.map((ex, i) => (
                                                <span key={i} className="px-2 py-1 bg-dark-800 rounded-md text-xs text-dark-300">
                                                    {ex.name} {ex.sets}×{ex.reps} {ex.weight > 0 && `@ ${ex.weight}${ex.unit}`}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {w.notes && (
                                        <p className="mt-2 text-xs text-dark-500 italic">"{w.notes}"</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass-card p-12 text-center">
                        <Dumbbell className="w-12 h-12 mx-auto mb-3 text-dark-600" />
                        <h3 className="text-lg font-medium text-dark-300 mb-1">No workouts found</h3>
                        <p className="text-sm text-dark-500">
                            {search || filterType ? 'Try adjusting your search or filters' : 'Click "Log Workout" to get started!'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
