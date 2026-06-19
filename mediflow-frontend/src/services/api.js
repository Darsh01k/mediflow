import axios from 'axios';
import { isSessionExpired, getSessionExpirationReason } from '../utils/auth';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('loginTimestamp');
  localStorage.removeItem('lastActivityTimestamp');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('loginTimestamp');
  sessionStorage.removeItem('lastActivityTimestamp');
};

// Request interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      const isAuthEndpoint = config.url && (
        config.url.includes('/auth/login') || 
        config.url.includes('/auth/register')
      );
      
      if (!isAuthEndpoint && isSessionExpired()) {
        const reason = getSessionExpirationReason() || 'session';
        clearAuthStorage();
        localStorage.setItem('logoutReason', reason);
        
        // Redirect immediately if not on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        // Cancel the request to avoid sending it to backend
        return Promise.reject(new axios.Cancel('Session expired'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid redirect loops if we are already on login page
      if (!window.location.pathname.includes('/login')) {
        clearAuthStorage();
        localStorage.setItem('logoutReason', 'session');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
