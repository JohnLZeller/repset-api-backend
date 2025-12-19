import { Workout, Exercise } from '../types/workout';

// Mock exercises for different workouts
const chestTricepsExercises: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Seated Chest Press',
    machineNumber: '12',
    machineBrand: 'Life Fitness',
    equipmentType: 'Plate Loaded',
    description: 'Builds pushing strength in chest, shoulders, and triceps.',
    musclesWorked: ['Chest', 'Shoulders', 'Triceps'],
    sets: [
      { id: 's1-1', setNumber: 1, targetWeight: 90, targetReps: 10, restSeconds: 90, isCompleted: false },
      { id: 's1-2', setNumber: 2, targetWeight: 90, targetReps: 10, restSeconds: 90, isCompleted: false },
      { id: 's1-3', setNumber: 3, targetWeight: 90, targetReps: 8, restSeconds: 90, isCompleted: false },
    ],
  },
  {
    id: 'ex-2',
    name: 'Incline Press',
    machineNumber: '14',
    machineBrand: 'Hammer Strength',
    equipmentType: 'Selectorized',
    description: 'Targets the upper chest and front shoulders.',
    musclesWorked: ['Chest', 'Shoulders'],
    sets: [
      { id: 's2-1', setNumber: 1, targetWeight: 70, targetReps: 12, restSeconds: 75, isCompleted: false },
      { id: 's2-2', setNumber: 2, targetWeight: 70, targetReps: 12, restSeconds: 75, isCompleted: false },
      { id: 's2-3', setNumber: 3, targetWeight: 70, targetReps: 10, restSeconds: 75, isCompleted: false },
    ],
  },
  {
    id: 'ex-3',
    name: 'Pec Fly',
    machineNumber: '16',
    machineBrand: 'Life Fitness',
    equipmentType: 'Selectorized',
    description: 'Isolates the chest muscles with a controlled range of motion.',
    musclesWorked: ['Chest'],
    sets: [
      { id: 's3-1', setNumber: 1, targetWeight: 55, targetReps: 12, restSeconds: 60, isCompleted: false },
      { id: 's3-2', setNumber: 2, targetWeight: 55, targetReps: 12, restSeconds: 60, isCompleted: false },
      { id: 's3-3', setNumber: 3, targetWeight: 55, targetReps: 12, restSeconds: 60, isCompleted: false },
    ],
  },
  {
    id: 'ex-4',
    name: 'Tricep Pushdown',
    machineNumber: '8',
    machineBrand: 'FreeMotion',
    equipmentType: 'Cable Station',
    description: 'Strengthens the triceps for better arm definition.',
    musclesWorked: ['Triceps', 'Shoulders'],
    sets: [
      { id: 's4-1', setNumber: 1, targetWeight: 40, targetReps: 12, restSeconds: 60, isCompleted: false },
      { id: 's4-2', setNumber: 2, targetWeight: 40, targetReps: 12, restSeconds: 60, isCompleted: false },
      { id: 's4-3', setNumber: 3, targetWeight: 40, targetReps: 10, restSeconds: 60, isCompleted: false },
    ],
  },
];

