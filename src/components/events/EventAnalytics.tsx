"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calendar, Users, Star, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Analytics {
  totalEvents: number;
  approvedEvents: number;
  pendingEvents: number;
  totalAttendees: number;
  averageRating: number;
}

interface EventAnalyticsProps {
  userId: string;
}

export default function EventAnalytics({ userId }: EventAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/events/analytics/${userId}`);
        const data = await response.json();
        
        if (data.success) {
          setAnalytics(data.analytics);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAnalytics();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-[150px] w-full" />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="bg-[#F2EDE0] border-2 border-b-4 border-r-4 border-black">
        <CardContent className="p-8 text-center">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      title: "Total Events",
      value: analytics.totalEvents,
      icon: Calendar,
      color: "bg-blue-500",
      description: "Events created"
    },
    {
      title: "Approved Events",
      value: analytics.approvedEvents,
      icon: TrendingUp,
      color: "bg-green-500",
      description: "Successfully approved"
    },
    {
      title: "Pending Approval",
      value: analytics.pendingEvents,
      icon: Calendar,
      color: "bg-yellow-500",
      description: "Waiting for review"
    },
    {
      title: "Total Attendees",
      value: analytics.totalAttendees,
      icon: Users,
      color: "bg-purple-500",
      description: "Across all events"
    },
    {
      title: "Average Rating",
      value: analytics.averageRating || "N/A",
      icon: Star,
      color: "bg-yellow-600",
      description: "From feedback"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-[#F2EDE0] border-2 border-b-4 border-r-4 border-black">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 size={24} />
            Event Analytics
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white border-2 border-black border-b-4 border-r-4 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {analytics.totalEvents === 0 && (
        <Card className="bg-[#F2EDE0] border-2 border-black">
          <CardContent className="p-8 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Events Yet</h3>
            <p className="text-gray-600">Create your first event to see analytics!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}