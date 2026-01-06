"use client"

import { useState, useEffect } from 'react';

export default function ProfileStatsPage() {
  const [stats, setStats] = useState({
    currentStreak: 0,
    bestStreak: 0,
    totalStudyDays: 0,
    lastActivityDate: null,
    activityCalendar: {}
  });

  const [quote, setQuote] = useState({
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier"
  });

  // Prevent scrolling on body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Motivational quotes array
  const quotes = [
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Learning is not attained by chance, it must be sought for with ardor and attended to with diligence.", author: "Abigail Adams" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" }
  ];

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('brainbell_stats');
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      setStats(parsed);
      checkAndUpdateStreak(parsed);
    } else {
      // First time login - track activity
      trackActivity();
    }

    // Set random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  // Check and update streak on login
  const checkAndUpdateStreak = (currentStats) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (currentStats.lastActivityDate === today) {
      // Already logged in today
      return;
    }
    
    if (currentStats.lastActivityDate === yesterday) {
      // Logged in yesterday, continue streak
      trackActivity();
    } else if (currentStats.lastActivityDate && currentStats.lastActivityDate !== today) {
      // Missed a day, reset current streak but keep tracking
      const newStats = {
        ...currentStats,
        currentStreak: 1,
        lastActivityDate: today,
        activityCalendar: {
          ...currentStats.activityCalendar,
          [today]: (currentStats.activityCalendar[today] || 0) + 1
        },
        totalStudyDays: Object.keys({...currentStats.activityCalendar, [today]: 1}).length
      };
      setStats(newStats);
      localStorage.setItem('brainbell_stats', JSON.stringify(newStats));
    }
  };

  // Function to track activity when user logs in or uses features
  const trackActivity = () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    setStats(prevStats => {
      // If already tracked today, don't increase
      if (prevStats.lastActivityDate === today) {
        return prevStats;
      }
      
      const newStats = { ...prevStats };
      
      // Update activity calendar
      newStats.activityCalendar = {
        ...newStats.activityCalendar,
        [today]: (newStats.activityCalendar[today] || 0) + 1
      };
      
      // Update streaks
      if (prevStats.lastActivityDate === yesterday) {
        newStats.currentStreak = prevStats.currentStreak + 1;
      } else {
        newStats.currentStreak = 1;
      }
      
      // Update best streak
      if (newStats.currentStreak > newStats.bestStreak) {
        newStats.bestStreak = newStats.currentStreak;
      }
      
      // Update total study days
      newStats.totalStudyDays = Object.keys(newStats.activityCalendar).length;
      newStats.lastActivityDate = today;
      
      // Save to localStorage
      localStorage.setItem('brainbell_stats', JSON.stringify(newStats));
      
      return newStats;
    });
  };

  // Generate calendar grid
  const generateCalendar = () => {
    const year = new Date().getFullYear();
    const months = 12;
    const cells = [];
    
    for (let month = 0; month < months; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toDateString();
        const activity = stats.activityCalendar[dateString] || 0;
        
        cells.push({
          date: dateString,
          month: month,
          dayOfWeek: date.getDay(),
          activity: activity
        });
      }
    }
    
    return cells;
  };

  const calendarData = generateCalendar();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getActivityColor = (activity) => {
    if (activity === 0) return '#E8EFE5';
    if (activity <= 2) return '#D4E8C7';
    if (activity <= 5) return '#c1ff72';
    if (activity <= 10) return '#7fb236';
    return '#5A7C3A';
  };

  // Group calendar data by month and day of week
  const calendarGrid = [];
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    const row = [];
    for (let month = 0; month < 12; month++) {
      const cell = calendarData.find(d => d.month === month && d.dayOfWeek === dayOfWeek);
      row.push(cell);
    }
    calendarGrid.push(row);
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)] p-6" style={{ overflow: 'hidden', height: '100vh' }}>
      <div className="max-w-[1400px] mx-auto h-full" style={{ overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: '#2C5F5D',
              margin: '0 0 8px 0'
            }}>
              siddharth gadhave's Study Activity
            </h1>
          </div>
          <div style={{ color: '#5A7C7A', fontSize: '14px' }}>
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-[color:var(--card)]/60 backdrop-blur-sm rounded-lg p-8 mb-6 border border-[color:var(--border)]">
          <h2 className="text-[18px] font-semibold text-[color:var(--card-foreground)] mb-6">
            Your Study Contributions
          </h2>

          <div style={{ overflowX: 'hidden', overflowY: 'hidden' }}>
            {/* Month labels */}
            <div className="flex mb-2 ml-12">
              {months.map((month) => (
                <div key={month} style={{ 
                  flex: '1',
                  fontSize: '11px',
                  color: 'var(--muted-foreground)',
                  fontWeight: '500',
                  textAlign: 'center',
                  minWidth: '60px'
                }}>
                  {month}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'flex' }}>
              {/* Day labels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginRight: '8px' }}>
                {days.map(day => (
                  <div key={day} style={{ 
                    fontSize: '11px',
                    color: '#5A7C7A',
                    fontWeight: '500',
                    height: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '42px'
                  }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid cells */}
              <div style={{ display: 'flex', gap: '3px' }}>
                {months.map((month, monthIdx) => (
                  <div key={month} style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '60px' }}>
                    {days.map((day, dayIdx) => {
                      const cell = calendarData.find(d => d.month === monthIdx && d.dayOfWeek === dayIdx);
                      return (
                        <div
                          key={`${month}-${day}`}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '2px',
                            backgroundColor: cell ? getActivityColor(cell.activity) : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          title={cell ? `${cell.date}: ${cell.activity} activities` : ''}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '16px'
            }}>
              <span style={{ fontSize: '11px', color: '#5A7C7A' }}>Less</span>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#E8EFE5', borderRadius: '2px' }}></div>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#D4E8C7', borderRadius: '2px' }}></div>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#c1ff72', borderRadius: '2px' }}></div>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#7fb236', borderRadius: '2px' }}></div>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#5A7C3A', borderRadius: '2px' }}></div>
              <span style={{ fontSize: '11px', color: '#5A7C7A' }}>More</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid rgba(44, 95, 93, 0.2)'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#2C5F5D',
              marginBottom: '16px'
            }}>
              Current Streak
            </h3>
            <p style={{ 
              fontSize: '36px', 
              fontWeight: 'bold', 
              color: '#2C5F5D',
              margin: 0
            }}>
              {stats.currentStreak} days
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid rgba(44, 95, 93, 0.2)'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#2C5F5D',
              marginBottom: '16px'
            }}>
              Total Study Days
            </h3>
            <p style={{ 
              fontSize: '36px', 
              fontWeight: 'bold', 
              color: '#2C5F5D',
              margin: 0
            }}>
              {stats.totalStudyDays} days
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid rgba(44, 95, 93, 0.2)'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#2C5F5D',
              marginBottom: '16px'
            }}>
              Best Streak
            </h3>
            <p style={{ 
              fontSize: '36px', 
              fontWeight: 'bold', 
              color: '#2C5F5D',
              margin: 0
            }}>
              {stats.bestStreak} days
            </p>
          </div>
        </div>

        {/* Motivational Quote Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(193, 255, 114, 0.2) 0%, rgba(127, 178, 54, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '32px',
          border: '2px solid rgba(127, 178, 54, 0.3)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative quote marks */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '24px',
            fontSize: '48px',
            color: 'rgba(127, 178, 54, 0.2)',
            fontFamily: 'Georgia, serif',
            lineHeight: '1'
          }}>
            "
          </div>
          <div style={{
            position: 'absolute',
            bottom: '16px',
            right: '24px',
            fontSize: '48px',
            color: 'rgba(127, 178, 54, 0.2)',
            fontFamily: 'Georgia, serif',
            lineHeight: '1'
          }}>
            "
          </div>
          
          <p style={{
            fontSize: '20px',
            fontStyle: 'italic',
            color: '#2C5F5D',
            margin: '0 0 16px 0',
            fontWeight: '500',
            lineHeight: '1.6'
          }}>
            {quote.text}
          </p>
          <p style={{
            fontSize: '16px',
            color: '#5A7C7A',
            margin: 0,
            fontWeight: '600'
          }}>
            — {quote.author}
          </p>
        </div>
      </div>
    </div>
  );
}