import axios from 'axios';
import config from './config';

class ApiService {
  constructor() {
    this.axios = axios.create({
      baseURL: config.api.baseURL,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Request interceptor for adding auth token
    this.axios.interceptors.request.use(
      async (config) => {
        // Skip adding token for auth endpoint
        if (!config.url.includes('/auth') && !config.headers.Authorization) {
          try {
            const token = await this.getAuthToken();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('Failed to get auth token:', error);
            throw error;
          }
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling errors
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await this.getAuthToken(true); // Force refresh
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.axios(originalRequest);
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            // Redirect to login or handle token refresh failure
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async getAuthToken(forceRefresh = false) {
    // Return cached token if available, not expired, and not forcing refresh
    if (config.auth.token && !config.isTokenExpired() && !forceRefresh) {
      return config.auth.token;
    }
    
    try {
      const response = await axios.post(config.getEndpoint('auth'), {
        email: config.credentials.email,
        name: config.credentials.name,
        rollNo: config.credentials.rollNo,
        accessCode: config.credentials.accessCode,
        clientID: config.credentials.clientID,
        clientSecret: config.credentials.clientSecret
      });

      if (response.data?.access_token) {
        config.setToken(response.data.access_token, response.data.expires_in);
        return config.auth.token;
      }
      
      throw new Error('No access token received in response');
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error(`Authentication failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // URL Shortening
  async shortenURL(longURL, customCode = '') {
    try {
      const response = await this.axios.post('/shorten', {
        originalUrl: longURL,
        shortCode: customCode || undefined
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to shorten URL:', error);
      throw this.handleApiError(error);
    }
  }

  // Get URL details
  async getURLDetails(shortCode) {
    try {
      const response = await this.axios.get(`/url/${shortCode}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get URL details:', error);
      throw this.handleApiError(error);
    }
  }

  // Get analytics
  async getAnalytics(shortCode) {
    try {
      const response = await this.axios.get(`/analytics/${shortCode}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get analytics:', error);
      throw this.handleApiError(error);
    }
  }

  // Generic request methods
  async get(endpoint, params = {}) {
    try {
      const response = await this.axios.get(endpoint, { params });
      return response.data;
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw this.handleApiError(error);
    }
  }

  async post(endpoint, data = {}) {
    try {
      const response = await this.axios.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw this.handleApiError(error);
    }
  }

  async put(endpoint, data = {}) {
    try {
      const response = await this.axios.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw this.handleApiError(error);
    }
  }

  async delete(endpoint, data = {}) {
    try {
      const response = await this.axios.delete(endpoint, { data });
      return response.data;
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw this.handleApiError(error);
    }
  }

  // Error handling utility
  handleApiError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      let message = 'An error occurred';
      if (data && data.message) {
        message = data.message;
      } else if (status === 401) {
        message = 'Unauthorized - Please log in again';
      } else if (status === 403) {
        message = 'Forbidden - You do not have permission to perform this action';
      } else if (status === 404) {
        message = 'Resource not found';
      } else if (status >= 500) {
        message = 'Server error - Please try again later';
      }
      
      const apiError = new Error(message);
      apiError.status = status;
      apiError.data = data;
      return apiError;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return new Error('No response from server - Please check your connection');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      return error;
    }
  }

  async initialize() {
    try {
      await this.getAuthToken();
      return true;
    } catch (error) {
      console.error('Failed to initialize API service:', error);
      return false;
    }
  }
}

const apiService = new ApiService();

export default apiService;
