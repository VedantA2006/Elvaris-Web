import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined' && window.Clerk && window.Clerk.session) {
      try {
        const token = await window.Clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Failed to get Clerk token', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally if needed (e.g., clear localStorage and redirect to login)
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && window.Clerk) {
        // window.Clerk.signOut();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
