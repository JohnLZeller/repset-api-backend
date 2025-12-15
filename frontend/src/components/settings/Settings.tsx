import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Dumbbell, LogOut, User, Settings as SettingsIcon, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AccountSettings from './AccountSettings';
import TrainingSettings from './TrainingSettings';
import NotificationSettings from './NotificationSettings';
import SecuritySettings from './SecuritySettings';

type SettingsPage = 'account' | 'training' | 'notifications' | 'security';

export default function Settings() {
  const { logout } = useAuth();
  const [activePage, setActivePage] = useState<SettingsPage>('account');

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { id: 'account' as SettingsPage, label: 'Account', icon: User },
    { id: 'training' as SettingsPage, label: 'Training', icon: SettingsIcon },
    { id: 'notifications' as SettingsPage, label: 'Notifications', icon: Bell },
    { id: 'security' as SettingsPage, label: 'Security', icon: Shield },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'account':
        return <AccountSettings />;
      case 'training':
        return <TrainingSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
              <Dumbbell className="w-6 h-6 text-primary" strokeWidth={2.5} />
              <h1 className="text-2xl font-bold text-foreground">RepSet</h1>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <a href="/">Home</a>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors",
                      activePage === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-1 max-w-3xl">
            {renderPage()}
          </div>
        </div>
      </main>
    </div>
  );
}

