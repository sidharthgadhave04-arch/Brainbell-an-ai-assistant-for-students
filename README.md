# Brainbell: An AI Assistant For Students
i have edited it with more interactive and more features than the previous....working for college students....

## Table of Contents
- [Overview](#overview)
- [Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Integration](#api-integration)
- [Usage Guide](#usage-guide)
- [Contributing](#contributing)
- [License](#license)

## Overview

Brainbell is an intelligent study companion that leverages AI to transform the learning experience. It combines personalized study planning, resource curation, interactive assistance, and campus event management to help students achieve their academic goals efficiently while staying connected with their college community.

## Key Features

### 1. Event Zone - Campus Event Hub 🎉
- **Centralized Event Management**
  - Single source of truth for all college events
  - No more scattered WhatsApp messages
  - Real-time event updates and notifications
  - Event categories (academic, cultural, sports, workshops)
- **Smart Event Discovery**
  - AI-powered event recommendations
  - Filter by date, category, and department
  - Search functionality for quick access
  - Upcoming events dashboard
- **Event Details & RSVP**
  - Comprehensive event information (venue, time, organizers)
  - One-click RSVP system
  - Calendar integration
  - Reminder notifications
- **No More Chaos**
  - Replaces hectic WhatsApp group spam
  - Organized event announcements
  - Easy access to event history
  - Reduced information overload

### 2. AI-Powered Study Planning 📚
- **Dynamic Plan Generation**
  - Subject-based customization
  - Exam date optimization
  - Weekly learning milestones
  - Daily task breakdown
- **Progress Tracking**
  - Visual progress indicators
  - Completion status
  - Adjustable schedules
  - Performance analytics

### 3. Smart Resource Curation 🔍
- **AI-Driven Content Discovery**
  - Tavily API integration for relevant search
  - Quality scoring algorithm
  - Content type diversity
- **Resource Types Support**
  - Video tutorials
  - Online courses
  - Documentation
  - Practice exercises
  - Academic papers
- **Smart Filtering**
  - Difficulty level categorization
  - Format-based organization
  - Topic relevance ranking

### 4. Interactive PDF Chat Assistant 📄
- **Document Analysis**
  - Upload and process PDF documents
  - AI-powered document comprehension
  - Contextual question answering
- **Smart Features**
  - Source page references
  - Relevant excerpt highlighting
  - Chat history persistence
  - Context-aware responses
- **PDF Viewer Integration**
  - Page navigation and tracking
  - Zoom and rotation controls
  - Fullscreen mode
  - Synchronized chat and document view

### 5. Productivity Tools 🎯
- **Pomodoro Timer**
  - 25-minute work/break intervals
  - Session tracking and statistics
  - Customizable durations
  - Productivity analytics
- **Notes Management**
  - Rich text formatting
  - Subject-wise organization
  - Search functionality
  - Multi-device sync

### 6. User Experience ✨
- **Modern Interface**
  - Clean, responsive design
  - Toast notifications
  - Loading states
  - Intuitive navigation
- **Seamless Integration**
  - All features in one platform
  - Quick access navigation
  - Persistent data across sessions

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: 
  - Tailwind CSS for utility-first styling
  - Shadcn UI for component library
- **State Management**: 
  - Zustand for global state
  - React Query for server state
- **Authentication**: NextAuth.js with JWT
- **PDF Processing**:
  - React-PDF for document viewing
  - PDF.js for text extraction
  - Custom chat interface

### Backend
- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **AI Services**:
  - Groq API for study plan generation and PDF analysis
  - HuggingFace for document embeddings
  - Tavily API for resource curation
- **Security**: 
  - JWT authentication
  - Rate limiting
  - Input validation

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sidharthgadhave04-arch/Brainbell-an-ai-assistant-for-students.git
cd Brainbell-an-ai-assistant-for-students
```

2. Set up environment variables:

Create `.env` file in the root directory with the following variables:

```env
NEXTAUTH_SECRET=your-secret-key
MONGODB_URI=your-mongodb-uri
NEXTAUTH_URL=http://localhost:3000
EXPRESS_BACKEND_URL=http://backend:8000
NEXT_PUBLIC_API_URL=http://backend:8000
API_URL=http://backend:8000
GROQ_API_KEY=your-groq-api-key
GROQ_API_KEY_RAG=your-groq-rag-api-key
TAVILY_API_KEY=your-tavily-api-key
```

3. Build with Docker Compose:

```bash
docker compose build
```

4. Run with Docker Compose:

```bash
docker compose up -d
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## API Integration

### Groq API
Used for:
- Study plan generation
- Resource description enhancement
- Learning path recommendations
- PDF document analysis

### Tavily API
Used for:
- Educational resource curation
- Content relevance scoring
- Resource metadata extraction

### HuggingFace
Used for:
- Document embeddings
- Semantic search
- Context-aware responses

## Usage Guide

### Event Zone
1. Navigate to the Event Zone section
2. Browse all upcoming college events
3. Filter by category, date, or department
4. Click on an event for detailed information
5. RSVP to events you want to attend
6. Set reminders and add to your calendar
7. Stay updated without WhatsApp spam

### Study Plan Generation
1. Navigate to the study plan section
2. Enter your subject and exam date
3. Click "Generate Plan"
4. View and customize your personalized study schedule

### Pomodoro Timer
1. Set your 25-minute timer work/break duration
2. Start your study session
3. Follow the timer prompts for breaks
4. View your session history and statistics
5. Adjust intervals based on productivity patterns

### Notes Management
1. Create new notes with rich text formatting
2. Organize notes by subjects/topics
3. Use the search function to find specific content
4. Export notes in various formats
5. Access your notes across devices

### PDF Chat Assistant
1. Upload your PDF document
2. Ask questions about the content
3. View source pages and relevant excerpts
4. Navigate through the document while chatting
5. Access chat history for previous conversations

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

---

Built with 💡 by Siddharth Gadhave
