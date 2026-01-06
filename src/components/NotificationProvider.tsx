'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { NotificationManager } from '@/lib/notifications';

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    if (!session?.user?.id) {
      // Clear interval if user logs out
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Request notification permission and setup
    const setupNotifications = async () => {
      // Register service worker first for better reliability
      await NotificationManager.registerServiceWorker();
      
      // Request notification permission
      const granted = await NotificationManager.requestPermission();
      if (granted) {
        console.log('✅ Notification permission granted');
        startNotificationChecks();
      } else {
        console.log('⚠️ Notification permission denied or not supported');
        // Still start checks in case permission is granted later
        startNotificationChecks();
      }
    };

    const startNotificationChecks = () => {
      // Check immediately on mount
      checkStudyPlans();

      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Check every minute (60 seconds)
      intervalRef.current = setInterval(() => {
        checkStudyPlans();
      }, 60000);
    };

    const checkStudyPlans = async () => {
      // Prevent concurrent checks
      if (isCheckingRef.current) {
        console.log('⏳ Check already in progress, skipping...');
        return;
      }

      isCheckingRef.current = true;

      try {
        console.log('🔄 Fetching study plans for deadline check...');
        const response = await fetch(`/api/study-plan?userId=${session.user.id}`, {
          // Add cache control to get fresh data
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        });

        if (!response.ok) {
          console.error('❌ Failed to fetch study plans:', response.status);
          return;
        }

        const data = await response.json();
        
        if (data.plans && Array.isArray(data.plans) && data.plans.length > 0) {
          console.log(`📚 Found ${data.plans.length} study plan(s), checking deadlines...`);
          NotificationManager.checkDeadlines(data.plans);
        } else {
          console.log('📭 No study plans found');
        }
      } catch (error) {
        console.error('❌ Error checking study plans:', error);
      } finally {
        isCheckingRef.current = false;
      }
    };

    setupNotifications();

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [session?.user?.id]); // Re-run if user session changes

  // Handle visibility change - check when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session?.user?.id) {
        console.log('👁️ Tab became visible, checking study plans...');
        
        // Check plans when user returns to the tab
        const checkOnVisible = async () => {
          try {
            const response = await fetch(`/api/study-plan?userId=${session.user.id}`, {
              cache: 'no-store',
            });
            if (response.ok) {
              const data = await response.json();
              if (data.plans && data.plans.length > 0) {
                NotificationManager.checkDeadlines(data.plans);
              }
            }
          } catch (error) {
            console.error('Error checking on visibility change:', error);
          }
        };
        
        checkOnVisible();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session?.user?.id]);

  return <>{children}</>;
}