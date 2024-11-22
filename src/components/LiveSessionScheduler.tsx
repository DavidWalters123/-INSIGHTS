import React, { useState } from 'react';
import { Calendar, Clock, Users } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import type { LiveSession } from '../types';

interface LiveSessionSchedulerProps {
  courseId: string;
  onSessionScheduled: () => void;
}

export default function LiveSessionScheduler({ courseId, onSessionScheduled }: LiveSessionSchedulerProps) {
  const [sessionData, setSessionData] = useState({
    title: '',
    description: '',
    start_time: '',
    duration: 60,
    max_participants: 100,
    meeting_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      const startTime = new Date(sessionData.start_time);
      
      await addDoc(collection(db, 'live_sessions'), {
        course_id: courseId,
        title: sessionData.title,
        description: sessionData.description,
        start_time: startTime,
        duration: sessionData.duration,
        host_id: auth.currentUser.uid,
        meeting_url: sessionData.meeting_url,
        max_participants: sessionData.max_participants,
        status: 'scheduled',
        participants: [],
        created_at: serverTimestamp()
      });

      toast.success('Live session scheduled successfully');
      onSessionScheduled();
    } catch (error) {
      console.error('Error scheduling session:', error);
      toast.error('Failed to schedule session');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300">
          Session Title
        </label>
        <input
          type="text"
          value={sessionData.title}
          onChange={(e) => setSessionData({ ...sessionData, title: e.target.value })}
          className="mt-1 block w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Description
        </label>
        <textarea
          value={sessionData.description}
          onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })}
          rows={3}
          className="mt-1 block w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Start Time
          </label>
          <input
            type="datetime-local"
            value={sessionData.start_time}
            onChange={(e) => setSessionData({ ...sessionData, start_time: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={sessionData.duration}
            onChange={(e) => setSessionData({ ...sessionData, duration: parseInt(e.target.value) })}
            min="15"
            step="15"
            className="mt-1 block w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Meeting URL
        </label>
        <input
          type="url"
          value={sessionData.meeting_url}
          onChange={(e) => setSessionData({ ...sessionData, meeting_url: e.target.value })}
          placeholder="https://zoom.us/j/..."
          className="mt-1 block w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Maximum Participants
        </label>
        <input
          type="number"
          value={sessionData.max_participants}
          onChange={(e) => setSessionData({ ...sessionData, max_participants: parseInt(e.target.value) })}
          min="1"
          className="mt-1 block w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
      >
        Schedule Session
      </button>
    </form>
  );
}