import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Weight } from 'lucide-react';
import { Exercise } from '@/types/workout';
import SetRow from './SetRow';

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdateSet: (setId: string, actualWeight: number, actualReps: number) => void;
  disabled?: boolean; // When disabled, sets are read-only but card can still be expanded
}

const ExerciseCard = ({ exercise, onUpdateSet, disabled = false }: ExerciseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedSets = exercise.sets.filter(
    (set) => set.actualWeight !== undefined && set.actualReps !== undefined
  ).length;
  const totalSets = exercise.sets.length;
  const isComplete = completedSets === totalSets;

  return (
    <div
      className={`w-full text-left bg-white rounded-xl border transition-all ${
        isComplete
          ? 'border-[hsl(227,100%,80%)] bg-[hsl(227,100%,97%)]'
          : 'border-[hsl(47,20%,48%)] hover:border-[hsl(47,20%,40%)]'
      } cursor-pointer`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Machine Number / Completion Indicator / Free Weight Icon */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isComplete
                ? 'bg-[hsl(227,100%,58%)]'
                : 'bg-[hsl(47,100%,85%)] border-2 border-[hsl(47,100%,58%)]'
            }`}
          >
            {isComplete ? (
              <Check className="w-5 h-5 text-white" />
            ) : exercise.machineNumber ? (
              <span className="text-sm font-bold text-[hsl(220,15%,18%)]">
                #{exercise.machineNumber}
              </span>
            ) : (
              <Weight className="w-5 h-5 text-[hsl(220,15%,18%)]" />
            )}
          </div>

          {/* Exercise Info */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold mb-0.5 ${
                isComplete ? 'text-[hsl(227,100%,40%)]' : 'text-[hsl(220,15%,18%)]'
              }`}
            >
              {exercise.name}
            </h3>
            {exercise.machineBrand && (
              <p className="text-sm text-[hsl(220,10%,45%)]">{exercise.machineBrand}</p>
            )}
            <p className="text-xs text-[hsl(220,10%,55%)] mb-2">{exercise.equipmentType}</p>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-[hsl(220,10%,45%)]">
                {totalSets} sets • {completedSets} logged
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp
                className={`w-5 h-5 ${
                  isComplete ? 'text-[hsl(227,100%,70%)]' : 'text-[hsl(220,10%,45%)]'
                }`}
              />
            ) : (
              <ChevronDown
                className={`w-5 h-5 ${
                  isComplete ? 'text-[hsl(227,100%,70%)]' : 'text-[hsl(220,10%,45%)]'
                }`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Sets Section */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-[hsl(47,20%,48%)] pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-[hsl(220,15%,18%)]">Sets</h4>
            <span className="text-xs text-[hsl(220,10%,45%)]">
              {completedSets}/{totalSets} logged
            </span>
          </div>

          <div className="space-y-3">
            {exercise.sets.map((set) => (
              <SetRow
                key={set.id}
                set={set}
                onComplete={(weight, reps) => onUpdateSet(set.id, weight, reps)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;

