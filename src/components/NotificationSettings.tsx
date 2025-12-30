import { useState } from 'react';
import { Bell, BellOff, Settings, TestTube, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useBreakingNews } from '@/hooks/useBreakingNews';
import { useTranslation } from '@/hooks/useTranslation';

interface NotificationSettingsProps {
  onClose?: () => void;
}

export const NotificationSettings = ({ onClose }: NotificationSettingsProps) => {
  const {
    isSupported,
    permission,
    preferences,
    isMonitoring,
    requestPermission,
    updatePreferences,
    testNotification
  } = useBreakingNews();

  const [localPreferences, setLocalPreferences] = useState(preferences);

  const { translatedText: title } = useTranslation('Notification Settings');
  const { translatedText: description } = useTranslation('Configure your breaking news alerts and preferences');
  const { translatedText: enableLabel } = useTranslation('Enable Notifications');
  const { translatedText: breakingLabel } = useTranslation('Breaking News Alerts');
  const { translatedText: soundLabel } = useTranslation('Sound Notifications');
  const { translatedText: testLabel } = useTranslation('Test Notification');
  const { translatedText: saveLabel } = useTranslation('Save Settings');
  const { translatedText: statusLabel } = useTranslation('Status');
  const { translatedText: monitoringLabel } = useTranslation('Monitoring');
  const { translatedText: notSupportedLabel } = useTranslation('Not Supported');
  const { translatedText: permissionLabel } = useTranslation('Permission');
  const { translatedText: enablePermissionLabel } = useTranslation('Enable Permission');

  const handleSwitchChange = (field: keyof typeof localPreferences, value: boolean) => {
    const newPreferences = { ...localPreferences, [field]: value };
    setLocalPreferences(newPreferences);
    // Immediately update preferences to start/stop monitoring
    updatePreferences(newPreferences);
  };

  const handleSave = () => {
    onClose?.();
  };

  const handleEnablePermission = async () => {
    await requestPermission();
  };

  const getStatusBadge = () => {
    if (!isSupported) {
      return <Badge variant="secondary">{notSupportedLabel}</Badge>;
    }
    
    if (permission === 'denied') {
      return <Badge variant="destructive">Blocked</Badge>;
    }

    if (permission === 'prompt') {
        return <Badge variant="secondary">Requires Action</Badge>;
    }
    
    if (isMonitoring) {
      return <Badge variant="default" className="bg-green-600">Active</Badge>;
    }
    
    return <Badge variant="secondary">{preferences.enabled ? 'Enabled' : 'Disabled'}</Badge>;
  };

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <CardTitle>{title}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {permission === 'denied' ? (
          <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-3 text-red-600" />
              <div>
                <Label className="text-sm font-medium text-red-800 dark:text-red-200">Permissions Blocked</Label>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  To enable notifications, you must update your browser settings. 
                  Click the lock icon in the address bar and set Notifications to "Allow".
                </p>
              </div>
            </div>
          </div>
        ) : permission === 'prompt' ? (
            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between">
                <div>
                    <Label className="text-sm font-medium">{permissionLabel}</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                    Notifications need to be enabled to receive alerts.
                    </p>
                </div>
                <Button 
                    onClick={handleEnablePermission}
                    size="sm"
                    variant="outline"
                >
                    <Bell className="h-4 w-4 mr-1" />
                    {enablePermissionLabel}
                </Button>
                </div>
            </div>
        ) : null}

        {/* Notification Controls */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-notifications" className="text-sm font-medium">
                {enableLabel}
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive push notifications for news updates
              </p>
            </div>
            <Switch
              id="enable-notifications"
              checked={preferences.enabled && permission === 'granted'}
              onCheckedChange={(checked) => handleSwitchChange('enabled', checked)}
              disabled={permission !== 'granted'}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="breaking-news" className="text-sm font-medium">
                {breakingLabel}
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified about urgent breaking news
              </p>
            </div>
            <Switch
              id="breaking-news"
              checked={preferences.breakingNews}
              onCheckedChange={(checked) => handleSwitchChange('breakingNews', checked)}
              disabled={!preferences.enabled || permission !== 'granted'}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound-notifications" className="text-sm font-medium">
                {soundLabel}
              </Label>
              <p className="text-xs text-muted-foreground">
                Play sound when notifications arrive
              </p>
            </div>
            <Switch
              id="sound-notifications"
              checked={preferences.soundEnabled}
              onCheckedChange={(checked) => handleSwitchChange('soundEnabled', checked)}
              disabled={!preferences.enabled || permission !== 'granted'}
            />
          </div>
        </div>

        <Separator />

        {/* Test and Save Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={testNotification}
            variant="outline"
            size="sm"
            disabled={permission !== 'granted' || !preferences.enabled}
            className="flex-1"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {testLabel}
          </Button>
          
          <Button
            onClick={handleSave}
            size="sm"
            className="flex-1"
          >
            {saveLabel}
          </Button>
        </div>

        {/* Status Information */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>{statusLabel}:</span>
            <span>{permission}</span>
          </div>
          <div className="flex justify-between">
            <span>{monitoringLabel}:</span>
            <span>{isMonitoring ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};