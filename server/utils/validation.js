// Validation service for all input validation
export const validationService = {
  // Validate user registration data
  validateUserRegistration: (data) => {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (!data.phone || !/^[6-9]\d{9}$/.test(data.phone)) {
      errors.push('Please enter a valid Indian phone number');
    }
    
    if (!data.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate activity data
  validateActivity: (data) => {
    const errors = [];
    
    if (!data.type) {
      errors.push('Activity type is required');
    }
    
    if (!data.cropName || data.cropName.trim().length === 0) {
      errors.push('Crop name is required');
    }
    
    if (!data.description || data.description.trim().length === 0) {
      errors.push('Activity description is required');
    }
    
    if (!data.date) {
      errors.push('Activity date is required');
    }
    
    if (data.cost && data.cost < 0) {
      errors.push('Cost cannot be negative');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate post data
  validatePost: (data) => {
    const errors = [];
    
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Post title is required');
    }
    
    if (!data.content || data.content.trim().length === 0) {
      errors.push('Post content is required');
    }
    
    if (data.title && data.title.length > 200) {
      errors.push('Post title cannot exceed 200 characters');
    }
    
    if (data.content && data.content.length > 5000) {
      errors.push('Post content cannot exceed 5000 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate crop info
  validateCropInfo: (data) => {
    const errors = [];
    
    if (!data.cropName || data.cropName.trim().length === 0) {
      errors.push('Crop name is required');
    }
    
    if (data.plantingDate && new Date(data.plantingDate) > new Date()) {
      errors.push('Planting date cannot be in the future');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate phone number
  validatePhone: (phone) => {
    return /^[6-9]\d{9}$/.test(phone);
  },

  // Validate email
  validateEmail: (email) => {
    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
  },

  // Validate password strength
  validatePassword: (password) => {
    const errors = [];
    
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Sanitize input
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  },

  // Validate file upload
  validateFileUpload: (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'], maxSize = 10 * 1024 * 1024) => {
    const errors = [];
    
    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }
    
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('Invalid file type. Only images are allowed.');
    }
    
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate coordinates
  validateCoordinates: (lat, lng) => {
    const errors = [];
    
    if (lat < -90 || lat > 90) {
      errors.push('Latitude must be between -90 and 90');
    }
    
    if (lng < -180 || lng > 180) {
      errors.push('Longitude must be between -180 and 180');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate date range
  validateDateRange: (startDate, endDate) => {
    const errors = [];
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.push('Start date must be before end date');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};