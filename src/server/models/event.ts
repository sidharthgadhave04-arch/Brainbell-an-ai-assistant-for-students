import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendee {
  userId: string;
  name: string;
  branch: string;
  division: string;
  yearOfStudy: string;
  registeredAt: Date;
}

export interface IEvent extends Document {
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  venue?: string;
  category: string;
  organizer?: string;
  organizerEmail?: string;
  organizerRole?: string;
  maxParticipants?: number;
  registeredParticipants?: number;
  imageUrl?: string;
  secretKey?: string;
  created_by: mongoose.Types.ObjectId | string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedAt?: Date;
  approvedBy?: string;
  attendees: IAttendee[];
  feedback: Array<{
    userId: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const attendeeSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  branch: { type: String, required: true },
  division: { type: String, required: true },
  yearOfStudy: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now },
});

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: [true, 'Event title is required'], trim: true },
    description: { type: String, trim: true },
    date: { type: String, required: [true, 'Event date is required'] },
    time: { type: String },
    location: { type: String, trim: true },
    venue: { type: String, trim: true },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    organizer: { type: String, trim: true },
    organizerEmail: { type: String },
    organizerRole: { type: String, enum: ['admin', 'student', 'organizer'] },
    maxParticipants: { type: Number },
    registeredParticipants: { type: Number, default: 0 },
    imageUrl: { type: String },
    secretKey: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    approvedAt: { type: Date },
    approvedBy: { type: String },
    created_by: { type: Schema.Types.Mixed, required: true },
    attendees: [attendeeSchema],
    feedback: [{
      userId: String,
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);
export default Event;