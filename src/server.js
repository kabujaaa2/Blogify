import express from 'express';
import cors from 'cors';
import { getCollection, getDatabase } from './lib/db.js';
import { createAuthMiddleware, generateToken } from './lib/auth.js';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import * as dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';
import errorHandler from './middleware/errorHandler.js';
import { apiResponse } from './lib/apiResponse.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 12001;

// CORS configuration
const corsOptions = {
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:12000',
    'https://work-1-tbdhkcypokpyhjry.prod-runtime.all-hands.dev',
    'https://work-2-tbdhkcypokpyhjry.prod-runtime.all-hands.dev'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://*'],
      connectSrc: ["'self'", 'https://*']
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all requests
app.use(apiLimiter);

// Logging middleware
app.use(morgan('dev'));

// CORS and parsing middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API response middleware
app.use(apiResponse);

// Auth middleware
const authMiddleware = createAuthMiddleware();

// Routes
// Register user
app.post('/api/auth/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.apiError({
          message: 'Validation failed',
          statusCode: StatusCodes.BAD_REQUEST,
          errors: errors.array()
        });
      }

      const { email, password, name } = req.body;

      // Get users collection
      const usersCollection = await getCollection('users');

      // Check if user exists
      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        return res.apiError({
          message: 'User already exists',
          statusCode: StatusCodes.CONFLICT,
          errors: { email: 'Email is already registered' }
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await usersCollection.insertOne({
        email,
        password: hashedPassword,
        name,
        role: 'USER',
        bio: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Generate token for immediate login
      const user = await usersCollection.findOne({ _id: result.insertedId });
      const token = generateToken(user);

      res.apiSuccess({
        message: 'User registered successfully',
        statusCode: StatusCodes.CREATED,
        data: { 
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.apiError({
        message: 'Server error during registration',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR
      });
    }
});

// Login user
app.post('/api/auth/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').exists().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.apiError({
          message: 'Validation failed',
          statusCode: StatusCodes.BAD_REQUEST,
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Get users collection
      const usersCollection = await getCollection('users');

      // Find user
      const user = await usersCollection.findOne({ email });

      if (!user) {
        return res.apiError({
          message: 'Invalid credentials',
          statusCode: StatusCodes.UNAUTHORIZED
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.apiError({
          message: 'Invalid credentials',
          statusCode: StatusCodes.UNAUTHORIZED
        });
      }

      // Generate JWT token
      const token = generateToken(user);

      // Return success response with token
      res.apiSuccess({
        message: 'Login successful',
        data: { 
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.apiError({
        message: 'Server error during login',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR
      });
    }
});

// Protected route example
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.apiError({
        message: 'Authentication required',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    
    // Get users collection
    const usersCollection = await getCollection('users');
    
    // Find user by ID
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user) {
      return res.apiError({
        message: 'User not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }

    // Get blogs collection to count user's blogs
    const blogsCollection = await getCollection('blogs');
    
    // Count user's blogs by status
    const publishedCount = await blogsCollection.countDocuments({ 
      authorId: userId.toString(), 
      status: 'PUBLISHED' 
    });
    
    const draftCount = await blogsCollection.countDocuments({ 
      authorId: userId.toString(), 
      status: 'DRAFT' 
    });
    
    // Return user profile with blog counts
    res.apiSuccess({
      message: 'Profile retrieved successfully',
      data: {
        ...user,
        stats: {
          publishedBlogs: publishedCount,
          draftBlogs: draftCount,
          totalBlogs: publishedCount + draftCount
        }
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.apiError({
      message: 'Error retrieving profile',
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    });
  }
});

// Blog routes
// Get all published blogs with pagination and filtering
app.get('/api/blogs', async (req, res) => {
  try {
    // Get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const tag = req.query.tag;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get blogs and users collections
    const blogsCollection = await getCollection('blogs');
    const usersCollection = await getCollection('users');
    
    // Build query filter
    const filter = { status: 'PUBLISHED' };
    
    // Add tag filter if provided
    if (tag) {
      filter.tags = tag;
    }
    
    // Add search filter if provided
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;
    
    // Get total count for pagination
    const total = await blogsCollection.countDocuments(filter);
    
    // Find blogs with pagination and sorting
    const blogs = await blogsCollection
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Get author details for each blog
    const blogsWithAuthor = await Promise.all(blogs.map(async (blog) => {
      const author = await usersCollection.findOne(
        { _id: new ObjectId(blog.authorId) },
        { projection: { name: 1, email: 1, _id: 1 } }
      );
      
      return {
        ...blog,
        authorName: author?.name || 'Unknown',
        authorEmail: author?.email || 'unknown@example.com',
        authorId: author?._id || null
      };
    }));
    
    // Create pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    // Build pagination links
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    
    // Return response with pagination
    res.apiSuccess({
      message: 'Blogs retrieved successfully',
      data: blogsWithAuthor,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
          links: {
            self: `${baseUrl}?page=${page}&limit=${limit}`,
            first: `${baseUrl}?page=1&limit=${limit}`,
            last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
            next: hasNext ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
            prev: hasPrev ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null
          }
        },
        filters: {
          tag,
          search,
          sortBy,
          sortOrder: sortOrder === 1 ? 'asc' : 'desc'
        }
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.apiError({
      message: 'Error retrieving blogs',
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    });
  }
});

// Get a single blog post by ID
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get blogs and users collections
    const blogsCollection = await getCollection('blogs');
    const usersCollection = await getCollection('users');
    
    // Find the blog by ID
    let blog;
    try {
      blog = await blogsCollection.findOne({ _id: new ObjectId(id) });
    } catch (e) {
      // If ID is not a valid ObjectId, try finding by string ID or slug
      blog = await blogsCollection.findOne({ 
        $or: [
          { id: id },
          { slug: id }
        ]
      });
    }
    
    if (!blog) {
      return res.apiError({
        message: 'Blog not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    
    // Increment view count
    await blogsCollection.updateOne(
      { _id: blog._id },
      { $inc: { views: 1 } }
    );
    
    // Get author details
    const author = await usersCollection.findOne(
      { _id: new ObjectId(blog.authorId) },
      { projection: { name: 1, email: 1, bio: 1, _id: 1 } }
    );
    
    // Get related blogs (same tags, excluding current blog)
    const relatedBlogs = await blogsCollection.find({
      _id: { $ne: blog._id },
      status: 'PUBLISHED',
      tags: { $in: blog.tags || [] }
    })
    .sort({ views: -1 })
    .limit(3)
    .toArray();
    
    // Format related blogs
    const formattedRelatedBlogs = relatedBlogs.map(relatedBlog => ({
      id: relatedBlog._id,
      title: relatedBlog.title,
      slug: relatedBlog.slug,
      tags: relatedBlog.tags
    }));
    
    // Return blog with author details and related blogs
    res.apiSuccess({
      message: 'Blog retrieved successfully',
      data: {
        ...blog,
        views: (blog.views || 0) + 1, // Increment view count in response
        authorName: author?.name || 'Unknown',
        authorEmail: author?.email || 'unknown@example.com',
        authorBio: author?.bio || '',
        authorId: author?._id || null,
        relatedBlogs: formattedRelatedBlogs
      }
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.apiError({
      message: 'Error retrieving blog',
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR
    });
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

      const { title, content, tags = [], status = 'DRAFT' } = req.body;
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
        status: status.toUpperCase(),
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

// Update blog (protected route)
app.put('/api/blogs/:id', 
  authMiddleware,
  [
    body('title').optional().notEmpty(),
    body('content').optional().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, content, tags, status } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Get blogs collection
      const blogsCollection = await getCollection('blogs');
      
      // Find the blog
      let blog;
      try {
        blog = await blogsCollection.findOne({ _id: new ObjectId(id) });
      } catch (e) {
        // If ID is not a valid ObjectId, try finding by string ID
        blog = await blogsCollection.findOne({ id: id });
      }
      
      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }
      
      // Check if user is the author
      if (blog.authorId.toString() !== userId.toString()) {
        return res.status(403).json({ error: 'Not authorized to update this blog' });
      }
      
      // Prepare update data
      const updateData = {
        updatedAt: new Date()
      };
      
      if (title) {
        updateData.title = title;
        updateData.slug = title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
      }
      
      if (content) {
        updateData.content = content;
      }
      
      if (tags) {
        updateData.tags = tags;
      }
      
      if (status) {
        updateData.status = status.toUpperCase();
      }
      
      // Update blog
      await blogsCollection.updateOne(
        { _id: blog._id },
        { $set: updateData }
      );
      
      // Get the updated blog
      const updatedBlog = await blogsCollection.findOne({ _id: blog._id });
      
      res.json(updatedBlog);
    } catch (error) {
      console.error('Update blog error:', error);
      res.status(500).json({ error: 'Server error' });
    }
});

// Delete blog (protected route)
app.delete('/api/blogs/:id', 
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Get blogs collection
      const blogsCollection = await getCollection('blogs');
      
      // Find the blog
      let blog;
      try {
        blog = await blogsCollection.findOne({ _id: new ObjectId(id) });
      } catch (e) {
        // If ID is not a valid ObjectId, try finding by string ID
        blog = await blogsCollection.findOne({ id: id });
      }
      
      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }
      
      // Check if user is the author
      if (blog.authorId.toString() !== userId.toString()) {
        return res.status(403).json({ error: 'Not authorized to delete this blog' });
      }
      
      // Delete blog
      await blogsCollection.deleteOne({ _id: blog._id });
      
      res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
      console.error('Delete blog error:', error);
      res.status(500).json({ error: 'Server error' });
    }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware (should be after all routes)
app.use(errorHandler);

// 404 handler for undefined routes
app.use((req, res) => {
  res.apiError({
    message: 'Route not found',
    statusCode: StatusCodes.NOT_FOUND,
    errors: {
      endpoint: req.originalUrl,
      method: req.method
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- POST /api/auth/register - Register a new user');
  console.log('- POST /api/auth/login - Login user');
  console.log('- GET /api/profile - Get user profile (protected)');
  console.log('- GET /api/blogs - Get all published blogs');
  console.log('- GET /api/blogs/:id - Get a single blog post');
  console.log('- POST /api/blogs - Create a new blog (protected)');
  console.log('- PUT /api/blogs/:id - Update a blog post (protected)');
  console.log('- DELETE /api/blogs/:id - Delete a blog post (protected)');
  console.log('- GET /api/health - Health check');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 