import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
  timeout: 30000,
  maxContentLength: 10 * 1024 * 1024,
  maxBodyLength: 10 * 1024 * 1024,
});

api.interceptors.request.use(
  async (config) => {
    config.headers['X-Timestamp'] = Date.now();
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isPublicAuthRequest = error.config?.url === '/auth/csrf-token';
    if (error.response?.status === 401 && !error.config?.skipAuthRedirect && !isPublicAuthRequest) {
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
      try {
        const { data } = await api.get('/auth/csrf-token');
        localStorage.setItem('csrfToken', data.csrfToken);
        error.config.headers['X-CSRF-Token'] = data.csrfToken;
        return api.request(error.config);
      } catch {
        // CSRF refresh failed
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  getCsrfToken: () => api.get('/auth/csrf-token'),
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: (requestConfig) => api.get('/auth/me', requestConfig),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (resetToken, password) => api.put(`/auth/reset-password/${resetToken}`, { password }),
};

export const taskApi = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  reorder: (tasks) => api.put('/tasks/reorder', { tasks }),
  getStats: () => api.get('/tasks/stats'),
};

export const eventApi = {
  getAll: (params) => api.get('/events', { params }),
  getOne: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getMonth: (year, month) => api.get('/events/month', { params: { year, month } }),
};

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export const studyApi = {
  getSets: () => api.get('/study/sets'),
  getSet: (id) => api.get(`/study/sets/${id}`),
  createSet: (data) => api.post('/study/sets', data),
  updateSet: (id, data) => api.put(`/study/sets/${id}`, data),
  deleteSet: (id) => api.delete(`/study/sets/${id}`),
  getFlashcards: (params) => api.get('/study/flashcards', { params }),
  createFlashcard: (data) => api.post('/study/flashcards', data),
  updateFlashcard: (id, data) => api.put(`/study/flashcards/${id}`, data),
  deleteFlashcard: (id) => api.delete(`/study/flashcards/${id}`),
  reviewFlashcard: (id, quality) => api.put(`/study/flashcards/${id}/review`, { quality }),
  getFiles: (params) => api.get('/study/files', { params }),
  uploadFiles: (data) => api.post('/study/files', data),
  deleteFile: (id) => api.delete(`/study/files/${id}`),
  getStats: () => api.get('/study/stats'),
};

export const goalApi = {
  getAll: (params) => api.get('/goals', { params }),
  getOne: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  getStats: () => api.get('/goals/stats'),
};

export const noteApi = {
  getAll: (params) => api.get('/notes', { params }),
  getOne: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

export default api;
