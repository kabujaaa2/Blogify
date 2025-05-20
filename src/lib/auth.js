import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '..', '..', '.env') });

// JWT Secret - Use environment variable or fallback
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-replace-in-production';
const JWT_EXPIRY = '24h'; // Token expiry time

// Generate JWT token for a user
export function generateToken(user) {
  // Payload data to include in the token
  const payload = {
    userId: user._id || user.id, // Support both MongoDB _id and regular id
    email: user.email,
    role: user.role
  };

  // Sign the token with the secret and expiry
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    // Verify and decode the token
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // Token verification failed
    return null;
  }
}

// Create Express middleware for authentication
export function createAuthMiddleware() {
  return (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Attach user data to the request object
    req.user = decodedToken;
    
    // Continue to the next middleware or route handler
    next();
  };
}

// Middleware for role-based authorization
export function requireRole(role) {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Check if user has the required role
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // User has the required role, continue
    next();
  };
} 