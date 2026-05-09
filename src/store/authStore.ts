import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Role = "staff" | "hrd" | "admin";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  workStatus:
    | "working"
    | "on break"
    | "off duty"
    | "pending"
    | "photo revision";
  employmentStatus: "employed" | "on leave" | "terminated" | "resigned";
};

type AuthStore = {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => {
        // localStorage.removeItem("auth-storage");
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
