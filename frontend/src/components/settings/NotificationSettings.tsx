import { useState } from 'react';
import { SettingsCard } from './SettingsCard';
import { SettingsRow } from './SettingsRow';
import { SettingsToggle } from './SettingsToggle';
import { Button } from '@/components/ui/button';

export default function NotificationSettings() {
  const [productUpdates, setProductUpdates] = useState(true);
  const [reminders, setReminders] = useState(true);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving notification settings', { productUpdates, reminders });
  };

  return (
    <div className="space-y-6">
      <SettingsCard>
        <div className="space-y-0">
          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <div className="font-bold mb-2">Transactional emails (password resets, email confirmations, etc.)</div>
            </div>
            <SettingsToggle checked={true} onCheckedChange={() => {}} disabled />
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

        <Button onClick={handleSave} className="w-full mt-8">
          Save Changes
        </Button>
      </SettingsCard>
    </div>
  );
}

