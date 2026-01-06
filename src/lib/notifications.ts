export interface StudyPlanNotification {
  id: string;
  subject: string;
  examDate: string;
  notifiedAt1Hour: boolean;
  notifiedAt10Min: boolean;
}

export class NotificationManager {
  private static STORAGE_KEY = 'study_plan_notifications';
  private static PERMISSION_REQUESTED_KEY = 'notification_permission_requested';
  
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      // Check if we've already asked before to avoid annoying users
      const alreadyAsked = localStorage.getItem(this.PERMISSION_REQUESTED_KEY);
      
      if (!alreadyAsked) {
        localStorage.setItem(this.PERMISSION_REQUESTED_KEY, 'true');
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    }

    return false;
  }

  static async showNotification(title: string, body: string, playSound = true) {
    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // Play sound BEFORE showing notification for better timing
    if (playSound) {
      this.playNotificationSound();
    }

    try {
      // Use Service Worker for better reliability if available
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `study-reminder-${Date.now()}`, // Unique tag for each notification
          requireInteraction: true,
          silent: false,
          vibrate: [200, 100, 200], // Vibration pattern for mobile
          data: {
            url: window.location.origin,
            timestamp: Date.now()
          }
        });
        console.log('✅ Service Worker notification shown');
      } else {
        // Fallback to regular notification
        const notification = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `study-reminder-${Date.now()}`, // Unique tag for each notification
          requireInteraction: true,
          silent: false,
          vibrate: [200, 100, 200]
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        
        console.log('✅ Regular notification shown');
      }
    } catch (error) {
      console.error('❌ Error showing notification:', error);
    }
  }

  static playNotificationSound() {
    try {
      // Use Web Audio API with a generated beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure the beep sound - more pleasant tone
      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';
      
      // Volume envelope for smooth sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      console.log('✅ Notification sound played');
    } catch (error) {
      console.log('⚠️ Could not play notification sound:', error);
      
      // Fallback: Try to play MP3 if it exists
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.7;
        audio.play().catch(err => {
          console.log('MP3 fallback also failed:', err);
        });
      } catch (e) {
        console.log('Both sound methods failed');
      }
    }
  }

  static getNotificationState(): StudyPlanNotification[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static saveNotificationState(state: StudyPlanNotification[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving notification state:', error);
    }
  }

  static checkDeadlines(studyPlans: any[]) {
    const now = new Date();
    const notificationState = this.getNotificationState();

    console.log(`🔍 Checking ${studyPlans.length} study plans at ${now.toLocaleTimeString()}`);

    studyPlans.forEach(plan => {
      if (!plan.overview?.examDate) {
        console.log(`⚠️ Plan ${plan._id} missing exam date`);
        return;
      }

      // Parse the exam datetime
      const examDateTime = new Date(plan.overview.examDate);
      
      // Validate the date
      if (isNaN(examDateTime.getTime())) {
        console.log(`⚠️ Invalid date for plan ${plan._id}`);
        return;
      }

      const timeUntilExam = examDateTime.getTime() - now.getTime();
      const minutesUntilExam = Math.floor(timeUntilExam / (1000 * 60));

      console.log(`📅 ${plan.overview.subject}: ${minutesUntilExam} minutes until exam`);

      // Find or create notification state for this plan
      let planState = notificationState.find(n => n.id === plan._id);
      if (!planState) {
        planState = {
          id: plan._id,
          subject: plan.overview.subject,
          examDate: plan.overview.examDate,
          notifiedAt1Hour: false,
          notifiedAt10Min: false,
        };
        notificationState.push(planState);
      }

      // Check if date has changed (plan was updated)
      if (planState.examDate !== plan.overview.examDate) {
        console.log(`📝 Exam date changed for ${plan.overview.subject}, resetting notifications`);
        planState.examDate = plan.overview.examDate;
        planState.notifiedAt1Hour = false;
        planState.notifiedAt10Min = false;
      }

      // Check for 1 hour notification (between 55-65 minutes for 10-minute window)
      if (!planState.notifiedAt1Hour && minutesUntilExam <= 65 && minutesUntilExam >= 55) {
        const examTimeStr = examDateTime.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
        
        console.log('🔔 Triggering 1-hour notification');
        this.showNotification(
          '⏰ Exam in 1 Hour!',
          `Your ${plan.overview.subject} exam is at ${examTimeStr}. Time to prepare!`,
          true
        );
        planState.notifiedAt1Hour = true;
      }

      // Check for 10 minute notification (between 8-12 minutes for 4-minute window)
      if (!planState.notifiedAt10Min && minutesUntilExam <= 12 && minutesUntilExam >= 8) {
        const examTimeStr = examDateTime.toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });
        
        console.log('🔔 Triggering 10-minute notification');
        this.showNotification(
          '🚨 Exam in 10 Minutes!',
          `Your ${plan.overview.subject} exam is at ${examTimeStr}. Get ready!`,
          true
        );
        planState.notifiedAt10Min = true;
      }

      // Clean up old notifications (exams that have passed by more than 24 hours)
      if (minutesUntilExam < -1440) { // 24 hours ago
        console.log(`🗑️ Cleaning up old notification state for ${plan.overview.subject}`);
        const index = notificationState.findIndex(n => n.id === plan._id);
        if (index > -1) {
          notificationState.splice(index, 1);
        }
      }
    });

    this.saveNotificationState(notificationState);
  }

  // Method to register service worker
  static async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('✅ Service Worker registered successfully');
        return registration;
      } catch (error) {
        console.log('⚠️ Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  // Method to clear all notification states (useful for testing)
  static clearNotificationState() {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Notification state cleared');
  }
}