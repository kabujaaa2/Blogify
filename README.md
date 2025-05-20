
# Blogify - Modern Blog Platform

![Blogify Logo]

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

### Backend (Recommended Setup)
- Node.js with Express
- PostgreSQL database
- JWT for authentication
- RESTful API architecture

## 📋 Database Schema

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blogs Table
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  view_count INTEGER DEFAULT 0
);

-- Tags Table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Blog_Tags Junction Table
CREATE TABLE blog_tags (
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, tag_id)
);

-- Draft History Table (Optional)
CREATE TABLE draft_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID REFERENCES blogs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
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

### Backend Setup (Recommended)

1. Setup PostgreSQL database
   - Install PostgreSQL
   - Create a new database: `CREATE DATABASE blogify;`
   - Run the schema SQL commands from above

2. Clone and set up the backend repository (if separate):
```bash
git clone https://github.com/your-username/blogify-backend.git
cd blogify-backend
```

3. Install backend dependencies:
```bash
npm install
```

4. Set up environment variables:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blogify
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
PORT=3000
```

5. Start the backend server:
```bash
npm start
```

## 🧠 Key Learnings

During the development of Blogify, we gained valuable insights into:

1. **Real-time Saving Strategies** - Implementing efficient auto-save functionality with debouncing to prevent excessive database writes

2. **State Management Patterns** - Using Zustand for global state and React Query for server state management

3. **Design Systems** - Creating a cohesive UI with Tailwind CSS and Shadcn UI components

4. **Authentication Flows** - Implementing secure user authentication with JWT tokens and protected routes

5. **Eye-Care Considerations** - Developing a UI that considers user eye health with different color temperature options

6. **PostgreSQL Relational Design** - Creating an efficient database schema with proper relationships between users, blogs, and tags

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the component library
- [TipTap](https://tiptap.dev/) for the rich text editor
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
