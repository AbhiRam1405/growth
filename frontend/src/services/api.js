import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30s — accounts for Render free-tier cold starts
});

/**
 * Fire-and-forget ping to wake the Render backend before user interactions.
 * Calls the root health endpoint (GET /) which is outside the /api prefix.
 */
export const pingBackend = () => {
  const rootUrl = BASE_URL.replace(/\/api\/?$/, '');
  axios.get(rootUrl, { timeout: 60000 }).catch(() => {/* silently ignore */ });
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
