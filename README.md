# Blogify - Modern Blog Platform

Blogify is a full-stack blog platform with rich text editing, auto-saving drafts, authentication, and advanced eye-care features.

## 🚀 Features

- **Rich Text Editor** with formatting options and image support
- **Auto-Save** drafts every 30 seconds with offline capability
- **Authentication** system with secure JWT and protected routes 
- **Advanced Eye-Care Mode** with:
  - Light/dark theme with system preference detection
  - Color temperature adjustment (warm/cool)
  - Blue light filter with adjustable intensity
  - Font size controls for better readability
  - Reduced motion option for accessibility
- **Dashboard** to manage your posts and drafts with analytics
- **Home Page** with trending and personalized content recommendations
- **Responsive Design** optimized for all devices from mobile to desktop
- **Search Functionality** with filters and saved search history

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** with custom theming for responsive styling
- **Shadcn/UI** component library with accessibility features
- **React Router v6** for client-side navigation and routing
- **Zustand** for lightweight global state management
- **Tanstack Query** (React Query) for efficient data fetching and caching
- **Framer Motion** for smooth animations and transitions
- **Lucide React** for consistent iconography
- **date-fns** for date formatting and manipulation

### Backend
- **Node.js** with Express for API development
- **MongoDB Atlas** for cloud database with flexible schema
- **JWT** with refresh token rotation for secure authentication
- **RESTful API** architecture with standardized responses
- **Express Middleware** for request validation and error handling
- **Helmet** for enhanced API security
- **Rate Limiting** to prevent abuse
- **Morgan** for HTTP request logging
- **HTTP Status Codes** for standardized error responses

## 📋 Database Schema

Blogify uses MongoDB with the following collections:

