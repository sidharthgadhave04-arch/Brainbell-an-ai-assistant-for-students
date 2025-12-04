#!/bin/bash

echo "Starting Brainbell services..."

# Start backend
echo "Starting backend server on port 8000..."
cd server
node index.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend on port 3000..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================="
echo "Services started successfully!"
echo "========================================="
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"
echo "========================================="

# Wait for user interrupt
wait
