"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CreateEventFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    date: string;
    venue: string;
    category: string;
    status: string;
  }) => Promise<void>;
  onCancel: () => void;
  categories: string[];
}

export default function CreateEventForm({ onSubmit, onCancel, categories }: CreateEventFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    category: 'Academic'
  });

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.date || !formData.venue) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ ...formData, status: 'pending' });
      setFormData({
        title: '',
        description: '',
        date: '',
        venue: '',
        category: 'Academic'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[#F2EDE0] border-2 border-b-4 border-r-4 border-black">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">Create New Event</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Title *
          </label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="bg-white border-2 border-black rounded-lg"
            placeholder="Enter event title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-[#7fb236] focus:border-transparent"
            placeholder="Describe your event"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-white border-2 border-black rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-white border-2 border-black rounded-lg focus:ring-2 focus:ring-[#7fb236] focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Venue *
          </label>
          <Input
            type="text"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            className="bg-white border-2 border-black rounded-lg"
            placeholder="Enter event venue"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 border-2 border-black"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="flex-1"
            disabled={loading || !formData.title || !formData.description || !formData.date || !formData.venue}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Event'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}