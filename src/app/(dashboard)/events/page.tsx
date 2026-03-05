"use client"

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, BarChart3, Plus } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import CreateEventForm from "@/components/events/CreateEventForm";
import EventCalendar from "@/components/events/EventCalendar";
import EventAnalytics from "@/components/events/EventAnalytics";
import RegistrationModal from "@/components/events/RegistrationModal";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  category: string;
  created_by: string;
  status: 'pending' | 'approved' | 'rejected';
  attendees: any[];
  feedback: Array<{
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  organizerEmail?: string;
  organizerRole?: string;
  createdAt: string;
  updatedAt: string;
}

const ITEMS_PER_PAGE = 6;

export default function EventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('approved');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState<'student' | 'organizer' | 'admin'>('student');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  const categories = ['Academic', 'Cultural', 'Sports', 'Technical', 'Social', 'Workshop', 'Seminar', 'Other'];

  useEffect(() => {
    if (userRole === 'admin') setFilterStatus('all');
    else setFilterStatus('all');
  }, [userRole]);

  const fetchEvents = useCallback(async (statusOverride?: string) => {
    try {
      const params = new URLSearchParams();
      if (filterCategory !== 'all') params.append('category', filterCategory);
      const effectiveStatus = statusOverride !== undefined ? statusOverride : filterStatus;
      params.append('status', effectiveStatus);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/events?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
      } else {
        toast({ title: "Error", description: "Failed to fetch events" });
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({ title: "Error", description: "Failed to fetch events" });
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus, searchQuery, toast]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleCreateEvent = async (eventData: any) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          created_by: session?.user?.id,
          organizerRole: userRole,
          organizerEmail: session?.user?.email
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: userRole === 'admin'
            ? "Event created and approved"
            : "Event created! Key sent to admin for approval."
        });
        setShowCreateForm(false);
        fetchEvents('all');
      } else {
        toast({ title: "Error", description: data.message || "Failed to create event" });
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast({ title: "Error", description: "Failed to create event" });
    }
  };

  const handleStatusUpdate = async (eventId: string, newStatus: 'approved' | 'rejected', passkey?: string) => {
    try {
      let finalPasskey = passkey;

      if (!finalPasskey) {
        const action = newStatus === 'approved' ? 'approve' : 'reject';
        finalPasskey = prompt(`Enter secret key to ${action} this event:`);
        if (!finalPasskey) {
          toast({ title: "Cancelled", description: `Event ${action} cancelled` });
          return;
        }
      }

      const response = await fetch(`/api/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, passkey: finalPasskey, userRole })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update event');

      if (data.success) {
        toast({ title: "Success", description: `Event ${newStatus} successfully` });
        fetchEvents();
      } else {
        toast({ title: "Error", description: data.error || "Failed to update event", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update event", variant: "destructive" });
    }
  };

  const handleRegister = async (eventId: string) => {
    const event = events.find(e => e._id === eventId);
    if (!event) return;
    const isRegistered = event.attendees.some((a: any) => a.userId === session?.user?.id);
    if (isRegistered) {
      try {
        const response = await fetch(`/api/events/${eventId}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session?.user?.id })
        });
        const data = await response.json();
        if (data.success) {
          toast({ title: "Success", description: "Unregistered from event" });
          fetchEvents();
        }
      } catch {
        toast({ title: "Error", description: "Failed to unregister" });
      }
    } else {
      setSelectedEvent(event);
      setShowRegistrationModal(true);
    }
  };

  // ← updated to accept secretKey
  const handleDeleteEvent = async (eventId: string, secretKey: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          userRole,
          secretKey
        })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "Event deleted successfully" });
        fetchEvents();
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete event", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete event" });
    }
  };

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEvents = events.slice(startIndex, endIndex);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Event Zone</h1>
        <div className="flex items-center gap-2">
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as 'student' | 'organizer' | 'admin')}
            className="px-3 py-2 text-sm border-2 border-black rounded-lg bg-white"
          >
            <option value="student">Student</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2">
            <Plus size={18} />
            Create Event
          </Button>
        </div>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="events">All Events</TabsTrigger>
          <TabsTrigger value="calendar"><Calendar className="mr-2 h-4 w-4" />Calendar</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="mr-2 h-4 w-4" />Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          {showCreateForm && (
            <div className="mb-6">
              <CreateEventForm
                onSubmit={handleCreateEvent}
                onCancel={() => setShowCreateForm(false)}
                categories={categories}
                userRole={userRole}
              />
            </div>
          )}

          <div className="bg-[#F2EDE0] p-4 sm:p-6 border-2 border-b-4 border-r-4 border-black rounded-xl mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white border-2 border-black rounded-lg"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border-2 border-black rounded-lg bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border-2 border-black rounded-lg bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[300px] w-full" />)}
            </div>
          ) : currentEvents.length === 0 ? (
            <div className="text-center py-12 bg-[#F2EDE0] border-2 border-black rounded-xl">
              <Calendar size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
              <p className="text-gray-500">Create your first event to get started!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {currentEvents.map(event => (
                  <EventCard
                    key={event._id}
                    event={event}
                    userRole={userRole}
                    currentUserId={session?.user?.id || ''}
                    onStatusUpdate={handleStatusUpdate}
                    onRegister={handleRegister}
                    onDelete={handleDeleteEvent}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <PaginationNav
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <EventCalendar events={events} />
        </TabsContent>

        <TabsContent value="analytics">
          <EventAnalytics userId={session?.user?.id || ''} />
        </TabsContent>
      </Tabs>

      {showRegistrationModal && selectedEvent && (
        <RegistrationModal
          eventId={selectedEvent._id}
          eventTitle={selectedEvent.title}
          userId={session?.user?.id || ''}
          onClose={() => { setShowRegistrationModal(false); setSelectedEvent(null); }}
          onSuccess={() => {
            toast({ title: "Success", description: "Registered for event successfully" });
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}