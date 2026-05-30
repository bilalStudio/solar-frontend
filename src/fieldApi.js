import axios from 'axios';

const raw = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const BASE_URL = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;

const fieldApi = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach technician token + id to every request
fieldApi.interceptors.request.use((config) => {
  const tech = JSON.parse(localStorage.getItem('wv_field_user') || '{}');
  if (tech.token) {
    config.headers.Authorization = `Bearer ${tech.token}`;
  }
  if (tech.id) {
    config.headers['X-Technician-Id'] = tech.id;
  }
  return config;
});

// Redirect to field login on 401
fieldApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('wv_field_user');
      window.location.href = '/field/login';
    }
    return Promise.reject(err);
  }
);

export const fieldAuthAPI = {
  login:    (data) => fieldApi.post('/api/field/auth/login', data),
  register: (data) => fieldApi.post('/api/field/auth/register', data),
};

export const fieldDocAPI = {
  create:           (data)              => fieldApi.post('/api/field/documents', data),
  autoSave:         (id, data)          => fieldApi.put(`/api/field/documents/${id}/autosave`, data),
  submit:           (id)                => fieldApi.post(`/api/field/documents/${id}/submit`),
  getMyDocuments:   ()                  => fieldApi.get('/api/field/documents/my'),
  getById:          (id)                => fieldApi.get(`/api/field/documents/${id}`),
  toggleVisibility: (id, key, visible)  => fieldApi.patch(`/api/field/documents/${id}/fields/${key}/visibility?visible=${visible}`),
  uploadPhoto:      (id, formData)      => fieldApi.post(`/api/field/documents/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  downloadPdf:      (id)                => fieldApi.get(`/api/field/documents/${id}/download`, { responseType: 'blob' }),
  emailDocument:    (id, data)          => fieldApi.post(`/api/field/documents/${id}/email`, data),
};

export default fieldApi;
