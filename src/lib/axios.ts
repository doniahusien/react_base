import axios from "axios";
import Cookies from "js-cookie";
import i18n from "../i18n";

const TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME ?? "elwaseet_token";
const USER_DATA_KEY = import.meta.env.VITE_USER_DATA ?? "elwaseet_data";
const USER_PERMISSION_KEY = import.meta.env.VITE_USER_PERMISSION ?? "elwaseet_permission";
const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Accept-Language": i18n.language || "en",
  },
});

const savedToken = Cookies.get(TOKEN_NAME);
if (savedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
}

function handleUnauthorized(error: any) {
  if (error?.response?.status === 401) {
    Cookies.remove(TOKEN_NAME);
    Cookies.remove(USER_DATA_KEY);
    localStorage.removeItem(USER_PERMISSION_KEY);
    delete api.defaults.headers.common["Authorization"];
    if (window.location.pathname !== "/auth/login") {
      window.location.pathname = "/auth/login";
    }
  }
}

api.interceptors.request.use(
  (config) => {
    config.headers["Accept-Language"] = i18n.language || "en";
    return config;
  },
  (error) => {
    handleUnauthorized(error);
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    handleUnauthorized(error);
    return Promise.reject(error);
  }
);

export default api;

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    Cookies.set(TOKEN_NAME, token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    Cookies.remove(TOKEN_NAME);
  }
}
