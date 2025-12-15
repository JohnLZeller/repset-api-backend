import { useState, useEffect } from 'react'
import { api, TrainingPreferences } from '../utils/api'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

// Equipment type options matching backend enum
const EQUIPMENT_OPTIONS = [
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'plated', label: 'Plated' },
  { value: 'selectorized', label: 'Selectorized' },
  { value: 'spotter_recommended', label: 'Spotter Recommended' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'bodyweight', label: 'Bodyweight' },
] as const

// Exercise attribute options matching backend enum
const EXERCISE_ATTRIBUTE_OPTIONS = [
  { value: 'requires_partner', label: 'Requires Partner' },
  { value: 'high_impact', label: 'High Impact' },
  { value: 'requires_spotter', label: 'Requires Spotter' },
  { value: 'requires_platform', label: 'Requires Platform' },
  { value: 'requires_rack', label: 'Requires Rack' },
  { value: 'requires_bench', label: 'Requires Bench' },
  { value: 'requires_cable_machine', label: 'Requires Cable Machine' },
  { value: 'requires_pull_up_bar', label: 'Requires Pull-up Bar' },
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

  const toggleEquipment = (value: string) => {
    if (!preferences) return
    const current = preferences.excluded_equipment || []
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    setPreferences({ ...preferences, excluded_equipment: updated })
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

        {/* Excluded Equipment */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Excluded Equipment</Label>
          <p className="text-sm text-muted-foreground">
            Select equipment types to exclude from your workouts
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {EQUIPMENT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 p-2 rounded-md border border-input hover:bg-accent cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={preferences.excluded_equipment?.includes(option.value) || false}
                  onChange={() => toggleEquipment(option.value)}
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
        <div className="space-y-2">
          <Label htmlFor="sessions_per_week" className="text-base font-semibold">
            Sessions Per Week
          </Label>
          <Input
            id="sessions_per_week"
            type="number"
            min="1"
            value={preferences.sessions_per_week}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                sessions_per_week: parseInt(e.target.value) || 1,
              })
            }
          />
        </div>

        {/* Training Intensity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Training Intensity</Label>
            <span className="text-sm font-medium text-foreground">
              {preferences.training_intensity}/10
            </span>
          </div>
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
        <div className="space-y-2">
          <Label htmlFor="session_time_limit" className="text-base font-semibold">
            Session Time Limit (minutes)
          </Label>
          <Input
            id="session_time_limit"
            type="number"
            min="1"
            value={preferences.session_time_limit}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                session_time_limit: parseInt(e.target.value) || 1,
              })
            }
          />
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

