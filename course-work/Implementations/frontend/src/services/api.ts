import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(import.meta.env.VITE_TOKEN_KEY || 'restaurant_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem(import.meta.env.VITE_TOKEN_KEY || "restaurant_token");
      window.location.href = "/login";
      toast.error("Session expired. Please login again.");
    } else if (status === 403) {
      toast.error("You do not have permission to perform this action.");
    } else if (status === 404) {
      toast.error("Resource not found.");
    } else if (status && status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;