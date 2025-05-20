import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create Express app
const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:12000', 'https://work-1-vahboojdapivlgag.prod-runtime.all-hands.dev'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});

// Mock data for blogs
const mockBlogs = [
  {
    id: '1',
    title: 'Getting Started with React',
    content: '<p>React is a popular JavaScript library for building user interfaces. It was developed by Facebook and is now maintained by Facebook and a community of individual developers and companies.</p><p>React allows developers to create large web applications that can change data, without reloading the page. The main purpose of React is to be fast, scalable, and simple.</p>',
    authorId: '1',
    authorName: 'John Doe',
    tags: ['react', 'javascript', 'webdev'],
    createdAt: new Date('2025-05-15T10:30:00'),
    views: 120
  },
  {
    id: '2',
    title: 'Mastering Tailwind CSS',
    content: '<p>Tailwind CSS is a utility-first CSS framework that allows you to build designs directly in your markup. Unlike other CSS frameworks like Bootstrap or Foundation, Tailwind doesn\'t provide predefined components.</p><p>Instead, it gives you low-level utility classes that let you build completely custom designs without ever leaving your HTML.</p>',
    authorId: '2',
    authorName: 'Jane Smith',
    tags: ['css', 'tailwind', 'webdev'],
    createdAt: new Date('2025-05-16T14:45:00'),
    views: 85
  },
  {
    id: '3',
    title: 'TypeScript for JavaScript Developers',
    content: '<p>TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. It adds static types to JavaScript, helping developers catch errors early and making code more readable and maintainable.</p><p>TypeScript is developed and maintained by Microsoft and is widely used in large-scale applications.</p>',
    authorId: '1',
    authorName: 'John Doe',
    tags: ['typescript', 'javascript', 'programming'],
    createdAt: new Date('2025-05-17T09:15:00'),
    views: 210
  },
  {
    id: '4',
    title: 'Building a Full-Stack Application with MERN',
    content: '<p>The MERN stack is a JavaScript stack that\'s designed to make the development process smoother. MERN includes MongoDB, Express, React, and Node.js.</p><p>MongoDB is a document database, Express is a web application framework, React is a client-side JavaScript library, and Node.js is a JavaScript runtime.</p>',
    authorId: '3',
    authorName: 'Alex Johnson',
    tags: ['mern', 'mongodb', 'express', 'react', 'nodejs'],
    createdAt: new Date('2025-05-18T16:20:00'),
    views: 150
  },
  {
    id: '5',
    title: 'Introduction to State Management with Zustand',
    content: '<p>Zustand is a small, fast and scalable state-management solution. It has a simple API based on hooks and doesn\'t wrap your app in context providers.</p><p>Zustand is perfect for managing global state in React applications and offers a minimalistic API that\'s easy to learn and use.</p>',
    authorId: '2',
    authorName: 'Jane Smith',
    tags: ['react', 'zustand', 'state-management'],
    createdAt: new Date('2025-05-19T11:50:00'),
    views: 95
  }
];

// API routes
app.get('/api/blogs', (req, res) => {
  res.json(mockBlogs);
});

app.get('/api/blogs/:id', (req, res) => {
  const blog = mockBlogs.find(b => b.id === req.params.id);
  if (!blog) {
    return res.status(404).json({ message: 'Blog not found' });
  }
  res.json(blog);
});

// Mock user data
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  bio: 'Frontend developer passionate about React and TypeScript',
  role: 'USER'
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  // Mock login - in a real app, you would validate credentials
  const { email, password } = req.body;
  if (email === 'john@example.com' && password === 'password') {
    res.json({
      token: 'mock-jwt-token',
      user: mockUser
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Start server
const PORT = process.env.PORT || 12001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});