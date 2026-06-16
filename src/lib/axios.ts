import axios from "axios";
import Cookies from "js-cookie";

const TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME ?? "admin_token";
const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { Accept: "application/json" },
});

const savedToken = Cookies.get(TOKEN_NAME);
if (savedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
}

function handleUnauthorized(error: any) {
  if (error?.response?.status === 401) {
    Cookies.remove(TOKEN_NAME);
    window.location.pathname = "/auth/login";
  }
}

api.interceptors.request.use(
  (config) => config,
  (error) => { handleUnauthorized(error); return Promise.reject(error); }
);
api.interceptors.response.use(
  (response) => response,
  (error) => { handleUnauthorized(error); return Promise.reject(error); }
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
