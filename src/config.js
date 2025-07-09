// Base configuration
const config = {
  // API endpoints
  api: {
    baseURL: 'http://20.244.56.144/evaluation-service',
    endpoints: {
      auth: '/auth',
      shorten: '/shorten',
      analytics: '/analytics'
    },
    timeout: 10000
  },
  
  // User credentials
  credentials: {
    email: 'rohini04141@gmail.com',
    name: 'Rohini Kalivireddy',
    rollNo: '23J45A0509',
    accessCode: 'eeWErx',
    clientID: 'a427ff17-8816-4cb2-b10b-0cba4e49e2a6',
    clientSecret: 'embJHMJXMumexDrc'
  },
  
  // Authentication
  auth: {
    token: null,
    tokenExpiry: null
  },
  
  // App settings
  app: {
    name: 'URL Shortener',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }
};

// Helper function to get full URL for an endpoint
config.getEndpoint = (endpoint) => {
  if (config.api.endpoints[endpoint]) {
    return `${config.api.baseURL}${config.api.endpoints[endpoint]}`;
  }
  return `${config.api.baseURL}${endpoint}`;
};

// Set authentication token
config.setToken = (token, expiresIn = 3600) => {
  config.auth.token = token;
  config.auth.tokenExpiry = new Date(Date.now() + (expiresIn * 1000));
};

// Check if token is expired
config.isTokenExpired = () => {
  if (!config.auth.tokenExpiry) return true;
  return new Date() >= config.auth.tokenExpiry;
};

export default config;