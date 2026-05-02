const PHONEPE_PATHS = {
  token: '/v1/oauth/token',
  pay: '/checkout/v2/pay',
  status: (merchantOrderId) => `/checkout/v2/order/${merchantOrderId}/status`
};

const trimTrailingSlash = (value) => value?.replace(/\/+$/, '');

module.exports = {
  clientId: process.env.PHONEPE_CLIENT_ID || process.env.PHONEPE_MERCHANT_ID,
  clientSecret: process.env.PHONEPE_CLIENT_SECRET || process.env.PHONEPE_SALT_KEY,
  clientVersion: process.env.PHONEPE_CLIENT_VERSION || process.env.PHONEPE_SALT_INDEX || '1',
  apiBaseUrl: trimTrailingSlash(
    process.env.PHONEPE_BASE_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox'
  ),
  backendUrl: trimTrailingSlash(process.env.BACKEND_URL),
  frontendUrl: trimTrailingSlash(process.env.FRONTEND_URL),
  paths: PHONEPE_PATHS
};
