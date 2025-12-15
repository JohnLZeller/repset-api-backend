import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Dumbbell, LogOut, Settings } from 'lucide-react'
import WorkoutCard from './workout/WorkoutCard'
import { getActiveWorkout, getScheduledWorkout, getCompletedWorkouts } from '@/data/mockWorkouts'

export default function Home() {
  const { user, logout } = useAuth()
  const activeWorkout = getActiveWorkout()
  const scheduledWorkout = getScheduledWorkout()
  const completedWorkouts = getCompletedWorkouts()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[hsl(47,100%,58%)] border-b border-[hsl(47,20%,48%)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
              <Dumbbell className="w-6 h-6 text-[hsl(227,100%,58%)]" strokeWidth={2.5} />
              <h1 className="text-2xl font-bold text-[hsl(220,15%,18%)]">RepSet</h1>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/settings" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[hsl(220,15%,18%)]">
            Welcome back, {user?.first_name || user?.full_name || user?.email}!
          </h2>
          <p className="text-[hsl(220,10%,45%)] mt-1">Here's your workout overview</p>
        </div>

        {/* Active or Scheduled Workout Hero */}
        <div className="mb-8">
          {activeWorkout ? (
            <WorkoutCard workout={activeWorkout} variant="hero" />
          ) : scheduledWorkout ? (
            <WorkoutCard workout={scheduledWorkout} variant="scheduled" />
          ) : null}
        </div>

        {/* Workout History */}
        {completedWorkouts.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-[hsl(220,15%,18%)] mb-4">Workout History</h3>
            <div className="space-y-3">
              {completedWorkouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} variant="history" />
              ))}
            </div>
          </div>
        )}

        {completedWorkouts.length === 0 && !activeWorkout && !scheduledWorkout && (
          <div className="text-center py-12">
            <p className="text-lg text-[hsl(220,10%,45%)]">No workouts yet. Start your first workout!</p>
          </div>
        )}
      </main>
    </div>
  )
}

