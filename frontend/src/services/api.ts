import axios from 'axios';
import { ApiError } from '../types/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = error.response?.data || {
        statusCode: 500,
        message: 'An unexpected error occurred',
        error: 'Internal Server Error',
      };
      return Promise.reject(apiError);
    }
    return Promise.reject(error);
  }
);

export default api; 