import axios from 'axios';

// API client pointing to Vite proxy or configured API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header if token exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smart_pm_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired and not on public pages
      const isAuthRoute =
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register') ||
        window.location.pathname === '/';
      if (!isAuthRoute) {
        localStorage.removeItem('smart_pm_token');
        localStorage.removeItem('smart_pm_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
