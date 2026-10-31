import axios from 'axios';

const getBaseURL = () => {
  // When running in the browser:
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // If NEXT_PUBLIC_API_URL is set:
    if (process.env.NEXT_PUBLIC_API_URL) {
      const configuredUrl = process.env.NEXT_PUBLIC_API_URL.trim();
      // If deployed on Vercel/production or mobile, but env var erroneously points to localhost or HTTP, safely fallback to relative /api
      if (!isLocalhost && (configuredUrl.includes('localhost') || configuredUrl.includes('127.0.0.1'))) {
        return '/api';
      }
      if (window.location.protocol === 'https:' && configuredUrl.startsWith('http:')) {
        return '/api';
      }
      return configuredUrl;
    }

    // Default for browser: use relative /api
    // - On Vercel: routed by vercel.json rewrite to backend service
    // - On Localhost: routed by next.config.js rewrite to http://localhost:5000/api
    return '/api';
  }

  // Server-side rendering (SSR) fallback
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
});

// Request Interceptor: Attach JWT Token
API.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('clubfund_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('clubfund_token');
        localStorage.removeItem('clubfund_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
