import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { Calendar, Plus, Loader, MapPin, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface CommunityEventsProps {
  communityId: string;
  isAdmin: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  duration: number;
  created_at: any;
  created_by: string;
  community_id: string;
}

export default function CommunityEvents({ communityId, isAdmin }: CommunityEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    duration: 60
  });

  useEffect(() => {
    loadEvents();
  }, [communityId]);

  async function loadEvents() {
    try {
      const q = query(
        collection(db, 'events'),
        where('community_id', '==', communityId),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q).catch(error => {
        handleFirestoreError(error, 'Failed to load events');
        return null;
      });

      if (!snapshot) {
        setEvents([]);
        return;
      }

      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()
      })) as Event[];

      setEvents(eventsData);
    } catch (error) {
      handleFirestoreError(error, 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, 'events'), {
        ...formData,
        date: new Date(formData.date),
        community_id: communityId,
        created_by: auth.currentUser.uid,
        created_at: serverTimestamp()
      });

      toast.success('Event created successfully');
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        duration: 60
      });
      setShowForm(false);
      loadEvents();
    } catch (error) {
      handleFirestoreError(error, 'Failed to create event');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Upcoming Events</h2>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Event
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-surface-light rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                min="15"
                step="15"
                className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Online or physical location"
              className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
            >
              Create Event
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-surface border border-surface-light rounded-lg p-6"
          >
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-white">
                  {event.title}
                </h3>
                <p className="mt-2 text-gray-300">{event.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(event.date, 'PPp')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {event.duration} minutes
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {event.location}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Calendar className="h-8 w-8 mx-auto mb-2" />
            <p>No upcoming events</p>
          </div>
        )}
      </div>
    </div>
  );
}