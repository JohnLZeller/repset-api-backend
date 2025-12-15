import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWorkoutById } from '@/data/mockWorkouts';
import ExerciseCard from './ExerciseCard';
import { useState } from 'react';

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workout = id ? getWorkoutById(id) : null;

  const [exercises, setExercises] = useState(workout?.exercises || []);

  if (!workout) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Workout not found</h2>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const isEditable = workout.status === 'in_progress' || workout.status === 'scheduled';
  const isCompleted = workout.status === 'completed';

  const completedExercises = exercises.filter((ex) => {
    const completedSets = ex.sets.filter(
      (set) => set.actualWeight !== undefined && set.actualReps !== undefined
    ).length;
    return completedSets === ex.sets.length;
  }).length;

  const totalExercises = exercises.length;
  const allComplete = completedExercises === totalExercises;
  const progressPercentage = totalExercises > 0 
    ? Math.round((completedExercises / totalExercises) * 100)
    : 0;

  const handleUpdateSet = (setId: string, actualWeight: number, actualReps: number) => {
    setExercises((prev) =>
      prev.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) =>
          set.id === setId
            ? { ...set, actualWeight, actualReps, isCompleted: true }
            : set
        ),
      }))
    );
  };

  const handleFinishWorkout = () => {
    // In a real app, this would save to the backend
    // For now, just navigate back
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[hsl(47,100%,58%)] border-b border-[hsl(47,20%,48%)] sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[hsl(220,15%,18%)]" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-[hsl(220,15%,18%)]">Today's Workout</h1>
              <p className="text-sm text-[hsl(220,10%,45%)] flex items-center gap-1">
                <Dumbbell className="w-3 h-3" />
                {workout.muscleGroupFocus}
              </p>
            </div>
            {isCompleted && (
              <div className="px-3 py-1.5 bg-[hsl(227,100%,95%)] text-[hsl(227,100%,45%)] rounded-full text-xs font-medium flex items-center gap-1">
                <Check className="w-3 h-3" />
                Complete
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isEditable && (
            <div className="px-4 pb-3 mt-3">
              <div className="flex items-center justify-between text-xs text-[hsl(220,10%,45%)] mb-1.5">
                <span>
                  {completedExercises} of {totalExercises} exercises complete
                </span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[hsl(227,100%,58%)] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exercise List */}
      <div className="container mx-auto px-4 py-4">
        <div className="space-y-3">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onUpdateSet={handleUpdateSet}
              disabled={!isEditable}
            />
          ))}
        </div>
      </div>

      {/* Finish Workout Button */}
      {isEditable && (
        <div className="sticky bottom-0 px-4 pb-8 pt-4 bg-gradient-to-t from-background via-background to-transparent">
          <Button
            onClick={handleFinishWorkout}
            size="lg"
            disabled={!allComplete}
            className={`w-full h-14 text-base font-semibold rounded-xl shadow-lg ${
              allComplete
                ? 'bg-[hsl(227,100%,58%)] hover:bg-[hsl(227,100%,50%)] text-white'
                : 'bg-[hsl(220,12%,70%)] cursor-not-allowed text-white'
            }`}
          >
            {allComplete ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Complete Workout
              </>
            ) : (
              `Log all exercises to finish`
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkoutDetail;

