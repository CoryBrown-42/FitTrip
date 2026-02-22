import { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
    Target, Plus, Trash2, Check, X, Edit2,
    TrendingUp, Award, Calendar
} from 'lucide-react'
import { format } from 'date-fns'

const GOAL_CATEGORIES = [
    'Weight Loss', 'Muscle Gain', 'Endurance', 'Strength',
    'Flexibility', 'Consistency', 'Nutrition', 'General Fitness'
]

const GOAL_UNITS = [
    'lbs', 'kg', 'reps', 'minutes', 'miles', 'km',
    'days', 'workouts', 'calories', '%'
]

export default function Goals() {
    const { state, dispatch } = useApp()
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState({
        name: '',
        category: 'General Fitness',
        target: 0,
        current: 0,
        unit: 'lbs',
        deadline: '',
        completed: false,
    })

    const activeGoals = state.goals.filter(g => !g.completed)
    const completedGoals = state.goals.filter(g => g.completed)

    function handleSubmit(e) {
        e.preventDefault()
        if (!form.name.trim()) return

        if (editingId) {
            dispatch({ type: 'UPDATE_GOAL', payload: { ...form, id: editingId } })
            setEditingId(null)
        } else {
            dispatch({ type: 'ADD_GOAL', payload: form })
        }
        setForm({ name: '', category: 'General Fitness', target: 0, current: 0, unit: 'lbs', deadline: '', completed: false })
        setShowForm(false)
    }

    function startEdit(goal) {
        setForm({
            name: goal.name,
            category: goal.category,
            target: goal.target,
            current: goal.current,
            unit: goal.unit,
            deadline: goal.deadline || '',
            completed: goal.completed,
        })
        setEditingId(goal.id)
        setShowForm(true)
    }

    function toggleComplete(goal) {
        dispatch({
            type: 'UPDATE_GOAL',
            payload: { id: goal.id, completed: !goal.completed }
        })
    }

    function updateProgress(goal, newCurrent) {
        dispatch({
            type: 'UPDATE_GOAL',
            payload: { id: goal.id, current: parseFloat(newCurrent) || 0 }
        })
    }

    function deleteGoal(id) {
        if (confirm('Delete this goal?')) {
            dispatch({ type: 'DELETE_GOAL', payload: id })
        }
    }

    function GoalCard({ goal }) {
        const progress = goal.target > 0
            ? Math.min(100, Math.round((goal.current / goal.target) * 100))
            : 0

        const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !goal.completed

        return (
            <div className={`glass-card p-5 transition-all ${goal.completed ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-xs rounded-md bg-brand-500/15 text-brand-400 font-medium">
                                {goal.category}
                            </span>
                            {goal.completed && (
                                <span className="px-2 py-0.5 text-xs rounded-md bg-emerald-500/20 text-emerald-400 font-medium flex items-center gap-1">
                                    <Award className="w-3 h-3" /> Completed
                                </span>
                            )}
                            {isOverdue && (
                                <span className="px-2 py-0.5 text-xs rounded-md bg-red-500/20 text-red-400 font-medium">
                                    Overdue
                                </span>
                            )}
                        </div>
                        <h4 className="text-base font-semibold text-white">{goal.name}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => toggleComplete(goal)}
                            className={`p-1.5 rounded-lg transition-colors ${goal.completed
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'text-dark-500 hover:text-brand-400 hover:bg-dark-800'
                                }`}
                            title={goal.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => startEdit(goal)}
                            className="p-1.5 text-dark-500 hover:text-blue-400 hover:bg-dark-800 rounded-lg transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => deleteGoal(goal.id)}
                            className="p-1.5 text-dark-500 hover:text-red-400 hover:bg-dark-800 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-dark-300">
                            {goal.current} / {goal.target} {goal.unit}
                        </span>
                        <span className={`text-sm font-bold ${progress >= 100 ? 'text-emerald-400' : 'text-brand-400'}`}>
                            {progress}%
                        </span>
                    </div>
                    <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${progress >= 100
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                : 'bg-gradient-to-r from-brand-500 to-brand-400'
                                }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Quick progress update */}
                {!goal.completed && (
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={goal.current}
                            onChange={e => updateProgress(goal, e.target.value)}
                            className="w-24 px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
                            step="any"
                        />
                        <span className="text-xs text-dark-500">{goal.unit}</span>
                        {goal.deadline && (
                            <span className="ml-auto text-xs text-dark-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(goal.deadline), 'MMM d, yyyy')}
                            </span>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Goals</h1>
                    <p className="text-dark-400 text-sm mt-1">Set targets and track your progress</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm)
                        setEditingId(null)
                        setForm({ name: '', category: 'General Fitness', target: 0, current: 0, unit: 'lbs', deadline: '', completed: false })
                    }}
                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 self-start"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? 'Cancel' : 'New Goal'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4 glow-border">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-brand-400" />
                        {editingId ? 'Edit Goal' : 'New Goal'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm text-dark-300 mb-1.5">Goal Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g., Lose 10 pounds by summer"
                                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">Category</label>
                            <select
                                value={form.category}
                                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 appearance-none"
                            >
                                {GOAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">Unit</label>
                            <select
                                value={form.unit}
                                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 appearance-none"
                            >
                                {GOAL_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">Current Value</label>
                            <input
                                type="number"
                                value={form.current}
                                onChange={e => setForm(f => ({ ...f, current: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
                                step="any"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">Target Value</label>
                            <input
                                type="number"
                                value={form.target}
                                onChange={e => setForm(f => ({ ...f, target: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
                                step="any"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-dark-300 mb-1.5">Deadline (optional)</label>
                            <input
                                type="date"
                                value={form.deadline}
                                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-colors"
                    >
                        {editingId ? 'Update Goal' : 'Create Goal'}
                    </button>
                </form>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-white">{activeGoals.length}</p>
                    <p className="text-xs text-dark-400 mt-1">Active Goals</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{completedGoals.length}</p>
                    <p className="text-xs text-dark-400 mt-1">Completed</p>
                </div>
                <div className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-brand-400">
                        {state.goals.length > 0
                            ? Math.round(completedGoals.length / state.goals.length * 100)
                            : 0}%
                    </p>
                    <p className="text-xs text-dark-400 mt-1">Success Rate</p>
                </div>
            </div>

            {/* Active goals */}
            {activeGoals.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-dark-300 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Active Goals ({activeGoals.length})
                    </h3>
                    <div className="space-y-3">
                        {activeGoals.map(g => <GoalCard key={g.id} goal={g} />)}
                    </div>
                </div>
            )}

            {/* Completed goals */}
            {completedGoals.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-dark-300 mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Completed Goals ({completedGoals.length})
                    </h3>
                    <div className="space-y-3">
                        {completedGoals.map(g => <GoalCard key={g.id} goal={g} />)}
                    </div>
                </div>
            )}

            {state.goals.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <Target className="w-12 h-12 mx-auto mb-3 text-dark-600" />
                    <h3 className="text-lg font-medium text-dark-300 mb-1">No goals yet</h3>
                    <p className="text-sm text-dark-500">
                        Set your first fitness goal and start tracking progress!
                    </p>
                </div>
            )}
        </div>
    )
}
