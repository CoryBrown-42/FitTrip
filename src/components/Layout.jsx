import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Dumbbell,
    Target,
    Bot,
    Link2,
    User,
    Menu,
    X,
    Activity
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/workouts', label: 'Workouts', icon: Dumbbell },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/ai-coach', label: 'AI Coach', icon: Bot },
    { path: '/connections', label: 'Connections', icon: Link2 },
    { path: '/profile', label: 'Profile', icon: User },
]

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-dark-900/95 backdrop-blur-xl border-r border-dark-700/50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 pt-[max(1.25rem,env(safe-area-inset-top))] border-b border-dark-700/50">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold gradient-text">FitTrip</h1>
                        <p className="text-xs text-dark-400">Your Fitness Journey</p>
                    </div>
                    <button
                        className="ml-auto lg:hidden text-dark-400 hover:text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map(item => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${isActive
                                        ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                                        : 'text-dark-300 hover:text-white hover:bg-dark-800/60'
                                    }
                `}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : ''}`} />
                                {item.label}
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
                                )}
                            </NavLink>
                        )
                    })}
                </nav>

                {/* Bottom section */}
                <div className="px-4 py-4 border-t border-dark-700/50">
                    <div className="glass-card p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Bot className="w-4 h-4 text-brand-400" />
                            <span className="text-xs font-medium text-brand-400">AI Powered</span>
                        </div>
                        <p className="text-xs text-dark-400">
                            Gemini AI coach is ready to help with your fitness journey.
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="min-h-16 border-b border-dark-700/50 bg-dark-900/60 backdrop-blur-xl flex items-center px-4 lg:px-6 shrink-0 pt-[env(safe-area-inset-top)]">
                    <button
                        className="lg:hidden mr-3 text-dark-400 hover:text-white"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h2 className="text-lg font-semibold text-white">
                        {navItems.find(n => n.path === location.pathname)?.label || 'FitTrip'}
                    </h2>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
