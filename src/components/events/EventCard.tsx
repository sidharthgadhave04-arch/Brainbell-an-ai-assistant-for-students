"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, MapPin, Users, CheckCircle, XCircle, Trash2, Star } from "lucide-react";
import { useState } from "react";
import EventFeedback from "./EventFeedback";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  category: string;
  created_by: string;
  status: 'pending' | 'approved' | 'rejected';
  attendees: string[];
  feedback: Array<{
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

interface EventCardProps {
  event: Event;
  userRole: 'student' | 'organizer' | 'admin';
  currentUserId: string;
  onStatusUpdate: (eventId: string, status: 'approved' | 'rejected', passkey?: string) => void;
  onRegister: (eventId: string) => void;
  onDelete: (eventId: string) => void;
}

export default function EventCard({ 
  event, 
  userRole, 
  currentUserId,
  onStatusUpdate, 
  onRegister,
  onDelete 
}: EventCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const isRegistered = event.attendees.includes(currentUserId);
  const isCreator = event.created_by === currentUserId;
  const isPastEvent = new Date(event.date) < new Date();

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    approved: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300'
  };

  const avgRating = event.feedback.length > 0
    ? (event.feedback.reduce((sum, f) => sum + f.rating, 0) / event.feedback.length).toFixed(1)
    : null;

  const handleReject = () => {
    const passkey = prompt("Enter admin passkey to reject this event:");
    
    if (!passkey) {
      alert("Rejection cancelled - passkey required");
      return;
    }
    
    // Pass the passkey to the onStatusUpdate function
    onStatusUpdate(event._id, 'rejected', passkey);
    setShowRejectDialog(false);
  };

  return (
    <Card className="bg-white border-2 border-black border-b-4 border-r-4 hover:shadow-lg transition-shadow">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 break-words flex-1">
            {event.title}
          </CardTitle>
          <Badge className={`${statusColors[event.status]} border text-xs font-semibold`}>
            {event.status}
          </Badge>
        </div>
        <Badge variant="outline" className="w-fit border-2 border-black text-xs">
          {event.category}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-6">
        <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar size={16} className="text-gray-500" />
            <span>{new Date(event.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin size={16} className="text-gray-500" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Users size={16} className="text-gray-500" />
            <span>{event.attendees.length} attendees</span>
          </div>
          {avgRating && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span>{avgRating} / 5 ({event.feedback.length} reviews)</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {event.status === 'approved' && (
            <>
              <Button
                onClick={() => onRegister(event._id)}
                variant={isRegistered ? "destructive" : "default"}
                className="w-full"
              >
                {isRegistered ? 'Unregister' : 'Register'}
              </Button>
              {isPastEvent && isRegistered && (
                <Button
                  onClick={() => setShowFeedback(true)}
                  variant="outline"
                  className="w-full border-2 border-black"
                >
                  <Star size={16} className="mr-2" />
                  Leave Feedback
                </Button>
              )}
            </>
          )}
          
          {userRole === 'admin' && event.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                onClick={() => onStatusUpdate(event._id, 'approved')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle size={16} className="mr-1" />
                Approve
              </Button>
              
              {/* Reject button with passkey confirmation */}
              <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle size={16} className="mr-1" />
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Event</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be prompted to enter your admin passkey to confirm rejection.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleReject}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {(isCreator || userRole === 'admin') && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full border-2 border-red-500 text-red-500 hover:bg-red-50">
                  <Trash2 size={16} className="mr-2" />
                  Delete Event
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this event.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(event._id)} className="bg-red-500 hover:bg-red-600">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>

      {showFeedback && (
        <EventFeedback
          eventId={event._id}
          userId={currentUserId}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </Card>
  );
}