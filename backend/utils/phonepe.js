const axios = require('axios');
const phonePeConfig = require('../config/phonepe');

let cachedToken = null;

const decodePhonePeResponse = (body = {}) => {
  if (!body.response) return body;

  try {
    return JSON.parse(Buffer.from(body.response, 'base64').toString('utf8'));
  } catch (error) {
    return body;
  }
};

const getPhonePeAuthToken = async () => {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (cachedToken?.accessToken && cachedToken.expiresAt > nowInSeconds + 60) {
    return cachedToken.accessToken;
  }

  const formData = new URLSearchParams();
  formData.append('client_id', phonePeConfig.clientId);
  formData.append('client_version', phonePeConfig.clientVersion);
  formData.append('client_secret', phonePeConfig.clientSecret);
  formData.append('grant_type', 'client_credentials');

  const response = await axios.post(
    `${phonePeConfig.apiBaseUrl}${phonePeConfig.paths.token}`,
    formData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  cachedToken = {
    accessToken: response.data.access_token,
    expiresAt: response.data.expires_at || nowInSeconds + 300
  };

  return cachedToken.accessToken;
};

const initiatePhonePePayment = async (payload) => {
  const accessToken = await getPhonePeAuthToken();

  const response = await axios.post(
    `${phonePeConfig.apiBaseUrl}${phonePeConfig.paths.pay}`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${accessToken}`
      }
    }
  );

  return response.data;
};

const checkPhonePePaymentStatus = async (merchantOrderId) => {
  const accessToken = await getPhonePeAuthToken();
  const statusPath = phonePeConfig.paths.status(merchantOrderId);

  const response = await axios.get(
    `${phonePeConfig.apiBaseUrl}${statusPath}?details=false&errorContext=true`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${accessToken}`
      }
    }
  );

  return response.data;
};

module.exports = {
  decodePhonePeResponse,
  initiatePhonePePayment,
  checkPhonePePaymentStatus
};
