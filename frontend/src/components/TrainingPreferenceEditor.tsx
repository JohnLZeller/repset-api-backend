import { useState, useEffect } from 'react'
import { api, TrainingPreferences } from '../utils/api'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

// Equipment modality options matching backend enum
const EQUIPMENT_MODALITY_OPTIONS = [
  { value: 'free_weights', label: 'Free Weights' },
  { value: 'machines', label: 'Machines' },
  { value: 'cables', label: 'Cables' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'bands_suspension', label: 'Bands / Suspension' },
] as const

// Equipment station options matching backend enum
const EQUIPMENT_STATION_OPTIONS = [
  { value: 'rack', label: 'Rack' },
  { value: 'bench', label: 'Bench' },
  { value: 'pull_up_bar', label: 'Pull-up Bar' },
  { value: 'dip_station', label: 'Dip Station' },
  { value: 'floor', label: 'Floor' },
] as const

// Machine type options matching backend enum
const MACHINE_TYPE_OPTIONS = [
  { value: 'selectorized', label: 'Selectorized' },
  { value: 'plate_loaded', label: 'Plate Loaded' },
  { value: 'smith', label: 'Smith Machine' },
] as const

// Exercise attribute options matching backend enum
const EXERCISE_ATTRIBUTE_OPTIONS = [
  { value: 'high_impact', label: 'High Impact' },
  { value: 'overhead', label: 'Overhead' },
  { value: 'spotter_advised', label: 'Spotter Advised' },
  { value: 'technically_complex', label: 'Technically Complex' },
  { value: 'floor_required', label: 'Floor Required' },
  { value: 'high_joint_stress', label: 'High Joint Stress' },
] as const

export default function TrainingPreferenceEditor() {
  const [preferences, setPreferences] = useState<TrainingPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getTrainingPreferences()
      setPreferences(data)
    } catch (err: any) {
      setError(err.data?.error || 'Failed to load preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!preferences) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)
      await api.updateTrainingPreferences(preferences)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.data?.error || 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const toggleModality = (value: string) => {
    if (!preferences) return
    const current = preferences.excluded_equipment_modalities || []
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    setPreferences({ ...preferences, excluded_equipment_modalities: updated })
  }

  const toggleStation = (value: string) => {
    if (!preferences) return
    const current = preferences.excluded_equipment_stations || []
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    setPreferences({ ...preferences, excluded_equipment_stations: updated })
  }

  const toggleMachineType = (value: string) => {
    if (!preferences) return
    const current = preferences.excluded_machine_types || []
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    setPreferences({ ...preferences, excluded_machine_types: updated })
  }

  const toggleAttribute = (value: string) => {
    if (!preferences) return
    const current = preferences.excluded_exercise_attributes || []
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    setPreferences({ ...preferences, excluded_exercise_attributes: updated })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading preferences...</span>
        </CardContent>
      </Card>
    )
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <span>Failed to load preferences</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">Preferences saved successfully!</span>
          </div>
        )}

        {/* Excluded Equipment Modalities */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Excluded Equipment Modalities</Label>
          <p className="text-sm text-muted-foreground">
            Select how resistance is applied to exclude from your workouts
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {EQUIPMENT_MODALITY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 p-2 rounded-md border border-input hover:bg-accent cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={preferences.excluded_equipment_modalities?.includes(option.value) || false}
                  onChange={() => toggleModality(option.value)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Excluded Equipment Stations */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Excluded Equipment Stations</Label>
          <p className="text-sm text-muted-foreground">
            Select fixed stations or fixtures to exclude from your workouts
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {EQUIPMENT_STATION_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 p-2 rounded-md border border-input hover:bg-accent cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={preferences.excluded_equipment_stations?.includes(option.value) || false}
                  onChange={() => toggleStation(option.value)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Excluded Machine Types */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Excluded Machine Types</Label>
          <p className="text-sm text-muted-foreground">
            Select machine loading styles to exclude from your workouts
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MACHINE_TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 p-2 rounded-md border border-input hover:bg-accent cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={preferences.excluded_machine_types?.includes(option.value) || false}
                  onChange={() => toggleMachineType(option.value)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Excluded Exercise Attributes */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Excluded Exercise Attributes</Label>
          <p className="text-sm text-muted-foreground">
            Select exercise attributes to exclude from your workouts
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {EXERCISE_ATTRIBUTE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 p-2 rounded-md border border-input hover:bg-accent cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={
                    preferences.excluded_exercise_attributes?.includes(option.value) || false
                  }
                  onChange={() => toggleAttribute(option.value)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sessions Per Week */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Sessions Per Week: {preferences.sessions_per_week}
          </Label>
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
          <p className="text-sm text-muted-foreground">
            Number of training sessions per week
          </p>
        </div>

        {/* Training Intensity */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Training Intensity: {preferences.training_intensity}
          </Label>
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
          <p className="text-sm text-muted-foreground">
            Adjust your preferred training intensity level (1 = low, 10 = high)
          </p>
        </div>

        {/* Session Time Limit */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Session Time Limit (minutes): {preferences.max_session_mins}
          </Label>
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
          <p className="text-sm text-muted-foreground">
            Maximum duration for each training session
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

