// Error service for consistent error handling
export class ErrorService {
  // Error types
  static ERROR_TYPES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    API_ERROR: 'API_ERROR',
    FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
    CAMERA_ERROR: 'CAMERA_ERROR',
    STORAGE_ERROR: 'STORAGE_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
  };

  // Create error object
  static createError(type: string, message: string, details: any = null) {
    return {
      type,
      message,
      details,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
  }

  // Handle API errors
  static handleApiError(error: any, context: string = 'unknown') {
    console.error(`Error in ${context}:`, error);

    // Network errors
    if (error.message?.includes('Network request failed') || 
        error.message?.includes('fetch')) {
      return this.createError(
        this.ERROR_TYPES.NETWORK_ERROR,
        'Network connection failed. Please check your internet connection.'
      );
    }

    // API errors
    if (error.response) {
      const status = error.response.status;
      let message = 'An error occurred';

      switch (status) {
        case 400:
          message = error.response.data?.message || 'Invalid request';
          break;
        case 401:
          message = 'Please log in to continue';
          break;
        case 403:
          message = 'You do not have permission to perform this action';
          break;
        case 404:
          message = 'The requested resource was not found';
          break;
        case 500:
          message = 'Server error. Please try again later';
          break;
        default:
          message = error.response.data?.message || 'An error occurred';
      }

      return this.createError(
        this.ERROR_TYPES.API_ERROR,
        message,
        error.response.data
      );
    }

    // Default error
    return this.createError(
      this.ERROR_TYPES.INTERNAL_ERROR,
      error.message || 'An unexpected error occurred'
    );
  }

  // Handle general errors
  static handleError(error: any, context: string = 'unknown') {
    console.error(`Error in ${context}:`, error);

    // Camera/Permission errors
    if (error.code === 'camera_unavailable' || 
        error.message?.includes('camera')) {
      return this.createError(
        this.ERROR_TYPES.CAMERA_ERROR,
        'Camera is not available. Please check permissions.'
      );
    }

    // File upload errors
    if (error.message?.includes('file') || 
        error.message?.includes('upload')) {
      return this.createError(
        this.ERROR_TYPES.FILE_UPLOAD_ERROR,
        'File upload failed. Please try again.'
      );
    }

    // Storage errors
    if (error.message?.includes('storage') || 
        error.message?.includes('AsyncStorage')) {
      return this.createError(
        this.ERROR_TYPES.STORAGE_ERROR,
        'Storage operation failed. Please try again.'
      );
    }

    // Default error
    return this.createError(
      this.ERROR_TYPES.INTERNAL_ERROR,
      error.message || 'An unexpected error occurred'
    );
  }

  // Get user-friendly error message
  static getUserFriendlyMessage(error: any) {
    const friendlyMessages = {
      [this.ERROR_TYPES.VALIDATION_ERROR]: 'Please check your input and try again',
      [this.ERROR_TYPES.AUTHENTICATION_ERROR]: 'Please log in to continue',
      [this.ERROR_TYPES.AUTHORIZATION_ERROR]: 'You do not have permission to perform this action',
      [this.ERROR_TYPES.NOT_FOUND_ERROR]: 'The requested resource was not found',
      [this.ERROR_TYPES.NETWORK_ERROR]: 'Network connection failed. Please check your internet',
      [this.ERROR_TYPES.API_ERROR]: 'Service temporarily unavailable. Please try again',
      [this.ERROR_TYPES.FILE_UPLOAD_ERROR]: 'File upload failed. Please check file size and format',
      [this.ERROR_TYPES.CAMERA_ERROR]: 'Camera is not available. Please check permissions',
      [this.ERROR_TYPES.STORAGE_ERROR]: 'Storage operation failed. Please try again',
      [this.ERROR_TYPES.INTERNAL_ERROR]: 'Something went wrong. Please try again later'
    };

    return friendlyMessages[error.type] || error.message || 'An unexpected error occurred';
  }

  // Log error for monitoring
  static logError(error: any, context: string = 'unknown', userId: string | null = null) {
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
    console.error('Error Log:', errorLog);
  }

  // Validate error object
  static isValidError(error: any) {
    return error && 
           typeof error === 'object' && 
           error.type && 
           error.message && 
           error.timestamp;
  }

  // Retry mechanism for network requests
  static async retryOperation(operation: () => Promise<any>, maxRetries: number = 3, delay: number = 1000) {
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
  }

  // Check if error is retryable
  static isRetryableError(error: any) {
    const retryableTypes = [
      this.ERROR_TYPES.NETWORK_ERROR,
      this.ERROR_TYPES.API_ERROR
    ];
    
    return retryableTypes.includes(error.type);
  }

  // Format error for display
  static formatErrorForDisplay(error: any) {
    return {
      title: 'Error',
      message: this.getUserFriendlyMessage(error),
      type: error.type,
      timestamp: error.timestamp
    };
  }
}

export const errorService = new ErrorService();