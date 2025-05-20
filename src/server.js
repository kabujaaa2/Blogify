import express from 'express';
import cors from 'cors';
import { getCollection, getDatabase } from './lib/db.js';
import { createAuthMiddleware, generateToken } from './lib/auth.js';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import * as dotenv from 'dotenv';
import { ObjectId } from 'mongodb';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 12001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Auth middleware
const authMiddleware = createAuthMiddleware();

// Routes
// Register user
app.post('/api/auth/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      // Get users collection
      const usersCollection = await getCollection('users');

      // Check if user exists
      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await usersCollection.insertOne({
        email,
        password: hashedPassword,
        name,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Server error' });
    }
});

// Login user
app.post('/api/auth/login',
  [
    body('email').isEmail(),
    body('password').exists()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Get users collection
      const usersCollection = await getCollection('users');

      // Find user
      const user = await usersCollection.findOne({ email });

      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = generateToken(user);

      res.json({ token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
    }
});

// Protected route example
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get users collection
    const usersCollection = await getCollection('users');
    
    // Find user by ID
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Blog routes
// Get all published blogs
app.get('/api/blogs', async (req, res) => {
  try {
    // Get blogs and users collections
    const blogsCollection = await getCollection('blogs');
    const usersCollection = await getCollection('users');
    
    // Find all published blogs
    const blogs = await blogsCollection.find({ status: 'PUBLISHED' }).toArray();
    
    // Get author details for each blog
    const blogsWithAuthor = await Promise.all(blogs.map(async (blog) => {
      const author = await usersCollection.findOne(
        { _id: new ObjectId(blog.authorId) },
        { projection: { name: 1, email: 1 } }
      );
      
      return {
        ...blog,
        author: author || { name: 'Unknown', email: 'unknown@example.com' }
      };
    }));
    
    res.json(blogsWithAuthor);
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create blog (protected route)
app.post('/api/blogs', 
  authMiddleware,
  [
    body('title').notEmpty(),
    body('content').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, tags = [] } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Get blogs collection
      const blogsCollection = await getCollection('blogs');
      
      // Create slug from title
      const slug = title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
      
      // Create blog
      const result = await blogsCollection.insertOne({
        title,
        content,
        slug,
        authorId: userId,
        tags,
        status: 'DRAFT',
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Get the created blog
      const blog = await blogsCollection.findOne({ _id: result.insertedId });

      res.status(201).json(blog);
    } catch (error) {
      console.error('Create blog error:', error);
      res.status(500).json({ error: 'Server error' });
    }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- POST /api/auth/register - Register a new user');
  console.log('- POST /api/auth/login - Login user');
  console.log('- GET /api/profile - Get user profile (protected)');
  console.log('- GET /api/blogs - Get all published blogs');
  console.log('- POST /api/blogs - Create a new blog (protected)');
  console.log('- GET /api/health - Health check');
}); 