'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface StudyPlanFormProps {
  onPlanCreated?: () => void;
}

export default function StudyPlanForm({ onPlanCreated }: StudyPlanFormProps) {
  const { data: session } = useSession();
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('09:00'); // Default time
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      setError('You must be logged in to create a study plan');
      return;
    }

    if (!subject || !examDate || !examTime) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Combine date and time into a single datetime string
      const examDateTime = `${examDate}T${examTime}:00`;
      
      console.log('Creating study plan with:', {
        userId: session.user.id,
        subject,
        examDateTime,
      });

      const response = await fetch('/api/study-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          subject,
          examDate: examDateTime, // Send combined datetime
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create study plan');
      }

      setSuccess('Study plan created successfully!');
      setSubject('');
      setExamDate('');
      setExamTime('09:00');
      
      if (onPlanCreated) {
        onPlanCreated();
      }
    } catch (err: any) {
      console.error('Error creating plan:', err);
      setError(err.message || 'Failed to create study plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            {success}
          </div>
        )}

        {/* Form Fields Container */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Subject Input */}
          <div className="flex-1">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter your study topic..."
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
              disabled={loading}
            />
          </div>

          {/* Date & Time Container */}
          <div className="flex gap-2">
            {/* Date Picker */}
            <div className="relative">
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Time Picker */}
            <div className="relative">
              <input
                type="time"
                value={examTime}
                onChange={(e) => setExamTime(e.target.value)}
                className="px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading || !subject || !examDate || !examTime}
            className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg shadow-lg"
          >
            {loading ? 'Creating...' : 'Create Study Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}