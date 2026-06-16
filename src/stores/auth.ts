import { create } from "zustand";
import Cookies from "js-cookie";
import { setAuthToken } from "../lib/axios";
import api from "../lib/axios";

const TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME ?? "admin_token";
const USER_DATA_KEY = import.meta.env.VITE_USER_DATA ?? "admin_data";
const USER_PERMISSION_KEY = import.meta.env.VITE_USER_PERMISSION ?? "admin_permission";

function parseCookieJson(key: string) {
  try {
    const raw = Cookies.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

interface AuthStore {
  token: string | null;
  user: Record<string, any> | null;
  permissions: string[];
  isLoggedIn: boolean;
  setAuth: (data: { token: string; [key: string]: any }) => void;
  clearAuth: () => void;
  fetchProfile: () => Promise<void>;
}

const initialToken = Cookies.get(TOKEN_NAME) ?? null;
const initialUser = parseCookieJson(USER_DATA_KEY);
const initialPermissions = (() => {
  try { const r = localStorage.getItem(USER_PERMISSION_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
})();

export const useAuthStore = create<AuthStore>((set) => ({
  token: initialToken,
  user: initialUser,
  permissions: initialPermissions,
  isLoggedIn: !!initialToken,

  setAuth: (data) => {
    const { token, verification_token: _vt, permissions: _p, permissions_of_roles, ...userData } = data;
    const permissionNames: string[] = (permissions_of_roles ?? []).map((p: any) => p.name);
    if (!userData.full_name && (userData.first_name || userData.last_name)) {
      userData.full_name = [userData.first_name, userData.last_name].filter(Boolean).join(" ");
    }
    setAuthToken(token);
    Cookies.set(TOKEN_NAME, token);
    Cookies.set(USER_DATA_KEY, JSON.stringify(userData));
    localStorage.setItem(USER_PERMISSION_KEY, JSON.stringify(permissionNames));
    set({ token, user: userData, permissions: permissionNames, isLoggedIn: true });
  },

  clearAuth: () => {
    setAuthToken(null);
    Cookies.remove(TOKEN_NAME);
    Cookies.remove(USER_DATA_KEY);
    localStorage.removeItem(USER_PERMISSION_KEY);
    set({ token: null, user: null, permissions: [], isLoggedIn: false });
  },

  fetchProfile: async () => {
    const token = Cookies.get(TOKEN_NAME);
    if (!token) return;
    try {
      const res = await api.get("profile");
      const data = res.data?.data ?? res.data;
      if (!data) return;
      const { token: _t, verification_token: _vt, permissions: _p, permissions_of_roles: _por, ...userData } = data;
      if (!userData.full_name && (userData.first_name || userData.last_name)) {
        userData.full_name = [userData.first_name, userData.last_name].filter(Boolean).join(" ");
      }
      Cookies.set(USER_DATA_KEY, JSON.stringify(userData));
      set({ user: userData });
    } catch { /* silently ignore */ }
  },
}));
