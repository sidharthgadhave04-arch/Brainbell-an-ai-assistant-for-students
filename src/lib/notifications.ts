export interface StudyPlanNotification {
  id: string;
  subject: string;
  examDate: string;
  notifiedAt1Hour: boolean;
  notifiedAt10Min: boolean;
}

export class NotificationManager {
  private static STORAGE_KEY = 'study_plan_notifications';
  
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
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

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'study-plan-reminder',
      requireInteraction: true,
      silent: false, // This ensures browser's native sound plays
      vibrate: [200, 100, 200], // Vibration pattern for mobile
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  static playNotificationSound() {
    try {
      // Use Web Audio API with a generated beep sound as fallback
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure the beep sound
      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';
      
      // Volume envelope
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

      // Check for 1 hour notification (60 minutes)
      if (!planState.notifiedAt1Hour && minutesUntilExam <= 60 && minutesUntilExam > 10) {
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

      // Check for 10 minute notification
      if (!planState.notifiedAt10Min && minutesUntilExam <= 10 && minutesUntilExam > 0) {
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
    });

    this.saveNotificationState(notificationState);
  }
}