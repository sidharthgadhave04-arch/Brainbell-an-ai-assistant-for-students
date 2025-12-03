'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { NotificationManager } from '@/lib/notifications';

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    // Request notification permission on mount
    const setupNotifications = async () => {
      const granted = await NotificationManager.requestPermission();
      if (granted) {
        console.log('✅ Notification permission granted');
        startNotificationChecks();
      } else {
        console.log('⚠️ Notification permission denied');
      }
    };

    const startNotificationChecks = () => {
      // Check immediately
      checkStudyPlans();

      // Then check every minute
      const interval = setInterval(() => {
        checkStudyPlans();
      }, 60000); // 60 seconds

      return () => clearInterval(interval);
    };

    const checkStudyPlans = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/study-plan?userId=${session.user.id}`);
        if (!response.ok) return;

        const data = await response.json();
        if (data.plans && data.plans.length > 0) {
          NotificationManager.checkDeadlines(data.plans);
        }
      } catch (error) {
        console.error('Error checking study plans:', error);
      }
    };

    if (session?.user?.id) {
      setupNotifications();
    }
  }, [session]);

  return <>{children}</>;
}


// ==========================================
// FILE 3: app/layout.tsx (MODIFICATION)
// Add NotificationProvider wrapper
// ==========================================
/*
INSTRUCTION: In your app/layout.tsx, wrap your existing content with NotificationProvider

Example:

import NotificationProvider from '@/components/NotificationProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
*/


// ==========================================
// FILE 4: public/service-worker.js (OPTIONAL)
// For background notifications even when tab is closed
// ==========================================
/*
// Save this as: public/service-worker.js

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Periodic background sync (requires registration)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-deadlines') {
    event.waitUntil(checkStudyPlanDeadlines());
  }
});

async function checkStudyPlanDeadlines() {
  // This would need to be implemented with your backend
  console.log('Checking deadlines in background...');
}
*/


// ==========================================
// TESTING COMPONENT (Optional)
// Use this to test notifications manually
// ==========================================
/*
'use client';

import { NotificationManager } from '@/lib/notifications';

export default function TestNotifications() {
  const testNotification = () => {
    NotificationManager.showNotification(
      '🔔 Test Notification',
      'This is a test notification with sound!',
      true
    );
  };

  return (
    <button
      onClick={testNotification}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
    >
      Test Notification
    </button>
  );
}
*/
