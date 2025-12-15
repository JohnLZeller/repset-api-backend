import { useState, useEffect } from 'react';
import { api, TrainingPreferences } from '../../utils/api';
import { SettingsCard } from './SettingsCard';
import { SettingsRow } from './SettingsRow';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function TrainingSettings() {
  const [preferences, setPreferences] = useState<TrainingPreferences | null>(null);
  const [loading, setLoading] = useState(true);

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
    try {
      await api.updateTrainingPreferences(preferences);
    } catch (err) {
      console.error('Failed to save preferences', err);
    }
  };

  const handleModalTrigger = (type: string) => {
    // Placeholder for modal handlers
    console.log('Opening modal for:', type);
  };

  if (loading || !preferences) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">Training Settings</h2>
        <SettingsCard>
          <div className="text-center py-8">Loading...</div>
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center">Training Settings</h2>
      
      <SettingsCard title="Training Preferences">
        <div className="space-y-0">
          <SettingsRow
            label="Excluded Equipment Modalities"
            showArrow
            onClick={() => handleModalTrigger('equipment_modalities')}
          />
          <div className="border-b border-border" />
          
          <SettingsRow
            label="Excluded Equipment Stations"
            showArrow
            onClick={() => handleModalTrigger('equipment_stations')}
          />
          <div className="border-b border-border" />
          
          <SettingsRow
            label="Excluded Machine Types"
            showArrow
            onClick={() => handleModalTrigger('machine_types')}
          />
          <div className="border-b border-border" />
          
          <SettingsRow
            label="Excluded Exercise Attributes"
            showArrow
            onClick={() => handleModalTrigger('exercise_attributes')}
          />
        </div>

        <div className="mt-8 space-y-6">
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

        <Button onClick={handleSave} className="w-full mt-8">
          Save Changes
        </Button>
      </SettingsCard>
    </div>
  );
}

