import { useState, useEffect } from 'react';
import { api, TrainingPreferences, ErrorResponse } from '../../utils/api';
import { SettingsCard } from './SettingsCard';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip } from '@/components/ui/tooltip';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Equipment modality options matching backend enum
const EQUIPMENT_MODALITY_OPTIONS = [
  { value: 'free_weights', label: 'Free Weights', description: 'Dumbbells, barbells, and other free-moving weights that require stabilization' },
  { value: 'machines', label: 'Machines', description: 'Fixed-path resistance machines that guide movement patterns' },
  { value: 'cables', label: 'Cables', description: 'Cable-based equipment providing variable resistance angles' },
  { value: 'bodyweight', label: 'Bodyweight', description: 'Exercises using only your body weight for resistance' },
  { value: 'bands_suspension', label: 'Bands / Suspension', description: 'Resistance bands and suspension trainers like TRX' },
] as const;

// Equipment station options matching backend enum
const EQUIPMENT_STATION_OPTIONS = [
  { value: 'rack', label: 'Rack', description: 'Power rack or squat rack for barbell exercises' },
  { value: 'bench', label: 'Bench', description: 'Flat, incline, or decline bench for pressing movements' },
  { value: 'pull_up_bar', label: 'Pull-up Bar', description: 'Overhead bar for pull-ups and hanging exercises' },
  { value: 'dip_station', label: 'Dip Station', description: 'Parallel bars for dips and bodyweight exercises' },
  { value: 'floor', label: 'Floor', description: 'Exercises performed on the floor or ground' },
] as const;

// Machine type options matching backend enum
const MACHINE_TYPE_OPTIONS = [
  { value: 'selectorized', label: 'Selectorized', description: 'Machines with weight stacks and pin-selector mechanisms' },
  { value: 'plate_loaded', label: 'Plate Loaded', description: 'Machines where you load weight plates directly onto the machine' },
  { value: 'smith', label: 'Smith Machine', description: 'Barbell fixed to vertical rails for guided movement' },
] as const;

// Exercise attribute options matching backend enum
const EXERCISE_ATTRIBUTE_OPTIONS = [
  { value: 'high_impact', label: 'High Impact', description: 'Exercises with significant impact on joints, like jumping or plyometrics' },
  { value: 'overhead', label: 'Overhead', description: 'Exercises performed with arms raised above the head' },
  { value: 'spotter_advised', label: 'Spotter Advised', description: 'Exercises that benefit from or require a spotter for safety' },
  { value: 'technically_complex', label: 'Technically Complex', description: 'Exercises requiring advanced technique and coordination' },
  { value: 'floor_required', label: 'Floor Required', description: 'Exercises that must be performed on the floor or ground' },
  { value: 'high_joint_stress', label: 'High Joint Stress', description: 'Exercises that place significant stress on joints' },
] as const;

