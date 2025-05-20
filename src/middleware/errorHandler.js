/**
 * Global error handling middleware
 * Catches all errors and sends appropriate responses
 */

import { StatusCodes } from 'http-status-codes';
import { errorResponse } from '../lib/apiResponse.js';

const errorHandler = (err, req, res, next) => {
  // Log error details in development/staging environments
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err.message);
    console.error(err.stack);
  }

  // Default error status and message
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;
  let meta = {};

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(e => e.message);
  } else if (err.name === 'CastError') {
    // Mongoose cast error (invalid ID)
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid ID format';
    errors = { id: 'The provided ID is not valid' };
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = StatusCodes.CONFLICT;
    message = 'Duplicate key error';
    const field = Object.keys(err.keyValue)[0];
    errors = { [field]: `${field} already exists` };
  } else if (err.name === 'JsonWebTokenError') {
    // JWT error
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    // JWT expired
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Token expired';
  } else if (err.type === 'entity.parse.failed') {
    // JSON parse error
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid JSON in request body';
  } else if (err.name === 'SyntaxError') {
    // Syntax error
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Syntax Error';
  } else if (err.name === 'MongoServerError') {
    // MongoDB server error
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    message = 'Database error';
  }

  // Add request information to error response in development
  if (process.env.NODE_ENV === 'development') {
    meta.request = {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body
    };
    
    // Add stack trace in development
    meta.stack = err.stack;
  }

  // Create error response
  const response = errorResponse({
    message,
    statusCode,
    errors,
    meta: Object.keys(meta).length > 0 ? meta : undefined
  });

  // Send error response
  return res.status(statusCode).json(response);
};

export default errorHandler;