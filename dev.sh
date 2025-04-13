#!/bin/bash

# Print colored status messages
print_status() {
    echo -e "\e[1;34m>>> $1\e[0m"
}

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use. Please free it up first."
        exit 1
    fi
}

# Check if required ports are available
check_port 3000  # Frontend port
check_port 3001  # Backend port

# Start backend server
print_status "Starting backend server..."
cd cipherx-backend
npm install &
BACKEND_PID=$!
wait $BACKEND_PID
npm start &
BACKEND_PID=$!

# Start frontend development server
print_status "Starting frontend development server..."
cd ../Net-Secure
npm install &
FRONTEND_PID=$!
wait $FRONTEND_PID
npm run dev &
FRONTEND_PID=$!

# Handle script termination
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null' EXIT

# Keep script running and show status
print_status "Development servers are running..."
print_status "Frontend: http://localhost:3000"
print_status "Backend:  http://localhost:3001"
print_status "Press Ctrl+C to stop both servers"

# Wait for user interrupt
wait