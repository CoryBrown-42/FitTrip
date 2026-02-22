import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Workouts from './pages/Workouts'
import Goals from './pages/Goals'
import AICoach from './pages/AICoach'
import GoogleFit from './pages/GoogleFit'
import Profile from './pages/Profile'

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="workouts" element={<Workouts />} />
                <Route path="goals" element={<Goals />} />
                <Route path="ai-coach" element={<AICoach />} />
                <Route path="connections" element={<GoogleFit />} />
                <Route path="profile" element={<Profile />} />
            </Route>
        </Routes>
    )
}
