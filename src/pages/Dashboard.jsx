import { useApp } from '../context/AppContext'
import {
    Flame,
    Footprints,
    Timer,
    TrendingUp,
    Dumbbell,
    Target,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Zap
} from 'lucide-react'
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { format, subDays, startOfWeek, isAfter } from 'date-fns'
import { Link } from 'react-router-dom'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Dashboard() {
    const { state } = useApp()
    const { workouts, goals, stats, renpho, pantry } = state

    // Weekly workout data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i)
        const dateStr = format(date, 'yyyy-MM-dd')
        const dayWorkouts = workouts.filter(w => w.date === dateStr)
        return {
            day: format(date, 'EEE'),
            date: dateStr,
            workouts: dayWorkouts.length,
            calories: dayWorkouts.reduce((s, w) => s + (w.calories || 0), 0),
            duration: dayWorkouts.reduce((s, w) => s + (w.duration || 0), 0),
        }
    })

    // Workout type distribution
    const typeDistribution = workouts.reduce((acc, w) => {
        acc[w.type] = (acc[w.type] || 0) + 1
        return acc
    }, {})
    const pieData = Object.entries(typeDistribution).map(([name, value]) => ({ name, value }))

    // Recent workouts
    const recentWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

    // Active goals
    const activeGoals = goals.filter(g => !g.completed).slice(0, 3)

    // This week's workout count
    const weekStart = startOfWeek(new Date())
    const thisWeekWorkouts = workouts.filter(w => isAfter(new Date(w.date), weekStart)).length

    // Renpho data
    const latestRenpho = renpho?.data?.length > 0 ? renpho.data[renpho.data.length - 1] : null

    const statCards = [
        {
            label: 'Total Workouts',
            value: stats.totalWorkouts,
            icon: Dumbbell,
            color: 'from-brand-400 to-emerald-500',
            subtext: `${thisWeekWorkouts} this week`,
        },
        {
            label: 'Current Streak',
            value: `${stats.currentStreak} days`,
            icon: Flame,
            color: 'from-orange-400 to-red-500',
            subtext: stats.currentStreak > 3 ? 'On fire! 🔥' : 'Keep going!',
        },
        {
            label: 'Calories Burned',
            value: stats.caloriesBurned.toLocaleString(),
            icon: Zap,
            color: 'from-yellow-400 to-amber-500',
            subtext: 'All time total',
        },
        {
            label: 'Minutes Active',
            value: stats.minutesExercised.toLocaleString(),
            icon: Timer,
            color: 'from-blue-400 to-indigo-500',
            subtext: `${Math.round(stats.minutesExercised / 60)} hours total`,
        },
    ]
    // Food Points stat card
    if (pantry && pantry.length > 0) {
        const totalPoints = pantry.reduce((sum, item) => sum + (item.points || 0) * (item.quantity || 1), 0)
        statCards.unshift({
            label: 'Food Points',
            value: totalPoints,
            icon: Target,
            color: 'from-amber-400 to-orange-500',
            subtext: `${pantry.length} items in pantry`,
        })
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Welcome banner */}
            <div className="glass-card p-6 glow-border">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">
                            Welcome back, {state.profile.name}! 👋
                        </h1>
                        <p className="text-dark-400">
                            {thisWeekWorkouts >= state.profile.weeklyTarget
                                ? "You've hit your weekly target! Amazing work!"
                                : `${state.profile.weeklyTarget - thisWeekWorkouts} more workouts to hit your weekly goal`
                            }
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/workouts"
                            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
                        >
                            <Dumbbell className="w-4 h-4" />
                            Log Workout
                        </Link>
                        <Link
                            to="/ai-coach"
                            className="px-5 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
                        >
                            <Zap className="w-4 h-4 text-brand-400" />
                            Ask AI Coach
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => {
                    const Icon = card.icon
                    return (
                        <div key={i} className="glass-card p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white">{card.value}</p>
                            <p className="text-sm text-dark-400 mt-1">{card.label}</p>
                            <p className="text-xs text-dark-500 mt-0.5">{card.subtext}</p>
                        </div>
                    )
                })}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Activity chart */}
                <div className="glass-card p-5 lg:col-span-2">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-400" />
                        Weekly Activity
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={last7Days} barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    color: '#fff',
                                    fontSize: 12,
                                }}
                            />
                            <Bar dataKey="duration" fill="#22c55e" radius={[6, 6, 0, 0]} name="Minutes" />
                            <Bar dataKey="calories" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Calories" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Workout distribution */}
                <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-brand-400" />
                        Workout Types
                    </h3>
                    {pieData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={65}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #334155',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontSize: 12,
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {pieData.map((d, i) => (
                                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-dark-300">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        {d.name}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-40 text-dark-500 text-sm">
                            Log workouts to see distribution
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent workouts */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Dumbbell className="w-4 h-4 text-brand-400" />
                            Recent Workouts
                        </h3>
                        <Link to="/workouts" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                            View all <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {recentWorkouts.length > 0 ? (
                        <div className="space-y-3">
                            {recentWorkouts.map(w => (
                                <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors">
                                    <div className="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center">
                                        <Dumbbell className="w-4 h-4 text-brand-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{w.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-dark-400">{w.type} · {w.duration} min</span>
                                            {w.source === 'fitbit' && (
                                                <span className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded text-xs font-semibold">Fitbit</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-brand-400">{w.calories} cal</p>
                                        <p className="text-xs text-dark-500">{format(new Date(w.date), 'MMM d')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-dark-500 text-sm">
                            <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            No workouts yet. Start your journey!
                        </div>
                    )}
                </div>

                {/* Goals + Body data */}
                <div className="space-y-4">
                    {/* Active goals */}
                    <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                <Target className="w-4 h-4 text-brand-400" />
                                Active Goals
                            </h3>
                            <Link to="/goals" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                                View all <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </div>
                        {activeGoals.length > 0 ? (
                            <div className="space-y-3">
                                {activeGoals.map(g => {
                                    const progress = Math.min(100, Math.round((g.current / g.target) * 100))
                                    return (
                                        <div key={g.id} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-dark-200">{g.name}</span>
                                                <span className="text-brand-400 font-medium">{progress}%</span>
                                            </div>
                                            <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-dark-500 text-sm">
                                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                Set goals to track progress
                            </div>
                        )}
                    </div>

                    {/* Body composition from Renpho */}
                    {latestRenpho && (
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Footprints className="w-4 h-4 text-brand-400" />
                                Body Composition (Renpho)
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Weight', value: `${latestRenpho.weight} lb` },
                                    { label: 'Body Fat', value: `${latestRenpho.bodyFat}%` },
                                    { label: 'Muscle', value: `${latestRenpho.muscleMass} lb` },
                                ].map(item => (
                                    <div key={item.label} className="text-center p-2 rounded-lg bg-dark-800/50">
                                        <p className="text-lg font-bold text-white">{item.value}</p>
                                        <p className="text-xs text-dark-400">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