const backBicepsExercises: Exercise[] = [
  {
    id: 'ex-5',
    name: 'Lat Pulldown',
    machineNumber: '10',
    machineBrand: 'Life Fitness',
    equipmentType: 'Cable Station',
    description: 'Builds width and strength in the lats.',
    musclesWorked: ['Back', 'Biceps'],
    sets: [
      { id: 's5-1', setNumber: 1, targetWeight: 100, targetReps: 10, restSeconds: 90, isCompleted: true, actualWeight: 100, actualReps: 10 },
      { id: 's5-2', setNumber: 2, targetWeight: 100, targetReps: 10, restSeconds: 90, isCompleted: true, actualWeight: 100, actualReps: 10 },
      { id: 's5-3', setNumber: 3, targetWeight: 100, targetReps: 8, restSeconds: 90, isCompleted: true, actualWeight: 100, actualReps: 8 },
    ],
  },
  {
    id: 'ex-6',
    name: 'Seated Row',
    machineNumber: '15',
    machineBrand: 'Hammer Strength',
    equipmentType: 'Plate Loaded',
    description: 'Targets the middle back and rear delts.',
    musclesWorked: ['Back', 'Shoulders'],
    sets: [
      { id: 's6-1', setNumber: 1, targetWeight: 80, targetReps: 12, restSeconds: 75, isCompleted: true, actualWeight: 80, actualReps: 12 },
      { id: 's6-2', setNumber: 2, targetWeight: 80, targetReps: 12, restSeconds: 75, isCompleted: true, actualWeight: 80, actualReps: 12 },
      { id: 's6-3', setNumber: 3, targetWeight: 80, targetReps: 10, restSeconds: 75, isCompleted: true, actualWeight: 80, actualReps: 10 },
    ],
  },
  {
    id: 'ex-7',
    name: 'Bicep Curl',
    machineNumber: '6',
    machineBrand: 'Life Fitness',
    equipmentType: 'Selectorized',
    description: 'Isolates the biceps for arm development.',
    musclesWorked: ['Biceps'],
    sets: [
      { id: 's7-1', setNumber: 1, targetWeight: 50, targetReps: 12, restSeconds: 60, isCompleted: true, actualWeight: 50, actualReps: 12 },
      { id: 's7-2', setNumber: 2, targetWeight: 50, targetReps: 12, restSeconds: 60, isCompleted: true, actualWeight: 50, actualReps: 12 },
      { id: 's7-3', setNumber: 3, targetWeight: 50, targetReps: 10, restSeconds: 60, isCompleted: true, actualWeight: 50, actualReps: 10 },
    ],
  },
];

const legsExercises: Exercise[] = [
  {
    id: 'ex-8',
    name: 'Leg Press',
    machineNumber: '20',
    machineBrand: 'Life Fitness',
    equipmentType: 'Plate Loaded',
    description: 'Builds lower body strength and size.',
    musclesWorked: ['Quads', 'Glutes', 'Hamstrings'],
    sets: [
      { id: 's8-1', setNumber: 1, targetWeight: 200, targetReps: 12, restSeconds: 90, isCompleted: true, actualWeight: 200, actualReps: 12 },
      { id: 's8-2', setNumber: 2, targetWeight: 200, targetReps: 12, restSeconds: 90, isCompleted: true, actualWeight: 200, actualReps: 12 },
      { id: 's8-3', setNumber: 3, targetWeight: 200, targetReps: 10, restSeconds: 90, isCompleted: true, actualWeight: 200, actualReps: 10 },
    ],
  },
  {
    id: 'ex-9',
    name: 'Leg Extension',
    machineNumber: '18',
    machineBrand: 'Hammer Strength',
    equipmentType: 'Selectorized',
    description: 'Isolates the quadriceps.',
    musclesWorked: ['Quads'],
    sets: [
      { id: 's9-1', setNumber: 1, targetWeight: 60, targetReps: 12, restSeconds: 60, isCompleted: true, actualWeight: 60, actualReps: 12 },
      { id: 's9-2', setNumber: 2, targetWeight: 60, targetReps: 12, restSeconds: 60, isCompleted: true, actualWeight: 60, actualReps: 12 },
      { id: 's9-3', setNumber: 3, targetWeight: 60, targetReps: 10, restSeconds: 60, isCompleted: true, actualWeight: 60, actualReps: 10 },
    ],
  },
];

