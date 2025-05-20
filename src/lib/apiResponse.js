/**
 * Standard API response utility
 * Provides consistent response format for all API endpoints
 */

import { StatusCodes } from 'http-status-codes';

/**
 * Creates a standardized success response
 * 
 * @param {Object} options - Response options
 * @param {any} options.data - The data to return
 * @param {string} options.message - Success message
 * @param {number} options.statusCode - HTTP status code (default: 200)
 * @param {Object} options.meta - Additional metadata
 * @returns {Object} Formatted success response
 */
export const successResponse = ({
  data = null,
  message = 'Operation successful',
  statusCode = StatusCodes.OK,
  meta = {}
}) => {
  return {
    success: true,
    message,
    statusCode,
    data,
    ...meta && { meta }
  };
};

/**
 * Creates a standardized error response
 * 
 * @param {Object} options - Response options
 * @param {string} options.message - Error message
 * @param {number} options.statusCode - HTTP status code (default: 500)
 * @param {Array|Object} options.errors - Detailed error information
 * @param {Object} options.meta - Additional metadata
 * @returns {Object} Formatted error response
 */
export const errorResponse = ({
  message = 'An error occurred',
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  errors = null,
  meta = {}
}) => {
  return {
    success: false,
    message,
    statusCode,
    ...(errors && { errors }),
    ...meta && { meta }
  };
};

/**
 * Express middleware to send standardized API responses
 * Adds res.apiSuccess and res.apiError methods to the response object
 */
export const apiResponse = (req, res, next) => {
  // Add success response method
  res.apiSuccess = function(options = {}) {
    const response = successResponse(options);
    return res.status(options.statusCode || StatusCodes.OK).json(response);
  };

  // Add error response method
  res.apiError = function(options = {}) {
    const response = errorResponse(options);
    return res.status(options.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(response);
  };

  next();
};

/**
 * Pagination helper for API responses
 * 
 * @param {Object} options - Pagination options
 * @param {number} options.page - Current page number
 * @param {number} options.limit - Items per page
 * @param {number} options.total - Total number of items
 * @param {string} options.baseUrl - Base URL for pagination links
 * @returns {Object} Pagination metadata
 */
export const paginationMeta = ({
  page = 1,
  limit = 10,
  total = 0,
  baseUrl = ''
}) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
      hasNext,
      hasPrev,
      ...(baseUrl && {
        links: {
          self: `${baseUrl}?page=${page}&limit=${limit}`,
          first: `${baseUrl}?page=1&limit=${limit}`,
          last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
          next: hasNext ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
          prev: hasPrev ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null
        }
      })
    }
  };
};

/**
 * Send a success response (legacy method)
 * @param {object} res - Express response object
 * @param {string} message - Success message
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send an error response (legacy method)
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {array} errors - Array of specific error messages
 */
export const sendError = (res, message, statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

/**
 * Create a custom error with status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} Custom error object
 */
export const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Async handler to catch errors in async route handlers
 * @param {function} fn - Async route handler function
 * @returns {function} Express middleware function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};