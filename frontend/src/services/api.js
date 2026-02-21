import axios from 'axios';

// In production, set VITE_API_URL to your Render backend URL (e.g., https://your-api.onrender.com)
// In local dev, Vite proxy (/api -> http://localhost:5000) still works.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.join(', ') ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const userAPI = {
  // Get all users with pagination
  getUsers: async (page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc') => {
    const response = await api.get('/users', {
      params: { page, limit, sortField, sortOrder },
    });
    return response.data;
  },

  // Get single user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Bulk delete users
  deleteUsersBulk: async (ids) => {
    const response = await api.post('/users/bulk-delete', { ids });
    return response.data;
  },

  // Search users
  searchUsers: async (params) => {
    const response = await api.get('/users/search', { params });
    return response.data;
  },

  // Export users to CSV
  exportToCSV: async (params = {}) => {
    const response = await api.get('/users/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;
