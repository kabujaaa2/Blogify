#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=======================================${NC}"
echo -e "${BOLD}${GREEN}Blogify Development Environment${NC}"
echo -e "${BLUE}=======================================${NC}"

# Trap to ensure clean shutdown of all processes
trap cleanup EXIT INT TERM
cleanup() {
  echo -e "\n${YELLOW}Shutting down servers...${NC}"
  if [ ! -z "$BACKEND_PID" ]; then
    echo -e "${YELLOW}Stopping backend server (PID: $BACKEND_PID)${NC}"
    kill $BACKEND_PID 2>/dev/null || true
  fi
  if [ ! -z "$FRONTEND_PID" ]; then
    echo -e "${YELLOW}Stopping frontend server (PID: $FRONTEND_PID)${NC}"
    kill $FRONTEND_PID 2>/dev/null || true
  fi
  echo -e "${GREEN}All servers stopped. Goodbye!${NC}"
  exit 0
}

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${YELLOW}Warning: .env file not found. Creating from .env.example...${NC}"
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${GREEN}Created .env file. Please update it with your configuration.${NC}"
  else
    echo -e "${RED}Error: .env.example file not found. Creating basic .env file...${NC}"
    cat > .env << EOF
# Blogify Environment Configuration
NODE_ENV=development
PORT=12001
FRONTEND_URL=http://localhost:12000
MONGODB_URI=mongodb://localhost:27017/blogify
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
EOF
    echo -e "${GREEN}Created basic .env file. Please update it with your configuration.${NC}"
  fi
fi

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if required commands exist
if ! command_exists node; then
  echo -e "${RED}Error: Node.js is not installed. Please install Node.js to continue.${NC}"
  exit 1
fi

if ! command_exists npm; then
  echo -e "${RED}Error: npm is not installed. Please install npm to continue.${NC}"
  exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)
if [ $NODE_MAJOR -lt 16 ]; then
  echo -e "${RED}Error: Node.js version 16 or higher is required. Current version: $NODE_VERSION${NC}"
  echo -e "${YELLOW}Please upgrade Node.js to continue.${NC}"
  exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to install dependencies.${NC}"
    exit 1
  fi
  echo -e "${GREEN}Dependencies installed successfully.${NC}"
fi

# Check if MongoDB is running (if using local MongoDB)
if grep -q "mongodb://localhost" .env; then
  echo -e "${YELLOW}Checking if MongoDB is running locally...${NC}"
  if command_exists mongosh; then
    mongosh --eval "db.version()" --quiet >/dev/null 2>&1
    if [ $? -ne 0 ]; then
      echo -e "${RED}Warning: MongoDB does not appear to be running locally.${NC}"
      echo -e "${YELLOW}You may need to start MongoDB or update your connection string in .env${NC}"
    else
      echo -e "${GREEN}MongoDB is running locally.${NC}"
    fi
  else
    echo -e "${YELLOW}Note: mongosh command not found. Skipping MongoDB check.${NC}"
  fi
fi

# Start backend and frontend in parallel
echo -e "${GREEN}Starting development servers...${NC}"
echo -e "${CYAN}Backend will run on port 12001${NC}"
echo -e "${CYAN}Frontend will run on port 12000${NC}"
echo -e "${BLUE}=======================================${NC}"

# Function to check if a port is in use
port_in_use() {
  lsof -i:$1 >/dev/null 2>&1
}

# Check if ports are available
if port_in_use 12000; then
  echo -e "${RED}Error: Port 12000 is already in use. Frontend server cannot start.${NC}"
  exit 1
fi

if port_in_use 12001; then
  echo -e "${RED}Error: Port 12001 is already in use. Backend server cannot start.${NC}"
  exit 1
fi

# Start the backend server in the background
echo -e "${YELLOW}Starting backend server...${NC}"
NODE_ENV=development npm run server:dev &
BACKEND_PID=$!

# Wait a moment for the backend to initialize
echo -e "${YELLOW}Waiting for backend to initialize...${NC}"
sleep 3

# Check if backend started successfully
if ! ps -p $BACKEND_PID > /dev/null; then
  echo -e "${RED}Error: Backend server failed to start.${NC}"
  exit 1
fi

# Start the frontend development server in the background
echo -e "${YELLOW}Starting frontend development server...${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait a moment for the frontend to initialize
sleep 3

# Check if frontend started successfully
if ! ps -p $FRONTEND_PID > /dev/null; then
  echo -e "${RED}Error: Frontend server failed to start.${NC}"
  kill $BACKEND_PID
  exit 1
fi

echo -e "${GREEN}${BOLD}All servers started successfully!${NC}"
echo -e "${CYAN}Frontend: http://localhost:12000${NC}"
echo -e "${CYAN}Backend: http://localhost:12001${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Keep the script running until user interrupts
wait $FRONTEND_PID