// Paystack Configuration
export const PAYSTACK_CONFIG = {
  // Test/Sandbox environment (for development)
  test: {
    publicKey: 'pk_test_1234567890abcdef', // Replace with your Paystack test public key
    currency: 'ZAR', // South African Rand
  },
  
  // Production environment (for live deployment)
  production: {
    publicKey: '', // Replace with your Paystack production public key
    currency: 'ZAR', // South African Rand
  },
};

// Get current configuration based on environment
export const getCurrentPaystackConfig = () => {
  // For development, use test config
  // In production, you might want to check an environment variable
  const isDevelopment = __DEV__;
  
  return isDevelopment ? PAYSTACK_CONFIG.test : PAYSTACK_CONFIG.production;
};

// Paystack error messages
export const PAYSTACK_ERROR_MESSAGES = {
  INVALID_AMOUNT: 'Invalid payment amount',
  INVALID_EMAIL: 'Invalid email address',
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  PAYMENT_CANCELLED: 'Payment was cancelled',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  INVALID_RESPONSE: 'Invalid response from Paystack',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  CARD_DECLINED: 'Card was declined',
};

// Paystack success codes
export const PAYSTACK_STATUS_CODES = {
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export default PAYSTACK_CONFIG;
