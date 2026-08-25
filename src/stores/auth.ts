import { create } from "zustand";
import Cookies from "js-cookie";
import { setAuthToken } from "../lib/axios";
import api from "../lib/axios";
import type { AdminLoginData, AdminPermission, AdminProfile } from "../types/admin";

const TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME ?? "elwaseet_token";
const USER_DATA_KEY = import.meta.env.VITE_USER_DATA ?? "elwaseet_data";
const USER_PERMISSION_KEY = import.meta.env.VITE_USER_PERMISSION ?? "elwaseet_permission";

function parseCookieJson(key: string) {
  try {
    const raw = Cookies.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function permissionCodes(permissions: AdminPermission[] | undefined): string[] {
  return (permissions ?? []).map((p) => p.code).filter(Boolean);
}

function stripAuthFields(data: AdminLoginData | AdminProfile): AdminProfile {
  const {
    token: _t,
    token_type: _tt,
    permissions: _p,
    ...userData
  } = data as AdminLoginData;
  return userData as AdminProfile;
}

interface AuthStore {
  token: string | null;
  user: AdminProfile | null;
  permissions: string[];
  isLoggedIn: boolean;
  setAuth: (data: AdminLoginData) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

const initialToken = Cookies.get(TOKEN_NAME) ?? null;
const initialUser = parseCookieJson(USER_DATA_KEY) as AdminProfile | null;
const initialPermissions = (() => {
  try {
    const r = localStorage.getItem(USER_PERMISSION_KEY);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
})();

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: initialToken,
  user: initialUser,
  permissions: initialPermissions,
  isLoggedIn: !!initialToken,

  setAuth: (data) => {
    const token = data.token;
    const codes = permissionCodes(data.permissions);
    const userData = stripAuthFields(data);

    setAuthToken(token);
    Cookies.set(TOKEN_NAME, token);
    Cookies.set(USER_DATA_KEY, JSON.stringify(userData));
    localStorage.setItem(USER_PERMISSION_KEY, JSON.stringify(codes));
    set({ token, user: userData, permissions: codes, isLoggedIn: true });
  },

  clearAuth: () => {
    setAuthToken(null);
    Cookies.remove(TOKEN_NAME);
    Cookies.remove(USER_DATA_KEY);
    localStorage.removeItem(USER_PERMISSION_KEY);
    set({ token: null, user: null, permissions: [], isLoggedIn: false });
  },

  logout: async () => {
    try {
      await api.post("auth/logout");
    } catch {
      /* still clear local session */
    } finally {
      get().clearAuth();
    }
  },

  fetchProfile: async () => {
    const token = Cookies.get(TOKEN_NAME);
    if (!token) return;
    try {
      const res = await api.get("profile");
      const data = res.data?.data as AdminProfile | undefined;
      if (!data) return;
      const codes = permissionCodes(data.permissions);
      const userData = stripAuthFields(data);
      Cookies.set(USER_DATA_KEY, JSON.stringify(userData));
      localStorage.setItem(USER_PERMISSION_KEY, JSON.stringify(codes));
      set({ user: userData, permissions: codes });
    } catch {
      /* silently ignore */
    }
  },
}));
