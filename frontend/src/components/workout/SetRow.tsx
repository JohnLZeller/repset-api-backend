import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Weight, RotateCcw, Clock } from 'lucide-react';
import { Set } from '@/types/workout';

interface SetRowProps {
  set: Set;
  onComplete: (weight: number, reps: number) => void;
  disabled?: boolean;
}

const SetRow = ({ set, onComplete, disabled = false }: SetRowProps) => {
  const [weight, setWeight] = useState<string>(
    set.actualWeight?.toString() ?? set.targetWeight.toString()
  );
  const [reps, setReps] = useState<string>(
    set.actualReps?.toString() ?? set.targetReps.toString()
  );

  const isLogged = set.actualWeight !== undefined && set.actualReps !== undefined;

  const handleComplete = () => {
    const w = parseInt(weight) || set.targetWeight;
    const r = parseInt(reps) || set.targetReps;
    onComplete(w, r);
  };

  return (
    <div
      className={`rounded-xl border p-3 transition-all ${
        isLogged
          ? 'bg-[hsl(227,100%,97%)] border-[hsl(227,100%,80%)]'
          : 'bg-white border-[hsl(47,20%,48%)]'
      }`}
    >
      {/* Compact header row with set number, target, and rest */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            isLogged
              ? 'bg-[hsl(227,100%,58%)] text-white'
              : 'bg-gray-100 text-[hsl(220,15%,18%)]'
          }`}
        >
          {isLogged ? <Check className="w-3.5 h-3.5" /> : set.setNumber}
        </div>
        <span className="px-2 py-0.5 bg-[hsl(47,100%,90%)] rounded text-xs text-[hsl(220,15%,18%)] font-medium">
          {set.targetWeight} lb × {set.targetReps} reps
        </span>
        <div className="flex items-center gap-1 text-xs text-[hsl(220,10%,45%)] ml-auto">
          <Clock className="w-3 h-3" />
          {set.restSeconds}s
        </div>
      </div>

      {/* Input Row */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="relative">
            <Weight className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(220,10%,45%)]" />
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="lb"
              disabled={disabled || isLogged}
              className="w-full h-9 pl-8 pr-2 rounded-lg border border-[hsl(47,20%,48%)] text-center text-sm font-semibold text-[hsl(220,15%,18%)] focus:outline-none focus:ring-2 focus:ring-[hsl(227,100%,58%)]/20 focus:border-[hsl(227,100%,58%)] disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="relative">
            <RotateCcw className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(220,10%,45%)]" />
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="reps"
              disabled={disabled || isLogged}
              className="w-full h-9 pl-8 pr-2 rounded-lg border border-[hsl(47,20%,48%)] text-center text-sm font-semibold text-[hsl(220,15%,18%)] focus:outline-none focus:ring-2 focus:ring-[hsl(227,100%,58%)]/20 focus:border-[hsl(227,100%,58%)] disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
        {!disabled && (
          <Button
            size="sm"
            onClick={handleComplete}
            disabled={isLogged}
            className="h-9 px-3 bg-[hsl(227,100%,58%)] hover:bg-[hsl(227,100%,50%)] disabled:opacity-50"
          >
            {isLogged ? <Check className="w-4 h-4" /> : 'Log'}
          </Button>
        )}
        {disabled && isLogged && (
          <div className="h-9 px-3 flex items-center justify-center text-[hsl(227,100%,58%)]">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SetRow;


