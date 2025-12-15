import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SettingsCard } from './SettingsCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function AccountSettings() {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.email?.split('@')[0] || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving account settings', { username, fullName, email });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center">Account Settings</h2>
      
      <SettingsCard title="Profile Information">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </div>
      </SettingsCard>
    </div>
  );
}

