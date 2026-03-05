"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, X } from "lucide-react";

interface CreateEventFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    date: string;
    venue: string;
    category: string;
    status: string;
    secretKey?: string;
  }) => Promise<void>;
  onCancel: () => void;
  categories: string[];
  userRole?: string;
}

function generateSecretKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function CreateEventForm({ onSubmit, onCancel, categories, userRole }: CreateEventFormProps) {
  const [loading, setLoading] = useState(false);
  const [secretKey] = useState(() => generateSecretKey());
  const [adminEmails, setAdminEmails] = useState<string[]>(['']);
  const [emailError, setEmailError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    category: 'Academic'
  });

  const addEmailField = () => setAdminEmails([...adminEmails, '']);

  const removeEmailField = (index: number) => {
    if (adminEmails.length === 1) return;
    setAdminEmails(adminEmails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, value: string) => {
    const updated = [...adminEmails];
    updated[index] = value;
    setAdminEmails(updated);
    // Clear error when user types
    if (value.trim() !== '') setEmailError('');
  };

  const validEmails = adminEmails.filter(e => e.trim() !== '');
  const isFormValid = formData.title && formData.description && formData.date && formData.venue && validEmails.length > 0;

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.date || !formData.venue) return;

    if (validEmails.length === 0) {
      setEmailError('At least one admin email is required.');
      return;
    }

    setEmailError('');
    setLoading(true);
    try {
      try {
        await fetch('/api/send-event-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventTitle: formData.title,
            secretKey,
            adminEmails: validEmails,
          }),
        });
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr);
      }

      await onSubmit({
        ...formData,
        secretKey,
        status: userRole === 'admin' ? 'approved' : 'pending',
      });

      setFormData({ title: '', description: '', date: '', venue: '', category: 'Academic' });
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="bg-white border-2 border-black rounded-lg"
            placeholder="Enter event title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-white border-2 border-black rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
          <Input
            type="text"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            className="bg-white border-2 border-black rounded-lg"
            placeholder="Enter event venue"
          />
        </div>

        {/* Admin emails section */}
        <div className={`border-2 ${emailError ? 'border-red-400 bg-red-50' : 'border-teal-300 bg-teal-50'} rounded-xl p-4 space-y-3`}>
          <p className="text-sm font-semibold text-teal-800">🔑 Admin Approval</p>
          <p className="text-xs text-gray-500">
            A secret key will be auto-emailed to admin(s) when you click "Create Event". Admin uses it to approve or reject.
          </p>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Admin Email(s) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addEmailField}
                className="text-xs text-teal-600 hover:text-teal-800 flex items-center gap-1 font-medium"
              >
                <Plus className="h-3 w-3" /> Add another
              </button>
            </div>
            <div className="space-y-2">
              {adminEmails.map((email, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    className={`bg-white border-2 ${emailError && index === 0 ? 'border-red-400' : 'border-black'} rounded-lg`}
                    placeholder={`admin${index + 1}@gmail.com`}
                  />
                  {adminEmails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmailField(index)}
                      className="text-red-400 hover:text-red-600 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {emailError && (
              <p className="text-xs text-red-500 mt-1">{emailError}</p>
            )}
          </div>
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
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating & Sending Key...</>
            ) : (
              'Create Event'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}