export default function TrainingSettings() {
  const [preferences, setPreferences] = useState<TrainingPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [buttonSuccess, setButtonSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const data = await api.getTrainingPreferences();
      setPreferences(data);
    } catch (err) {
      console.error('Failed to load preferences', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;
    setSaving(true);
    setError(null);
    setButtonSuccess(false);
    
    try {
      await api.updateTrainingPreferences(preferences);
      setButtonSuccess(true);
      // Reset button success state after 2 seconds
      setTimeout(() => {
        setButtonSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      console.error('Failed to save preferences', err);
      const errorData: ErrorResponse = (err as { data?: ErrorResponse })?.data || {};
      setError(
        errorData.error ||
        errorData.detail?.toString() ||
        'Failed to save preferences. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleModality = (value: string) => {
    if (!preferences) return;
    const current = preferences.excluded_equipment_modalities || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setPreferences({ ...preferences, excluded_equipment_modalities: updated });
  };

  const toggleStation = (value: string) => {
    if (!preferences) return;
    const current = preferences.excluded_equipment_stations || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setPreferences({ ...preferences, excluded_equipment_stations: updated });
  };

  const toggleMachineType = (value: string) => {
    if (!preferences) return;
    const current = preferences.excluded_machine_types || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setPreferences({ ...preferences, excluded_machine_types: updated });
  };

  const toggleAttribute = (value: string) => {
    if (!preferences) return;
    const current = preferences.excluded_exercise_attributes || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setPreferences({ ...preferences, excluded_exercise_attributes: updated });
  };

  if (loading || !preferences) {
    return (
      <div className="space-y-6">
        <SettingsCard>
          <div className="text-center py-8">Loading...</div>
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsCard>
        {/* Error message */}
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center mb-6">
            {error}
          </div>
        )}

        {/* Sliders at the top */}
        <div className="space-y-6 mb-8">
          <div className="space-y-3">
            <Label>Sessions Per Week: {preferences.sessions_per_week}</Label>
            <Slider
              value={[preferences.sessions_per_week]}
              onValueChange={(value) =>
                setPreferences({ ...preferences, sessions_per_week: value[0] })
              }
              min={1}
              max={6}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <Label>Training Intensity: {preferences.training_intensity}</Label>
            <Slider
              value={[preferences.training_intensity]}
              onValueChange={(value) =>
                setPreferences({ ...preferences, training_intensity: value[0] })
              }
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <Label>Maximum Session Minutes: {preferences.max_session_mins}</Label>
            <Slider
              value={[preferences.max_session_mins]}
              onValueChange={(value) =>
                setPreferences({ ...preferences, max_session_mins: value[0] })
              }
              min={15}
              max={120}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {/* Exclusions - always visible */}
        <div className="space-y-6">
          {/* Excluded Equipment Modalities */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Excluded Equipment Modalities</Label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_MODALITY_OPTIONS.map((option) => {
                const isSelected =
                  preferences?.excluded_equipment_modalities?.includes(option.value) || false;
                return (
                  <Tooltip key={option.value} content={option.description}>
                    <button
                      type="button"
                      onClick={() => toggleModality(option.value)}
                      className={cn(
                        'relative px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        isSelected
                          ? 'bg-red-50 dark:bg-red-950/20 border-2 border-red-500 text-red-700 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      )}
                    >
                      {isSelected && (
                        <Check className="absolute top-1 left-1 w-4 h-4 text-red-500" />
                      )}
                      <span className={isSelected ? 'ml-4' : ''}>{option.label}</span>
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Excluded Equipment Stations */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Excluded Equipment Stations</Label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_STATION_OPTIONS.map((option) => {
                const isSelected =
                  preferences?.excluded_equipment_stations?.includes(option.value) || false;
                return (
                  <Tooltip key={option.value} content={option.description}>
                    <button
                      type="button"
                      onClick={() => toggleStation(option.value)}
                      className={cn(
                        'relative px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        isSelected
                          ? 'bg-red-50 dark:bg-red-950/20 border-2 border-red-500 text-red-700 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      )}
                    >
                      {isSelected && (
                        <Check className="absolute top-1 left-1 w-4 h-4 text-red-500" />
                      )}
                      <span className={isSelected ? 'ml-4' : ''}>{option.label}</span>
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Excluded Machine Types */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Excluded Machine Types</Label>
            <div className="flex flex-wrap gap-2">
              {MACHINE_TYPE_OPTIONS.map((option) => {
                const isSelected =
                  preferences?.excluded_machine_types?.includes(option.value) || false;
                return (
                  <Tooltip key={option.value} content={option.description}>
                    <button
                      type="button"
                      onClick={() => toggleMachineType(option.value)}
                      className={cn(
                        'relative px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        isSelected
                          ? 'bg-red-50 dark:bg-red-950/20 border-2 border-red-500 text-red-700 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      )}
                    >
                      {isSelected && (
                        <Check className="absolute top-1 left-1 w-4 h-4 text-red-500" />
                      )}
                      <span className={isSelected ? 'ml-4' : ''}>{option.label}</span>
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Excluded Exercise Attributes */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Excluded Exercise Attributes</Label>
            <div className="flex flex-wrap gap-2">
              {EXERCISE_ATTRIBUTE_OPTIONS.map((option) => {
                const isSelected =
                  preferences?.excluded_exercise_attributes?.includes(option.value) || false;
                return (
                  <Tooltip key={option.value} content={option.description}>
                    <button
                      type="button"
                      onClick={() => toggleAttribute(option.value)}
                      className={cn(
                        'relative px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        isSelected
                          ? 'bg-red-50 dark:bg-red-950/20 border-2 border-red-500 text-red-700 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      )}
                    >
                      {isSelected && (
                        <Check className="absolute top-1 left-1 w-4 h-4 text-red-500" />
                      )}
                      <span className={isSelected ? 'ml-4' : ''}>{option.label}</span>
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          className={cn(
            "w-full mt-8",
            buttonSuccess && "bg-green-600 hover:bg-green-700"
          )}
          disabled={saving}
          variant={buttonSuccess ? "default" : "default"}
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" />
              Saving...
            </>
          ) : buttonSuccess ? (
            <>
              <Check />
              Saved!
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </SettingsCard>
    </div>
  );
}

