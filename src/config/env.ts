// Environment configuration
import {
    API_BASE_URL,
    APP_NAME,
    APP_VERSION,
    EXPO_PUBLIC_ENV,
    NODE_ENV
} from '@env';

export const ENV = {
  // App Configuration
  appName: APP_NAME,
  appVersion: APP_VERSION,
  apiBaseUrl: API_BASE_URL,
  
  // Environment
  nodeEnv: NODE_ENV,
  env: EXPO_PUBLIC_ENV,
  
  // Development helpers
  isDevelopment: NODE_ENV === 'development',
  isProduction: NODE_ENV === 'production',
  
  // Firebase configuration is handled in firebase.ts
};

export default ENV;
