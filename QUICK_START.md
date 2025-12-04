# Brainbell - Quick Start Guide

## Option 1: Local Development (RECOMMENDED - Fastest)

### Terminal 1 - Start Backend:
```bash
cd server
node index.js
```
Backend runs on: http://localhost:8000

### Terminal 2 - Start Frontend:
```bash
npm run dev
```
Frontend runs on: http://localhost:3000

---

## Option 2: Docker (If you prefer containers)

### Start all services:
```bash
docker compose up -d
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

### View logs:
```bash
docker compose logs -f
```

### Stop services:
```bash
docker compose down
```

---

## Environment Setup

Your `.env` file is already configured with:
- ✅ MongoDB connection to your Atlas cluster
- ✅ NextAuth secret generated
- ✅ API endpoints configured

**To add API keys** (optional features):
1. Edit `.env`
2. Add your keys:
   ```
   GROQ_API_KEY=your-key-here
   GROQ_API_KEY_RAG=your-key-here
   TAVILY_API_KEY=your-key-here
   ```

---

## Troubleshooting

### Docker build too large?
- Clean system: `docker system prune -a -f`
- Use local development instead

### Port already in use?
```bash
# For port 3000:
lsof -i :3000 | grep -v PID | awk '{print $2}' | xargs kill -9

# For port 8000:
lsof -i :8000 | grep -v PID | awk '{print $2}' | xargs kill -9
```

### MongoDB connection error?
- Check `.env` has `MONGODB_URI`
- Verify MongoDB Atlas IP whitelist includes your IP

---

**Recommended: Use Option 1 (Local) for development - it's faster and easier to debug!**
