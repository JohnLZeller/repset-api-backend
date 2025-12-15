// Workout App Types - matching demo app structure

export interface Set {
  id: string;
  setNumber: number;
  targetWeight: number;
  targetReps: number;
  restSeconds: number;
  // Logged values (user input)
  actualWeight?: number;
  actualReps?: number;
  isCompleted: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  machineNumber?: string; // Optional - free weights/bodyweight have no machine number
  machineBrand?: string; // Brand name of the machine (e.g., "Life Fitness", "Hammer Strength")
  equipmentType: string; // Type of equipment (e.g., "Plate loaded machine", "Free weight")
  description?: string;
  musclesWorked?: string[];
  sets: Set[];
}

export interface Workout {
  id: string;
  workoutNumber: number;
  muscleGroupFocus: string;
  date: string;
  dateFormatted: string;
  exercises: Exercise[];
  status: 'scheduled' | 'in_progress' | 'completed';
}

