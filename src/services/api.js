import axios from 'axios';
import { isDemoMode, handleDemoRequest, DEMO_TOKEN } from './demoMode';

// ─── Base URL Resolution ──────────────────────────────────────────────────────
const raw = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const BASE_URL = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;

console.log('[WattVue] API base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Demo Mode Interceptor ──────────────────────────────────────────────────
// If the user clicked "Launch Demo", short-circuit ALL requests to the mock
// handler instead of letting them hit the network.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Demo mode: swap the network adapter for the in-memory mock handler
  if (isDemoMode()) {
    config.adapter = (cfg) => handleDemoRequest(cfg);
  }

  return config;
});

// Handle 401 - redirect to login (but never on demo mode or auth routes)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthRoute = url.includes('/api/auth/');
    if (error.response?.status === 401 && !isAuthRoute && !isDemoMode()) {
      localStorage.removeItem('wv_token');
      localStorage.removeItem('wv_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { DEMO_TOKEN };

// ─── Auth endpoints ─────────────────────────────────────────────────────────
export const authAPI = {
  login:           (data)  => api.post('/api/auth/login', data),
  register:        (data)  => api.post('/api/auth/register', data),
  forgotPassword:  (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword:   (data)  => api.post('/api/auth/reset-password', data),
  googleLogin:     (idToken) => api.post('/api/auth/google', { idToken }),
  ping:            ()      => api.get('/api/auth/ping'),
};

// ─── Customer endpoints ─────────────────────────────────────────────────────
export const customerAPI = {
  getAll:   (status)     => api.get('/api/customers', { params: status ? { status } : {} }),
  getById:  (id)         => api.get(`/api/customers/${id}`),
  search:   (q)          => api.get('/api/customers/search', { params: { q } }),
  create:   (data)       => api.post('/api/customers', data),
  update:   (id, d)      => api.put(`/api/customers/${id}`, d),
  delete:   (id)         => api.delete(`/api/customers/${id}`),
};

// ─── Upload endpoints ───────────────────────────────────────────────────────
export const uploadAPI = {
  uploadExcel: (file, customerId) => {
    const form = new FormData();
    form.append('file', file);
    form.append('customerId', customerId);
    return api.post('/api/uploads/excel', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadUtility: (file, customerId) => {
    const form = new FormData();
    form.append('file', file);
    form.append('customerId', customerId);
    return api.post('/api/uploads/utility', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getUploads: (customerId) => api.get(`/api/uploads?customerId=${customerId}`),
};

// ─── Analytics endpoints ────────────────────────────────────────────────────
export const analyticsAPI = {
  getDashboardKPIs:    ()             => api.get('/api/analytics/dashboard-kpis'),
  getROI:              (customerId)   => api.get(`/api/analytics/roi/${customerId}`),
  getVariance:         (customerId)   => api.get(`/api/analytics/variance/${customerId}`),
  compareUtilityVsSystem: (customerId)=> api.get(`/api/analytics/compare/${customerId}`),
  validateUtility:     (customerId)   => api.get(`/api/analytics/utility-validation/${customerId}`),
  getUtilityChart:     (customerId)   => api.get(`/api/analytics/utility-chart/${customerId}`),
  calculateLoss:       (data)         => api.post('/api/analytics/loss-calculation', data),
  analyzeCleaning:     (data)         => api.post('/api/analytics/cleaning-analysis', data),
  getCleaningHistory:  (customerId)   => api.get(`/api/analytics/cleaning-history/${customerId}`),
};

// ─── Report endpoints ───────────────────────────────────────────────────────
export const reportAPI = {
  generate:         (customerId) => api.post(`/api/reports/generate/${customerId}`),
  generateLoss:     (data)       => api.post('/api/reports/generate-loss', data),
  generateCleaning: (data)       => api.post('/api/reports/generate-cleaning', data),
  generateUtility:  (customerId) => api.post(`/api/reports/generate-utility/${customerId}`),
  getHistory:       (customerId) => api.get(`/api/reports/history/${customerId}`),
  getAll:           ()           => api.get('/api/reports/all'),
  email:            (reportId, data) => api.post(`/api/reports/email/${reportId}`, data),
  download:         (reportId)   => api.get(`/api/reports/download/${reportId}`, { responseType: 'blob' }),
  exportExcel:      (customerId) => api.get(`/api/reports/excel/${customerId}`, { responseType: 'blob' }),
  delete:           (reportId)   => api.delete(`/api/reports/${reportId}`),
};
