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
      <h2 className="text-2xl font-semibold text-center">Notification Settings</h2>
      
      <SettingsCard title="Notifications">
        <div className="space-y-0">
          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <div className="font-bold mb-2">Transactional emails</div>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Password reset</li>
                <li>Login confirmation</li>
              </ul>
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

