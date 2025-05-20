import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createAuthMiddleware } from './lib/auth.js';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { generateToken } from './lib/auth.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      }
    }
  }
}

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'USER'
        }
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
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

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
app.get('/api/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Blog routes
// Get all published blogs
app.get('/api/blogs', async (_req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    res.json(blogs);
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
  async (req: Request, res: Response) => {
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

      const blog = await prisma.blog.create({
        data: {
          title,
          content,
          slug: title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-'),
          authorId: userId,
          tags,
          status: 'DRAFT'
        }
      });

      res.status(201).json(blog);
    } catch (error) {
      console.error('Create blog error:', error);
      res.status(500).json({ error: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 