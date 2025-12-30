import { useState, useEffect, useCallback } from 'react';
import { breakingNewsService } from '@/services/breakingNewsService';
import { notificationService, NotificationPreferences } from '@/services/notificationService';
import { NewsArticle } from '@/components/NewsCard';
import { useToast } from '@/hooks/use-toast';

export const useBreakingNews = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(notificationService.getPreferences());
  const { toast } = useToast();

  useEffect(() => {
    const checkSupportAndPermission = async () => {
      const supported = notificationService.isSupported();
      setIsSupported(supported);
      if (supported) {
        await notificationService.initialize();
        setPermission(notificationService.getPermission());
      }
    };
    checkSupportAndPermission();
  }, []);

  const startMonitoring = useCallback(() => {
    if (permission === 'granted' && preferences.enabled && preferences.breakingNews) {
      breakingNewsService.startMonitoring();
      setIsMonitoring(true);
    } else {
      breakingNewsService.stopMonitoring();
      setIsMonitoring(false);
    }
  }, [permission, preferences.enabled, preferences.breakingNews]);

  useEffect(() => {
    startMonitoring();
    return () => {
      breakingNewsService.stopMonitoring();
    };
  }, [startMonitoring]);

  const requestPermission = useCallback(async () => {
    try {
      const permissionResult = await notificationService.requestPermission();
      setPermission(permissionResult);
      if (permissionResult === 'granted') {
        startMonitoring(); // Restart monitoring with new permission
      } else {
        breakingNewsService.stopMonitoring();
        setIsMonitoring(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }, [startMonitoring]);

  const updatePreferences = useCallback((newPreferences: NotificationPreferences) => {
    notificationService.savePreferences(newPreferences);
    setPreferences(newPreferences);
    // Re-evaluate monitoring status based on new preferences
    if (newPreferences.enabled && newPreferences.breakingNews) {
      if (permission === 'granted') {
        breakingNewsService.startMonitoring();
        setIsMonitoring(true);
      } // else: permission not yet granted, will start when it is
    } else {
      breakingNewsService.stopMonitoring();
      setIsMonitoring(false);
    }
  }, [permission]);


  const breakingNews = breakingNewsService.getBreakingNews();
  const isArticleBreaking = (articleId: string) => breakingNewsService.isBreakingNews(articleId);

  const refreshBreakingNews = useCallback(async () => {
    await breakingNewsService.checkForBreakingNews();
    // Here, you might want to force a re-render if the breaking news list is updated internally
    // For now, we assume the service updates a shared state or the component re-renders due to other factors.
    toast({
      title: "Breaking News Refreshed",
      description: "The latest breaking news has been fetched.",
    });
  }, [toast]);

  const testNotification = useCallback(() => {
    notificationService.showLocalNotification('Test Notification', {
      body: 'This is a test of the breaking news notification system.',
    });
    toast({
      title: "Test Notification Sent",
      description: "Check your system notifications.",
    });
  }, [toast]);


  return {
    isSupported,
    permission,
    isMonitoring,
    preferences,
    breakingNews,
    isArticleBreaking,
    requestPermission,
    updatePreferences,
    testNotification,
    refreshBreakingNews,
  };
};