### Users Collection
```json
{
  "_id": "ObjectId",
  "email": "string (unique)",
  "name": "string",
  "password": "string (hashed)",
  "bio": "string (optional)",
  "avatar": "string (optional)",
  "role": "string (USER or ADMIN)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Blogs Collection
```json
{
  "_id": "ObjectId",
  "title": "string",
  "content": "string",
  "status": "string (DRAFT, PUBLISHED, or ARCHIVED)",
  "views": "number",
  "slug": "string (unique)",
  "authorId": "ObjectId (reference to Users)",
  "tags": ["string array"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Comments Collection
```json
{
  "_id": "ObjectId",
  "content": "string",
  "blogId": "ObjectId (reference to Blogs)",
  "authorId": "ObjectId (reference to Users)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Likes Collection
```json
{
  "_id": "ObjectId",
  "blogId": "ObjectId (reference to Blogs)",
  "userId": "ObjectId (reference to Users)",
  "createdAt": "Date"
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB installation)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kabujaaa2/Blogify.git
cd Blogify
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory based on the provided `.env.example`
   - Update the MongoDB connection string with your credentials

### Running the Application

#### Development Mode (Both Frontend and Backend)

Our enhanced development script automatically sets up everything you need:

```bash
./start-dev.sh
```

This script:
- Checks for required dependencies
- Creates a default `.env` file if none exists
- Verifies MongoDB connection
- Starts both frontend and backend servers
- Provides real-time logs

- Frontend will be available at: `http://localhost:12000`
- Backend API will be available at: `http://localhost:12001`

#### Running Separately

1. Start the backend server:
```bash
npm run server:dev
```

2. In another terminal, start the frontend:
```bash
npm run dev
```

### Production Build

1. Build the frontend with optimizations:
```bash
npm run build
```

2. For a development build (with sourcemaps):
```bash
npm run build:dev
```

3. Start the production server:
```bash
npm start
```

4. Preview the production build locally:
```bash
npm run preview
```

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
NODE_ENV=development
PORT=12001
FRONTEND_URL=http://localhost:12000

# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/blogify

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:12000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=dev
```

### MongoDB Atlas Setup

1. **Create MongoDB Atlas Account and Cluster**:
   - Sign up at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (free tier is sufficient for development)
   - Set up database access with a username and password
   - Configure network access (add your IP address or allow access from anywhere for development)
   - Get your MongoDB connection string from the Atlas dashboard

2. **Update Environment Variables**:
   - Update the `MONGODB_URI` in your `.env` file:
   ```
   MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>/blogify"
   ```

### Docker Support

We provide Docker and Docker Compose configurations for easy deployment:

```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run

# Or use Docker Compose (recommended)
npm run docker:compose

# View logs
npm run docker:logs

# Stop containers
npm run docker:compose:down
```

The Docker Compose setup includes:
- MongoDB container with persistent volume
- Backend API container
- Frontend container
- Automatic network configuration
- Health checks for all services

## 🧠 Key Learnings

During the development of Blogify, we gained valuable insights into:

1. **Real-time Saving Strategies** - Implementing efficient auto-save functionality with debouncing to prevent excessive database writes

2. **State Management Patterns** - Using Zustand for global state and React Query for server state management

3. **Design Systems** - Creating a cohesive UI with Tailwind CSS and Shadcn UI components

4. **Authentication Flows** - Implementing secure user authentication with JWT tokens and protected routes

5. **Eye-Care Considerations** - Developing a UI that considers user eye health with different color temperature options

6. **MongoDB Schema Design** - Creating an efficient NoSQL database schema with proper relationships between users, blogs, comments, and likes

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
  - Request: `{ "name": "string", "email": "string", "password": "string" }`
  - Response: `{ "success": true, "message": "User registered successfully", "data": { "token": "string", "user": {...} } }`

- `POST /api/auth/login` - Login and get JWT token
  - Request: `{ "email": "string", "password": "string" }`
  - Response: `{ "success": true, "message": "Login successful", "data": { "token": "string", "user": {...} } }`

- `GET /api/profile` - Get current user profile with blog stats (protected)
  - Response: `{ "success": true, "message": "Profile retrieved successfully", "data": { "user": {...}, "stats": {...} } }`

### Blogs
- `GET /api/blogs` - Get all published blogs with pagination and filtering
  - Query params: `page`, `limit`, `tag`, `search`, `sortBy`, `sortOrder`
  - Response: `{ "success": true, "message": "Blogs retrieved successfully", "data": [...], "meta": { "pagination": {...}, "filters": {...} } }`

- `POST /api/blogs` - Create a new blog (protected)
  - Request: `{ "title": "string", "content": "string", "tags": ["string"], "status": "DRAFT|PUBLISHED" }`
  - Response: `{ "success": true, "message": "Blog created successfully", "data": {...} }`

- `GET /api/blogs/:id` - Get a specific blog (increments view count)
  - Response: `{ "success": true, "message": "Blog retrieved successfully", "data": { "blog": {...}, "relatedBlogs": [...] } }`

- `PUT /api/blogs/:id` - Update a blog (protected)
  - Request: `{ "title": "string", "content": "string", "tags": ["string"], "status": "string" }`
  - Response: `{ "success": true, "message": "Blog updated successfully", "data": {...} }`

- `DELETE /api/blogs/:id` - Delete a blog (protected)
  - Response: `{ "success": true, "message": "Blog deleted successfully" }`

- `GET /api/blogs/trending` - Get trending blogs based on views and recency
  - Query params: `limit`
  - Response: `{ "success": true, "message": "Trending blogs retrieved successfully", "data": [...] }`

### Tags
- `GET /api/tags` - Get all available tags with usage count
  - Response: `{ "success": true, "message": "Tags retrieved successfully", "data": [{ "name": "string", "count": number }] }`

- `GET /api/tags/:tag/blogs` - Get blogs with a specific tag
  - Query params: `page`, `limit`
  - Response: `{ "success": true, "message": "Blogs with tag retrieved successfully", "data": [...], "meta": { "pagination": {...}, "tag": "string" } }`

### Health and Monitoring
- `GET /api/health` - Check API health with detailed system information
  - Response: `{ "success": true, "message": "Server is healthy", "data": { "status": "ok", "database": {...}, "system": {...} } }`

### Response Format

All API endpoints return responses in a standardized format:

```json
// Success response
{
  "success": true,
  "message": "Operation successful",
  "statusCode": 200,
  "data": { ... },
  "meta": { ... } // Optional metadata like pagination
}

// Error response
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "errors": { ... } // Detailed error information
}
```


