import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided or invalid token format');
  }

  return authHeader.split(' ')[1];
};

export const createAuthMiddleware = () => {
  return async (req, res, next) => {
    try {
      const token = extractTokenFromHeader(req.headers.authorization);
      const payload = verifyToken(token);
      req.user = payload;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
}; 