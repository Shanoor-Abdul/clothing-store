import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 60000, // 60 seconds timeout to prevent premature 15s request cancellations
});

api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const isAdminRoute = config.url?.includes("/admin");
      const token = isAdminRoute
        ? localStorage.getItem("cs_admin_access_token")
        : localStorage.getItem("cs_user_access_token") ||
          localStorage.getItem("token");

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = "Bearer " + token;
      }
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
    const method = config?.method?.toString().toLowerCase();

    if (
      config &&
      !config._retry &&
      error.response?.status >= 500 &&
      (method === "get" || method === "head" || method === "options")
    ) {
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
