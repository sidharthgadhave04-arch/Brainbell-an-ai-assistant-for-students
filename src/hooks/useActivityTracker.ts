"use client"

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useActivityTracker() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      trackUserActivity();
    }
  }, [session, status]);

  const trackUserActivity = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    const savedStats = localStorage.getItem('brainbell_stats');
    
    if (!savedStats) {
      initializeStats(today);
      return;
    }

    const stats = JSON.parse(savedStats);
    
    if (stats.lastActivityDate === today) {
      return;
    }

    let newStreak = 1;
    if (stats.lastActivityDate === yesterday) {
      newStreak = (stats.currentStreak || 0) + 1;
    }

    const newStats = {
      currentStreak: newStreak,
      bestStreak: Math.max(stats.bestStreak || 0, newStreak),
      activityCalendar: {
        ...stats.activityCalendar,
        [today]: (stats.activityCalendar?.[today] || 0) + 1
      },
      totalStudyDays: Object.keys({ ...stats.activityCalendar, [today]: 1 }).length,
      lastActivityDate: today
    };

    localStorage.setItem('brainbell_stats', JSON.stringify(newStats));
  };

  const initializeStats = (today: string) => {
    const initialStats = {
      currentStreak: 1,
      bestStreak: 1,
      activityCalendar: { [today]: 1 },
      totalStudyDays: 1,
      lastActivityDate: today
    };
    localStorage.setItem('brainbell_stats', JSON.stringify(initialStats));
  };
}