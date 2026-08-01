import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Gentle retry interceptor for cold-start compilation delays
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (config && !config._retry && error.response?.status >= 500) {
      config._retry = true;
      await new Promise((resolve) => setTimeout(resolve, 800));
      return api(config);
    }

    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message));
    }
    return Promise.reject(error);
  }
);

export default api;