import { useState } from 'react';
import { SettingsCard } from './SettingsCard';
import { SettingsToggle } from './SettingsToggle';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationSettings() {
  const [productUpdates, setProductUpdates] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [buttonSuccess, setButtonSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setButtonSuccess(false);
    
    try {
      // TODO: Implement save functionality
      console.log('Saving notification settings', { productUpdates, reminders });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setButtonSuccess(true);
      // Reset button success state after 2 seconds
      setTimeout(() => {
        setButtonSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to save notification settings', err);
      setError('Failed to save notification settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsCard>
        {/* Error message */}
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center mb-6">
            {error}
          </div>
        )}

        <div className="space-y-0">
          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <div className="font-bold mb-2">Transactional emails</div>
            </div>
            <Tooltip content="Transactional emails are required for account security and cannot be disabled. They include password resets, email confirmations, and other essential account notifications.">
              <div>
                <SettingsToggle checked={true} onCheckedChange={() => {}} disabled />
              </div>
            </Tooltip>
          </div>
          
          <div className="border-b border-border" />
          
          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <span className="font-bold">Product updates</span>
            </div>
            <SettingsToggle
              checked={productUpdates}
              onCheckedChange={setProductUpdates}
            />
          </div>
          
          <div className="border-b border-border" />
          
          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <span className="font-bold">Reminders</span>
            </div>
            <SettingsToggle
              checked={reminders}
              onCheckedChange={setReminders}
            />
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

