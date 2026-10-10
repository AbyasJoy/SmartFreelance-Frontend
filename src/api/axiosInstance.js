import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Uniform error handling & 401 expiration safety
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        // Clear invalid/expired session data safely
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Do not force infinite redirect loop; dispatch custom event or allow components/auth context to handle
        window.dispatchEvent(new CustomEvent('unauthorized-event'));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
