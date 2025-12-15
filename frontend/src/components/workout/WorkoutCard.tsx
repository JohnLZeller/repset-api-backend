import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dumbbell, Calendar, CheckCircle2 } from 'lucide-react';
import { Workout } from '@/types/workout';

interface WorkoutCardProps {
  workout: Workout;
  variant?: 'hero' | 'scheduled' | 'history';
}

const WorkoutCard = ({ workout, variant = 'history' }: WorkoutCardProps) => {
  const completedExercises = workout.exercises.filter((ex) => {
    const completedSets = ex.sets.filter(
      (set) => set.actualWeight !== undefined && set.actualReps !== undefined
    ).length;
    return completedSets === ex.sets.length;
  }).length;

  const totalExercises = workout.exercises.length;
  const progressPercentage = totalExercises > 0 
    ? Math.round((completedExercises / totalExercises) * 100)
    : 0;

  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = workout.exercises.reduce((sum, ex) => {
    return sum + ex.sets.filter(
      (set) => set.actualWeight !== undefined && set.actualReps !== undefined
    ).length;
  }, 0);

  const totalVolume = workout.exercises.reduce((sum, ex) => {
    return sum + ex.sets.reduce((setSum, set) => {
      const weight = set.actualWeight || 0;
      const reps = set.actualReps || 0;
      return setSum + weight * reps;
    }, 0);
  }, 0);

  if (variant === 'hero') {
    return (
      <Card className="w-full border-2 border-[hsl(227,100%,58%)] shadow-lg">
        <CardHeader className="bg-[hsl(220,12%,22%)] text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[hsl(47,100%,58%)]" />
            Continue Your Workout
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-[hsl(220,15%,18%)] mb-1">
              {workout.muscleGroupFocus}
            </h3>
            <p className="text-sm text-[hsl(220,10%,45%)] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {workout.dateFormatted}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
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

          <Link to={`/workout/${workout.id}`}>
            <button className="w-full h-12 text-base font-semibold rounded-xl shadow-lg bg-[hsl(227,100%,58%)] hover:bg-[hsl(227,100%,50%)] text-white transition-colors">
              Resume Workout
            </button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'scheduled') {
    return (
      <Card className="w-full border-2 border-[hsl(47,20%,48%)] shadow-lg">
        <CardHeader className="bg-[hsl(220,12%,22%)] text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[hsl(47,100%,58%)]" />
            Today's Workout
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-[hsl(220,15%,18%)] mb-1">
              {workout.muscleGroupFocus}
            </h3>
            <p className="text-sm text-[hsl(220,10%,45%)] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {workout.dateFormatted}
            </p>
            <p className="text-sm text-[hsl(220,10%,45%)] mt-1">
              Workout #{workout.workoutNumber} • {totalExercises} exercises
            </p>
          </div>

          <Link to={`/workout/${workout.id}`}>
            <button className="w-full h-12 text-base font-semibold rounded-xl shadow-lg bg-[hsl(227,100%,58%)] hover:bg-[hsl(227,100%,50%)] text-white transition-colors">
              Begin Workout
            </button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // History variant
  return (
    <Link to={`/workout/${workout.id}`}>
      <Card className="w-full hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-[hsl(220,15%,18%)]">
                  {workout.muscleGroupFocus}
                </h3>
                <div className="px-2 py-0.5 bg-[hsl(227,100%,95%)] text-[hsl(227,100%,45%)] rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Complete
                </div>
              </div>
              <p className="text-sm text-[hsl(220,10%,45%)] flex items-center gap-1 mb-2">
                <Calendar className="w-3 h-3" />
                {workout.dateFormatted}
              </p>
              <div className="flex items-center gap-4 text-xs text-[hsl(220,10%,45%)]">
                <span>Workout #{workout.workoutNumber}</span>
                <span>{totalSets} sets</span>
                <span>{totalVolume.toLocaleString()} lb volume</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-[hsl(227,100%,95%)] flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-[hsl(227,100%,58%)]" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default WorkoutCard;