// In-progress workout (some sets logged)
const inProgressExercises: Exercise[] = [
  {
    id: 'ex-10',
    name: 'Seated Chest Press',
    machineNumber: '12',
    machineBrand: 'Life Fitness',
    equipmentType: 'Plate Loaded',
    description: 'Builds pushing strength in chest, shoulders, and triceps.',
    musclesWorked: ['Chest', 'Shoulders', 'Triceps'],
    sets: [
      { id: 's10-1', setNumber: 1, targetWeight: 90, targetReps: 10, restSeconds: 90, isCompleted: true, actualWeight: 90, actualReps: 10 },
      { id: 's10-2', setNumber: 2, targetWeight: 90, targetReps: 10, restSeconds: 90, isCompleted: true, actualWeight: 90, actualReps: 10 },
      { id: 's10-3', setNumber: 3, targetWeight: 90, targetReps: 8, restSeconds: 90, isCompleted: false },
    ],
  },
  {
    id: 'ex-11',
    name: 'Incline Press',
    machineNumber: '14',
    machineBrand: 'Hammer Strength',
    equipmentType: 'Selectorized',
    description: 'Targets the upper chest and front shoulders.',
    musclesWorked: ['Chest', 'Shoulders'],
    sets: [
      { id: 's11-1', setNumber: 1, targetWeight: 70, targetReps: 12, restSeconds: 75, isCompleted: true, actualWeight: 70, actualReps: 12 },
      { id: 's11-2', setNumber: 2, targetWeight: 70, targetReps: 12, restSeconds: 75, isCompleted: false },
      { id: 's11-3', setNumber: 3, targetWeight: 70, targetReps: 10, restSeconds: 75, isCompleted: false },
    ],
  },
  {
    id: 'ex-12',
    name: 'Pec Fly',
    machineNumber: '16',
    machineBrand: 'Life Fitness',
    equipmentType: 'Selectorized',
    description: 'Isolates the chest muscles with a controlled range of motion.',
    musclesWorked: ['Chest'],
    sets: [
      { id: 's12-1', setNumber: 1, targetWeight: 55, targetReps: 12, restSeconds: 60, isCompleted: false },
      { id: 's12-2', setNumber: 2, targetWeight: 55, targetReps: 12, restSeconds: 60, isCompleted: false },
      { id: 's12-3', setNumber: 3, targetWeight: 55, targetReps: 12, restSeconds: 60, isCompleted: false },
    ],
  },
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

export const mockWorkouts: Workout[] = [
  // In-progress workout
  {
    id: 'workout-in-progress',
    workoutNumber: 3,
    muscleGroupFocus: 'Chest & Triceps',
    date: today.toISOString(),
    dateFormatted: today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    exercises: inProgressExercises,
    status: 'in_progress',
  },
  // Scheduled workout (if no in-progress)
  {
    id: 'workout-scheduled',
    workoutNumber: 4,
    muscleGroupFocus: 'Legs',
    date: today.toISOString(),
    dateFormatted: today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    exercises: legsExercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(set => ({ ...set, isCompleted: false, actualWeight: undefined, actualReps: undefined })),
    })),
    status: 'scheduled',
  },
  // Completed workouts
  {
    id: 'workout-1',
    workoutNumber: 2,
    muscleGroupFocus: 'Back & Biceps',
    date: yesterday.toISOString(),
    dateFormatted: yesterday.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    exercises: backBicepsExercises,
    status: 'completed',
  },
  {
    id: 'workout-2',
    workoutNumber: 1,
    muscleGroupFocus: 'Chest & Triceps',
    date: twoDaysAgo.toISOString(),
    dateFormatted: twoDaysAgo.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    exercises: chestTricepsExercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(set => ({
        ...set,
        isCompleted: true,
        actualWeight: set.targetWeight,
        actualReps: set.targetReps,
      })),
    })),
    status: 'completed',
  },
  {
    id: 'workout-3',
    workoutNumber: 0,
    muscleGroupFocus: 'Legs',
    date: threeDaysAgo.toISOString(),
    dateFormatted: threeDaysAgo.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    exercises: legsExercises,
    status: 'completed',
  },
];

// Helper function to get active/in-progress workout
export const getActiveWorkout = (): Workout | null => {
  return mockWorkouts.find(w => w.status === 'in_progress') || null;
};

// Helper function to get scheduled workout (if no active)
export const getScheduledWorkout = (): Workout | null => {
  const active = getActiveWorkout();
  if (active) return null;
  return mockWorkouts.find(w => w.status === 'scheduled') || null;
};

// Helper function to get completed workouts
export const getCompletedWorkouts = (): Workout[] => {
  return mockWorkouts.filter(w => w.status === 'completed').sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

// Helper function to get workout by ID
export const getWorkoutById = (id: string): Workout | undefined => {
  return mockWorkouts.find(w => w.id === id);
};


