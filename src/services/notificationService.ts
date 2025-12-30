export interface NotificationPreferences {
  enabled: boolean;
  breakingNews: boolean;
  categories: string[];
  soundEnabled: boolean;
}

class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  async initialize() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.registration);
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    try {
      // Generate a VAPID key (in production, this should be your server's public key)
      const applicationServerKey = this.urlBase64ToUint8Array(
        'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM0DZm8HkwlJu2qGl_k8Fb2caJRbLlprCnFyJRvlLLgPnDZYPlP4XQ'
      );

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });

      console.log('Push subscription:', this.subscription);
      return this.subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      const result = await this.subscription.unsubscribe();
      this.subscription = null;
      return result;
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      return false;
    }
  }

  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  getPermission(): NotificationPermission {
    return Notification.permission;
  }

  savePreferences(preferences: NotificationPreferences) {
    localStorage.setItem('notification-preferences', JSON.stringify(preferences));
  }

  getPreferences(): NotificationPreferences {
    const saved = localStorage.getItem('notification-preferences');
    if (saved) {
      return JSON.parse(saved);
    }
    
    return {
      enabled: false,
      breakingNews: true,
      categories: ['all'],
      soundEnabled: true
    };
  }

  async showLocalNotification(title: string, options: NotificationOptions = {}) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const notificationService = new NotificationService();