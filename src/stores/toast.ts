import { create } from "zustand";
import type { Toast } from "../types/toast";

let _id = 0;

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => number;
  removeToast: (id: number) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  addToast: (t) => {
    const id = ++_id;
    const newToast: Toast = { duration: 5000, ...t, id };
    set({ toasts: [...get().toasts, newToast] });
    setTimeout(() => get().removeToast(id), newToast.duration);
    return id;
  },
  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));

// Imperative helper — can be called outside React components
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().addToast({ type: "success", title, description: description ?? "" }),
  error: (title: string, description?: string) =>
    useToastStore.getState().addToast({ type: "error", title, description: description ?? "" }),
  info: (title: string, description?: string) =>
    useToastStore.getState().addToast({ type: "info", title, description: description ?? "" }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().addToast({ type: "warning", title, description: description ?? "" }),
};
