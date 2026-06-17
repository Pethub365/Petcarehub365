import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// --- helpers ---
const getTokens = () => {
  try {
    const raw = localStorage.getItem('tokens');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveTokens = (tokens: any) => {
  localStorage.setItem('tokens', JSON.stringify(tokens));
};

const clearSession = () => {
  localStorage.removeItem('tokens');
  localStorage.removeItem('user');
};

// Request interceptor
axiosClient.interceptors.request.use((config) => {
  const tokens = getTokens();
  if (tokens?.access?.token) {
    config.headers.Authorization = `Bearer ${tokens.access.token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// Response interceptor
axiosClient.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const original = error.config;
    const isAuthRoute =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/register') ||
      original?.url?.includes('/auth/forgot-password') ||
      original?.url?.includes('/auth/reset-password') ||
      original?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return axiosClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const tokens = getTokens();
        const refreshToken = tokens?.refresh?.token;
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken }, { withCredentials: true });
        if (res.data.success) {
          const newTokens = { ...tokens, ...res.data.data.tokens };
          saveTokens(newTokens);
          original.headers.Authorization = `Bearer ${newTokens.access.token}`;
          processQueue(null, newTokens.access.token);
          return axiosClient(original);
        }
        throw new Error('Refresh failed');
      } catch (err: any) {
        processQueue(err, null);
        const status = err.response?.status;
        if (status === 401 || status === 403 || status === 400) {
          clearSession();
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
