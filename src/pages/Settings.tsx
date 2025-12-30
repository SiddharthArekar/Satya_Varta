import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ArrowLeft, Bell, Globe, Palette, Settings as SettingsIcon, Shield, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState({
    browser: true,
    breaking: true,
    daily: false,
    email: false
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState('5');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [dataUsage, setDataUsage] = useState('standard');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { theme } = useTheme();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setNotifications(settings.notifications || notifications);
        setAutoRefresh(settings.autoRefresh ?? true);
        setAutoRefreshInterval(settings.autoRefreshInterval || '5');
        setSoundEnabled(settings.soundEnabled ?? false);
        setDataUsage(settings.dataUsage || 'standard');
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      notifications,
      autoRefresh,
      autoRefreshInterval,
      soundEnabled,
      dataUsage,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('app-settings', JSON.stringify(settings));
    toast({
      title: "Settings saved",
      description: "Your preferences have been saved successfully.",
    });
  };

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Notifications enabled",
          description: "You'll now receive browser notifications for breaking news.",
        });
      } else {
        toast({
          title: "Notifications denied",
          description: "Please enable notifications in your browser settings to receive alerts.",
          variant: "destructive",
        });
      }
    }
  };

  const clearCache = () => {
    localStorage.removeItem('cached-summaries');
    localStorage.removeItem('cached-translations');
    toast({
      title: "Cache cleared",
      description: "Application cache has been cleared successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Customize your app experience and preferences.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how the app looks and feels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color theme
                  </p>
                </div>
                <ThemeToggle />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Language</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred language for news translation
                  </p>
                </div>
                <LanguageSelector />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Control when and how you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications in your browser
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={notifications.browser}
                    onCheckedChange={(checked) => handleNotificationChange('browser', checked)}
                  />
                  {!notifications.browser && (
                    <Button size="sm" variant="outline" onClick={requestNotificationPermission}>
                      Enable
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Breaking News Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified immediately for breaking news
                  </p>
                </div>
                <Switch
                  checked={notifications.breaking}
                  onCheckedChange={(checked) => handleNotificationChange('breaking', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Daily Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily news summary
                  </p>
                </div>
                <Switch
                  checked={notifications.daily}
                  onCheckedChange={(checked) => handleNotificationChange('daily', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notification Sounds</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for notifications
                  </p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* App Behavior */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                App Behavior
              </CardTitle>
              <CardDescription>
                Configure how the app functions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto Refresh</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically refresh news articles
                  </p>
                </div>
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>

              {autoRefresh && (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Refresh Interval</Label>
                    <p className="text-sm text-muted-foreground">
                      How often to check for new articles
                    </p>
                  </div>
                  <Select value={autoRefreshInterval} onValueChange={setAutoRefreshInterval}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minute</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Data Usage</Label>
                  <p className="text-sm text-muted-foreground">
                    Control image and media quality
                  </p>
                </div>
                <Select value={dataUsage} onValueChange={setDataUsage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Data
              </CardTitle>
              <CardDescription>
                Manage your data and privacy settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Clear Cache</Label>
                  <p className="text-sm text-muted-foreground">
                    Clear stored summaries and translations
                  </p>
                </div>
                <Button variant="outline" onClick={clearCache}>
                  Clear Cache
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-base">Current Settings</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Theme: {theme}</Badge>
                  <Badge variant="secondary">Language: {currentLanguage.name}</Badge>
                  <Badge variant="secondary">
                    Notifications: {notifications.browser ? 'On' : 'Off'}
                  </Badge>
                  <Badge variant="secondary">
                    Auto Refresh: {autoRefresh ? `${autoRefreshInterval}min` : 'Off'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveSettings} size="lg">
              Save All Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
