// Validation service for form inputs and data validation
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class ValidationService {
  // Common validation patterns
  static patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\+]?[1-9][\d]{0,15}$/,
    indianPhone: /^[6-9]\d{9}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    aadhaar: /^\d{12}$/,
    pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    pincode: /^[1-9][0-9]{5}$/,
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    cropName: /^[a-zA-Z\s]{2,50}$/,
    soilType: /^[a-zA-Z\s]{2,30}$/,
    weatherCondition: /^[a-zA-Z\s]{2,30}$/,
  };

  // Common validation messages
  static messages = {
    required: 'This field is required',
    minLength: (min: number) => `Minimum length is ${min} characters`,
    maxLength: (max: number) => `Maximum length is ${max} characters`,
    pattern: 'Invalid format',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    indianPhone: 'Please enter a valid Indian phone number',
    password: 'Password must contain at least 8 characters with uppercase, lowercase, number and special character',
    aadhaar: 'Please enter a valid 12-digit Aadhaar number',
    pan: 'Please enter a valid PAN number',
    pincode: 'Please enter a valid 6-digit pincode',
    url: 'Please enter a valid URL',
    cropName: 'Please enter a valid crop name (2-50 characters)',
    soilType: 'Please enter a valid soil type (2-30 characters)',
    weatherCondition: 'Please enter a valid weather condition (2-30 characters)',
  };

  // Validate a single field
  static validateField(field: string, value: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];

    for (const rule of rules) {
      const error = this.validateRule(field, value, rule);
      if (error) {
        errors.push(error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate a single rule
  private static validateRule(field: string, value: any, rule: ValidationRule): string | null {
    // Required validation
    if (rule.required && (value === null || value === undefined || value === '')) {
      return rule.message || this.messages.required;
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === null || value === undefined || value === '')) {
      return null;
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || this.messages.minLength(rule.minLength);
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || this.messages.maxLength(rule.maxLength);
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || this.messages.pattern;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }

  // Common validation rules
  static rules = {
    required: (message?: string): ValidationRule => ({
      required: true,
      message: message || this.messages.required,
    }),

    email: (message?: string): ValidationRule => ({
      required: true,
      pattern: this.patterns.email,
      message: message || this.messages.email,
    }),

    phone: (message?: string): ValidationRule => ({
      required: true,
      pattern: this.patterns.phone,
      message: message || this.messages.phone,
    }),

    indianPhone: (message?: string): ValidationRule => ({
      required: true,
      pattern: this.patterns.indianPhone,
      message: message || this.messages.indianPhone,
    }),

    password: (message?: string): ValidationRule => ({
      required: true,
      pattern: this.patterns.password,
      message: message || this.messages.password,
    }),

    aadhaar: (message?: string): ValidationRule => ({
      required: true,
      pattern: this.patterns.aadhaar,
      message: message || this.messages.aadhaar,
    }),

    pan: (message?: string): ValidationRule => ({
      required: true,
      pattern: this.patterns.pan,
      message: message || this.messages.pan,
    }),

    pincode: (message?: string): ValidationRule => ({
      required: true,
      pattern: this.patterns.pincode,
      message: message || this.messages.pincode,
    }),

    url: (message?: string): ValidationRule => ({
      required: true,
      pattern: this.patterns.url,
      message: message || this.messages.url,
    }),

    cropName: (message?: string): ValidationRule => ({
      required: true,
      pattern: this.patterns.cropName,
      message: message || this.messages.cropName,
    }),

    soilType: (message?: string): ValidationRule => ({
      required: true,
      pattern: this.patterns.soilType,
      message: message || this.messages.soilType,
    }),

    weatherCondition: (message?: string): ValidationRule => ({
      required: true,
      pattern: this.patterns.weatherCondition,
      message: message || this.messages.weatherCondition,
    }),

    minLength: (min: number, message?: string): ValidationRule => ({
      minLength: min,
      message: message || this.messages.minLength(min),
    }),

    maxLength: (max: number, message?: string): ValidationRule => ({
      maxLength: max,
      message: message || this.messages.maxLength(max),
    }),

    range: (min: number, max: number, message?: string): ValidationRule => ({
      custom: (value: number) => {
        if (value < min || value > max) {
          return message || `Value must be between ${min} and ${max}`;
        }
        return null;
      },
    }),

    positiveNumber: (message?: string): ValidationRule => ({
      custom: (value: number) => {
        if (value <= 0) {
          return message || 'Value must be positive';
        }
        return null;
      },
    }),

    nonNegativeNumber: (message?: string): ValidationRule => ({
      custom: (value: number) => {
        if (value < 0) {
          return message || 'Value must be non-negative';
        }
        return null;
      },
    }),

    futureDate: (message?: string): ValidationRule => ({
      custom: (value: Date) => {
        if (value <= new Date()) {
          return message || 'Date must be in the future';
        }
        return null;
      },
    }),

    pastDate: (message?: string): ValidationRule => ({
      custom: (value: Date) => {
        if (value >= new Date()) {
          return message || 'Date must be in the past';
        }
        return null;
      },
    }),
  };

  // Form-specific validation rules
  static formRules = {
    // User registration
    userRegistration: {
      name: [this.rules.required(), this.rules.minLength(2), this.rules.maxLength(50)],
      email: [this.rules.email()],
      phone: [this.rules.indianPhone()],
      password: [this.rules.password()],
      confirmPassword: [this.rules.required()],
    },

    // User profile
    userProfile: {
      name: [this.rules.required(), this.rules.minLength(2), this.rules.maxLength(50)],
      email: [this.rules.email()],
      phone: [this.rules.indianPhone()],
      address: [this.rules.maxLength(200)],
      pincode: [this.rules.pincode()],
      aadhaar: [this.rules.aadhaar()],
      pan: [this.rules.pan()],
    },

    // Crop information
    cropInfo: {
      name: [this.rules.cropName()],
      variety: [this.rules.required(), this.rules.minLength(2), this.rules.maxLength(50)],
      plantingDate: [this.rules.required()],
      expectedHarvestDate: [this.rules.required()],
      area: [this.rules.required(), this.rules.positiveNumber()],
      soilType: [this.rules.soilType()],
    },

    // Weather data
    weatherData: {
      temperature: [this.rules.required(), this.rules.range(-50, 60)],
      humidity: [this.rules.required(), this.rules.range(0, 100)],
      rainfall: [this.rules.nonNegativeNumber()],
      windSpeed: [this.rules.nonNegativeNumber()],
      pressure: [this.rules.required(), this.rules.positiveNumber()],
      condition: [this.rules.weatherCondition()],
    },

    // Government scheme
    governmentScheme: {
      title: [this.rules.required(), this.rules.minLength(5), this.rules.maxLength(100)],
      description: [this.rules.required(), this.rules.minLength(10), this.rules.maxLength(500)],
      category: [this.rules.required()],
      department: [this.rules.required(), this.rules.minLength(2), this.rules.maxLength(50)],
      eligibility: [this.rules.required()],
      benefits: [this.rules.required()],
      applicationProcess: [this.rules.required()],
      requiredDocuments: [this.rules.required()],
      deadline: [this.rules.futureDate()],
    },

    // Knowledge base
    knowledgeBase: {
      title: [this.rules.required(), this.rules.minLength(5), this.rules.maxLength(100)],
      description: [this.rules.required(), this.rules.minLength(10), this.rules.maxLength(1000)],
      category: [this.rules.required()],
      tags: [this.rules.required()],
      content: [this.rules.required(), this.rules.minLength(50), this.rules.maxLength(5000)],
    },

    // Community post
    communityPost: {
      title: [this.rules.required(), this.rules.minLength(5), this.rules.maxLength(100)],
      content: [this.rules.required(), this.rules.minLength(10), this.rules.maxLength(1000)],
      category: [this.rules.required()],
      tags: [this.rules.maxLength(200)],
    },

    // Activity
    activity: {
      type: [this.rules.required()],
      cropName: [this.rules.cropName()],
      description: [this.rules.required(), this.rules.minLength(10), this.rules.maxLength(500)],
      priority: [this.rules.required()],
      dueDate: [this.rules.required()],
      duration: [this.rules.positiveNumber()],
      notes: [this.rules.maxLength(500)],
    },
  };

  // Validate form data
  static validateForm(formData: any, formType: keyof typeof this.formRules): ValidationResult {
    const rules = this.formRules[formType];
    const errors: string[] = [];

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      const result = this.validateField(fieldName, formData[fieldName], fieldRules);
      if (!result.isValid) {
        errors.push(...result.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Sanitize input data
  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input.trim().replace(/[<>]/g, '');
    }
    return input;
  }

  // Validate and sanitize form data
  static validateAndSanitizeForm(formData: any, formType: keyof typeof this.formRules): {
    isValid: boolean;
    errors: string[];
    sanitizedData: any;
  } {
    const sanitizedData = { ...formData };
    
    // Sanitize string inputs
    for (const key in sanitizedData) {
      if (typeof sanitizedData[key] === 'string') {
        sanitizedData[key] = this.sanitizeInput(sanitizedData[key]);
      }
    }

    const validationResult = this.validateForm(sanitizedData, formType);

    return {
      isValid: validationResult.isValid,
      errors: validationResult.errors,
      sanitizedData,
    };
  }
}

export const validationService = new ValidationService();
export default ValidationService;