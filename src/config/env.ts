// Environment configuration using Expo's built-in support
const ENV = {
  // App Configuration
  appName: process.env.EXPO_PUBLIC_APP_NAME || 'Foodie Restaurant',
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://your-api-url.com',
  
  // Environment
  nodeEnv: process.env.EXPO_PUBLIC_NODE_ENV || 'development',
  env: process.env.EXPO_PUBLIC_ENV || 'development',
  
  // Development helpers
  isDevelopment: (process.env.EXPO_PUBLIC_NODE_ENV || 'development') === 'development',
  isProduction: (process.env.EXPO_PUBLIC_NODE_ENV || 'development') === 'production',
  
  // Firebase configuration is handled in firebase.ts
};

export default ENV;
