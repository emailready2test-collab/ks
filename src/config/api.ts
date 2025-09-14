// API configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api' 
  : 'https://your-production-api.com/api';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
  },
  DISEASES: {
    ANALYZE: '/diseases/analyze',
    REPORTS: '/diseases',
    PUBLIC_REPORTS: '/diseases/public/list',
    STATISTICS: '/diseases/stats/summary',
  },
  ACTIVITIES: {
    LIST: '/activities',
    CREATE: '/activities',
    STATISTICS: '/activities/stats/summary',
  },
  POSTS: {
    LIST: '/posts',
    CREATE: '/posts',
    TRENDING: '/posts/trending/list',
  },
  CHAT: {
    HISTORY: '/chat/history',
    SESSION: '/chat/session',
    MESSAGE: '/chat/message',
    QUICK_RESPONSES: '/chat/quick-responses',
  },
  WEATHER: {
    CURRENT: '/weather/current',
    FORECAST: '/weather/forecast',
    ALERTS: '/weather/alerts',
  },
  MARKET: {
    PRICES: '/market/prices',
    TRENDS: '/market/trends',
  },
  GOVERNMENT: {
    SCHEMES: '/government/schemes',
    BENEFITS: '/government/benefits',
  },
};

export const API_TIMEOUT = 30000; // 30 seconds

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov'],
};
