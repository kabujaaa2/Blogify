# Blogify - Modern Blog Platform

Blogify is a full-stack blog platform with rich text editing, auto-saving drafts, authentication, and eye-care mode.

## 🚀 Features

- **Rich Text Editor** with formatting options
- **Auto-Save** drafts every 30 seconds
- **Authentication** system with protected routes 
- **Eye-Care Mode** with light/dark and warm color options
- **Dashboard** to manage your posts and drafts
- **Home Page** to discover content from other writers
- **Responsive Design** for all devices

## 🛠️ Tech Stack

### Frontend
- React with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Shadcn/UI component library
- React Router for navigation
- Zustand for state management
- Tanstack Query for data fetching

### Backend
- Node.js with Express
- MongoDB Atlas for database
- JWT for authentication
- RESTful API architecture

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

### Frontend Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/blogify.git
cd blogify
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. The application will be available at `http://localhost:3000`

### Backend Setup with MongoDB Atlas

1. **Create MongoDB Atlas Account and Cluster**:
   - Sign up for a MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (the free tier is sufficient for development)
   - Set up database access with a username and password
   - Configure network access (add your IP address or set to allow access from anywhere for development)
   - Get your MongoDB connection string from the Atlas dashboard

2. **Set up Environment Variables**:
   - Create a `.env` file in the root directory of your project
   - Add the following variables:
   ```
   DATABASE_URL="mongodb+srv://<username>:<password>@<cluster-url>/blogify"
   JWT_SECRET="your-secure-jwt-secret-key"
   PORT=5000
   ```
   - Replace `<username>`, `<password>`, and `<cluster-url>` with your MongoDB Atlas credentials

3. **Start the Backend Server**:
```bash
npm run server
```

4. The server will start at `http://localhost:5000`

### Running Both Frontend and Backend

1. In one terminal, start the backend:
```bash
npm run server
```

2. In another terminal, start the frontend:
```bash
npm run dev
```

3. The full application will be running with the frontend at `http://localhost:3000` and the API at `http://localhost:5000`

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
- `POST /api/auth/login` - Login and get JWT token

### Blogs
- `GET /api/blogs` - Get all published blogs
- `POST /api/blogs` - Create a new blog (protected)
- `GET /api/blogs/:id` - Get a specific blog
- `PUT /api/blogs/:id` - Update a blog (protected)
- `DELETE /api/blogs/:id` - Delete a blog (protected)

### User
- `GET /api/profile` - Get user profile (protected)
- `PUT /api/profile` - Update user profile (protected)

### Health Check
- `GET /api/health` - Check API health


