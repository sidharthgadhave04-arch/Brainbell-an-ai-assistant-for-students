"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Event {
  _id: string;
  title: string;
  date: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface EventCalendarProps {
  events: Event[];
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toISOString().split('T')[0];

    return events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr && event.status === 'approved';
    });
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 sm:h-32"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDate(day);
    const isToday = 
      day === new Date().getDate() &&
      currentDate.getMonth() === new Date().getMonth() &&
      currentDate.getFullYear() === new Date().getFullYear();

    days.push(
      <div
        key={day}
        className={"h-24 sm:h-32 border-2 p-2 overflow-hidden border-[color:var(--border)] bg-[color:var(--card)]" + (isToday ? " bg-[color:var(--accent)]/20" : "")}
      >
        <div className={"text-sm font-semibold mb-1 " + (isToday ? "text-[color:var(--accent)]" : "text-[color:var(--muted-foreground)]")}>
          {day}
        </div>
        <div className="space-y-1">
          {dayEvents.slice(0, 2).map(event => (
            <div
              key={event._id}
              className="text-xs p-1 bg-[color:var(--muted)] border border-[color:var(--border)] rounded truncate"
              title={event.title}
            >
              {event.title}
            </div>
          ))}
          {dayEvents.length > 2 && (
            <div className="text-xs text-[color:var(--muted-foreground)] font-semibold">
              +{dayEvents.length - 2} more
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-[color:var(--card)] border-2 border-[color:var(--border)]">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl sm:text-2xl font-bold text-[color:var(--card-foreground)] flex items-center gap-2">
            <CalendarIcon size={24} />
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={previousMonth}
              variant="outline"
              size="sm"
              className="border-2 border-[color:var(--border)]"
            >
              <ChevronLeft size={18} />
            </Button>
            <Button
              onClick={nextMonth}
              variant="outline"
              size="sm"
              className="border-2 border-[color:var(--border)]"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-7 gap-0 border-2 border-[color:var(--border)]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="text-center font-bold text-sm p-2 bg-[color:var(--muted)] text-[color:var(--muted-foreground)] border-r-2 border-[color:var(--border)] last:border-r-0"
            >
              {day}
            </div>
          ))}
          {days}
        </div>

        <div className="mt-4 p-4 bg-[color:var(--card)] border-2 border-[color:var(--border)] rounded-lg">
          <h3 className="font-semibold mb-2 text-[color:var(--card-foreground)]">Legend:</h3>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[color:var(--accent)] bg-opacity-20 border-2 border-[color:var(--border)]"></div>
            <span className="text-sm text-[color:var(--muted-foreground)]">Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}