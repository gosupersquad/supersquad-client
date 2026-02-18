import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StateCreator } from "zustand";
import type { AuthRole } from "@/lib/constants";

export interface HostUser {
  id: string;
  name: string;
  username: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: HostUser | null;
  role: AuthRole | null;
}

interface AuthActions {
  setAuth: (token: string, user: HostUser, role: AuthRole) => void;
  clearAuth: () => void;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  token: null,
  user: null,
  role: null,
};

const STORAGE_KEY = "supersquad-host-auth";

export const createAuthSlice: StateCreator<AuthStore, [], [], AuthStore> = (
  set
) => ({
  ...initialState,

  setAuth: (token, user, role) => set({ token, user, role }),

  clearAuth: () => set(initialState),
});

export const useAuthStore = create<AuthStore>()(
  persist(createAuthSlice, { name: STORAGE_KEY })
);
