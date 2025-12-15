import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import Home from './components/Home'
import Profile from './components/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import { Dumbbell } from 'lucide-react'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-hero-gradient-start to-hero-gradient-end">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-primary rounded-full animate-pulse-soft">
            <Dumbbell className="w-10 h-10 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <p className="text-lg font-semibold text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <Register />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
