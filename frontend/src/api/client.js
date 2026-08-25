import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('labhsetu_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = String(error.config?.url || '');
    if (error.response?.status === 401 && !url.includes('/api/auth/send-otp') && !url.includes('/api/auth/verify-otp')) {
      localStorage.removeItem('labhsetu_token');
      localStorage.removeItem('labhsetu_user');
    }
    return Promise.reject(error);
  }
);

export default api;
