import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { chatWithCoach, getWorkoutSuggestion, analyzeProgress } from '../services/gemini'
import {
    Bot, Send, User, Loader2, Sparkles, Dumbbell,
    TrendingUp, RefreshCw, Trash2, Lightbulb
} from 'lucide-react'

const QUICK_PROMPTS = [
    { icon: Dumbbell, label: 'Suggest a workout', prompt: 'Suggest a complete workout for today based on my recent activity and goals.' },
    { icon: TrendingUp, label: 'Analyze my progress', prompt: 'Analyze my recent workout history and give me insights on my progress.' },
    { icon: Lightbulb, label: 'Nutrition tips', prompt: 'Give me some practical nutrition tips to support my fitness goals.' },
    { icon: Sparkles, label: 'Motivation', prompt: "I'm feeling unmotivated today. Help me get back on track with some encouragement and a plan." },
]

export default function AICoach() {
    const { state } = useApp()
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const chatEndRef = useRef(null)
    const inputRef = useRef(null)

    // Auto scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    function buildUserContext() {
        const { workouts, goals, profile, renpho, fitbit } = state
        const recentWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
        const activeGoals = goals.filter(g => !g.completed)
        const latestRenpho = renpho?.data?.[renpho.data.length - 1]

        let context = `User Profile: ${profile.name}`
        if (profile.weight) context += `, Weight: ${profile.weight} lbs`
        if (profile.age) context += `, Age: ${profile.age}`
        context += `, Weekly workout target: ${profile.weeklyTarget}`
        context += `, Total workouts logged: ${workouts.length}`

        if (recentWorkouts.length > 0) {
            context += `\n\nRecent workouts:\n${recentWorkouts.map(w =>
                `- ${w.date}: ${w.name} (${w.type}, ${w.duration}min, ${w.calories}cal)`
            ).join('\n')}`
        }

        if (activeGoals.length > 0) {
            context += `\n\nActive goals:\n${activeGoals.map(g =>
                `- ${g.name}: ${g.current}/${g.target} ${g.unit} (${g.category})`
            ).join('\n')}`
        }

        if (latestRenpho) {
            context += `\n\nLatest body composition (Renpho):`
            context += `\n- Weight: ${latestRenpho.weight} lbs`
            if (latestRenpho.bodyFat) context += `\n- Body Fat: ${latestRenpho.bodyFat}%`
            if (latestRenpho.muscleMass) context += `\n- Muscle Mass: ${latestRenpho.muscleMass} lbs`
        }

        if (fitbit?.connected && fitbit.data) {
            const fb = fitbit.data
            if (fb.steps?.length > 0) {
                const latest = fb.steps[fb.steps.length - 1]
                context += `\n\nFitbit - Latest steps: ${latest.steps} (${latest.date})`
            }
            if (fb.heartRate?.length > 0) {
                const hr = fb.heartRate.filter(h => h.restingHeartRate).pop()
                if (hr) context += `\nFitbit - Resting heart rate: ${hr.restingHeartRate} bpm`
            }
            if (fb.sleep?.length > 0) {
                const sleep = fb.sleep[fb.sleep.length - 1]
                context += `\nFitbit - Last sleep: ${sleep.minutesAsleep} min (efficiency: ${sleep.efficiency}%)`
            }
        }

        return context
    }

    async function sendMessage(text) {
        if (!text.trim() || loading) return

        const userMsg = { role: 'user', content: text.trim() }
        const newMessages = [...messages, userMsg]
        setMessages(newMessages)
        setInput('')
        setLoading(true)
        setError(null)

        try {
            const context = buildUserContext()
            const response = await chatWithCoach(
                newMessages.map(m => ({ role: m.role, content: m.content })),
                context
            )
            setMessages(prev => [...prev, { role: 'assistant', content: response }])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    function handleSubmit(e) {
        e.preventDefault()
        sendMessage(input)
    }

    function clearChat() {
        setMessages([])
        setError(null)
    }

    // Simple markdown renderer
    function renderContent(text) {
        // Convert markdown-style formatting to JSX
        const lines = text.split('\n')
        return lines.map((line, i) => {
            // Headers
            if (line.startsWith('### ')) {
                return <h4 key={i} className="text-sm font-bold text-white mt-3 mb-1">{line.slice(4)}</h4>
            }
            if (line.startsWith('## ')) {
                return <h3 key={i} className="text-base font-bold text-white mt-3 mb-1">{line.slice(3)}</h3>
            }
            if (line.startsWith('# ')) {
                return <h2 key={i} className="text-lg font-bold text-white mt-3 mb-1">{line.slice(2)}</h2>
            }

            // Bold
            let content = line
            const parts = []
            let remaining = content
            let keyIdx = 0

            while (remaining.includes('**')) {
                const start = remaining.indexOf('**')
                if (start > 0) parts.push(remaining.slice(0, start))
                remaining = remaining.slice(start + 2)
                const end = remaining.indexOf('**')
                if (end === -1) {
                    parts.push('**' + remaining)
                    remaining = ''
                    break
                }
                parts.push(<strong key={`b${i}-${keyIdx++}`} className="text-white font-semibold">{remaining.slice(0, end)}</strong>)
                remaining = remaining.slice(end + 2)
            }
            if (remaining) parts.push(remaining)

            // Bullet points
            if (line.trimStart().startsWith('- ') || line.trimStart().startsWith('* ')) {
                const indent = line.length - line.trimStart().length
                return (
                    <div key={i} className="flex gap-2" style={{ paddingLeft: `${indent * 4}px` }}>
                        <span className="text-brand-400 mt-0.5">•</span>
                        <span>{parts.length > 0 ? parts : line.trimStart().slice(2)}</span>
                    </div>
                )
            }

            // Numbered lists
            const numMatch = line.trimStart().match(/^(\d+)\.\s/)
            if (numMatch) {
                return (
                    <div key={i} className="flex gap-2">
                        <span className="text-brand-400 font-medium min-w-[1.5rem]">{numMatch[1]}.</span>
                        <span>{parts.length > 0 ? parts : line.trimStart().slice(numMatch[0].length)}</span>
                    </div>
                )
            }

            // Empty lines
            if (!line.trim()) return <div key={i} className="h-2" />

            // Regular text
            return <p key={i}>{parts.length > 0 ? parts : line}</p>
        })
    }

    return (
        <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Bot className="w-7 h-7 text-brand-400" />
                        AI Fitness Coach
                    </h1>
                    <p className="text-dark-400 text-sm mt-1">Powered by Gemini AI — personalized advice based on your data</p>
                </div>
                {messages.length > 0 && (
                    <button
                        onClick={clearChat}
                        className="px-3 py-2 bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white rounded-xl text-sm flex items-center gap-2 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" /> Clear
                    </button>
                )}
            </div>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 rounded-2xl bg-brand-500/15 flex items-center justify-center mb-4">
                            <Bot className="w-8 h-8 text-brand-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Your AI Fitness Coach
                        </h3>
                        <p className="text-dark-400 text-sm max-w-md mb-6">
                            Ask me anything about workouts, nutrition, form, recovery, or your fitness progress.
                            I have access to your workout history and goals for personalized advice.
                        </p>

                        {/* Quick prompts */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                            {QUICK_PROMPTS.map((qp, i) => {
                                const Icon = qp.icon
                                return (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(qp.prompt)}
                                        className="flex items-center gap-3 p-4 glass-card hover:bg-dark-800/60 transition-colors text-left"
                                    >
                                        <Icon className="w-5 h-5 text-brand-400 shrink-0" />
                                        <span className="text-sm text-dark-200">{qp.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role !== 'user' && (
                                <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0 mt-1">
                                    <Bot className="w-4 h-4 text-brand-400" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'chat-bubble-user text-white'
                                    : 'chat-bubble-ai text-dark-200'
                                    }`}
                            >
                                {msg.role === 'user' ? msg.content : renderContent(msg.content)}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0 mt-1">
                                    <User className="w-4 h-4 text-blue-400" />
                                </div>
                            )}
                        </div>
                    ))
                )}

                {/* Loading indicator */}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-brand-400" />
                        </div>
                        <div className="chat-bubble-ai px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-dark-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Thinking...
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mx-auto max-w-md p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="block mx-auto mt-2 text-xs text-red-300 hover:text-white"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="shrink-0">
                <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSubmit(e)
                                }
                            }}
                            placeholder="Ask your AI coach anything..."
                            rows={1}
                            className="w-full px-4 py-3 bg-dark-800/60 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors resize-none pr-12"
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-4 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-dark-700 disabled:text-dark-500 text-white rounded-xl transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-xs text-dark-600 mt-2 text-center">
                    AI Coach uses your workout history and goals for personalized advice
                </p>
            </form>
        </div>
    )
}
