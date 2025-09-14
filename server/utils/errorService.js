// Error service for consistent error handling
export const errorService = {
  // Error types
  ERROR_TYPES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    DUPLICATE_ERROR: 'DUPLICATE_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
    FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
    AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
  },

  // Create error object
  createError: (type, message, details = null) => {
    return {
      type,
      message,
      details,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
  },

  // Handle API errors
  handleApiError: (error, context = 'unknown') => {
    console.error(`Error in ${context}:`, error);

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return this.createError(
        this.ERROR_TYPES.VALIDATION_ERROR,
        'Validation failed',
        errors
      );
    }

    // Mongoose cast error
    if (error.name === 'CastError') {
      return this.createError(
        this.ERROR_TYPES.VALIDATION_ERROR,
        'Invalid ID format'
      );
    }

    // Mongoose duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return this.createError(
        this.ERROR_TYPES.DUPLICATE_ERROR,
        `${field} already exists`
      );
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
      return this.createError(
        this.ERROR_TYPES.AUTHENTICATION_ERROR,
        'Invalid token'
      );
    }

    if (error.name === 'TokenExpiredError') {
      return this.createError(
        this.ERROR_TYPES.AUTHENTICATION_ERROR,
        'Token expired'
      );
    }

    // Multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return this.createError(
        this.ERROR_TYPES.FILE_UPLOAD_ERROR,
        'File too large'
      );
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return this.createError(
        this.ERROR_TYPES.FILE_UPLOAD_ERROR,
        'Unexpected file field'
      );
    }

    // Network errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return this.createError(
        this.ERROR_TYPES.NETWORK_ERROR,
        'Network connection failed'
      );
    }

    // External API errors
    if (error.response) {
      return this.createError(
        this.ERROR_TYPES.EXTERNAL_API_ERROR,
        `External API error: ${error.response.status}`,
        error.response.data
      );
    }

    // Default internal error
    return this.createError(
      this.ERROR_TYPES.INTERNAL_ERROR,
      process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message
    );
  },

  // Get user-friendly error message
  getUserFriendlyMessage: (error) => {
    const friendlyMessages = {
      [this.ERROR_TYPES.VALIDATION_ERROR]: 'Please check your input and try again',
      [this.ERROR_TYPES.AUTHENTICATION_ERROR]: 'Please log in to continue',
      [this.ERROR_TYPES.AUTHORIZATION_ERROR]: 'You do not have permission to perform this action',
      [this.ERROR_TYPES.NOT_FOUND_ERROR]: 'The requested resource was not found',
      [this.ERROR_TYPES.DUPLICATE_ERROR]: 'This information already exists',
      [this.ERROR_TYPES.DATABASE_ERROR]: 'Database operation failed. Please try again',
      [this.ERROR_TYPES.EXTERNAL_API_ERROR]: 'External service is temporarily unavailable',
      [this.ERROR_TYPES.FILE_UPLOAD_ERROR]: 'File upload failed. Please check file size and format',
      [this.ERROR_TYPES.AI_SERVICE_ERROR]: 'AI service is temporarily unavailable',
      [this.ERROR_TYPES.NETWORK_ERROR]: 'Network connection failed. Please check your internet',
      [this.ERROR_TYPES.INTERNAL_ERROR]: 'Something went wrong. Please try again later'
    };

    return friendlyMessages[error.type] || error.message || 'An unexpected error occurred';
  },

  // Log error for monitoring
  logError: (error, context = 'unknown', userId = null) => {
    const errorLog = {
      id: error.id,
      type: error.type,
      message: error.message,
      context,
      userId,
      timestamp: error.timestamp,
      details: error.details,
      stack: error.stack
    };

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with monitoring service (e.g., Sentry, LogRocket)
      console.error('Error Log:', errorLog);
    } else {
      console.error('Error Log:', errorLog);
    }
  },

  // Handle async errors
  asyncHandler: (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  },

  // Create error response
  createErrorResponse: (error, statusCode = 500) => {
    return {
      success: false,
      message: this.getUserFriendlyMessage(error),
      error: {
        type: error.type,
        id: error.id,
        timestamp: error.timestamp
      },
      ...(process.env.NODE_ENV === 'development' && {
        details: error.details,
        stack: error.stack
      })
    };
  },

  // Validate error object
  isValidError: (error) => {
    return error && 
           typeof error === 'object' && 
           error.type && 
           error.message && 
           error.timestamp;
  },

  // Retry mechanism for external services
  retryOperation: async (operation, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError;
  },

  // Circuit breaker pattern for external services
  circuitBreaker: (operation, threshold = 5, timeout = 60000) => {
    let failures = 0;
    let lastFailureTime = null;
    let state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN

    return async (...args) => {
      if (state === 'OPEN') {
        if (Date.now() - lastFailureTime > timeout) {
          state = 'HALF_OPEN';
        } else {
          throw this.createError(
            this.ERROR_TYPES.EXTERNAL_API_ERROR,
            'Service temporarily unavailable'
          );
        }
      }

      try {
        const result = await operation(...args);
        
        if (state === 'HALF_OPEN') {
          state = 'CLOSED';
          failures = 0;
        }
        
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = Date.now();
        
        if (failures >= threshold) {
          state = 'OPEN';
        }
        
        throw error;
      }
    };
  }
};
