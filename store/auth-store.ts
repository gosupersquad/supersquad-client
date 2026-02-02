import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StateCreator } from "zustand";

export interface HostUser {
  id: string;
  name: string;
  username: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: HostUser | null;
}

interface AuthActions {
  setAuth: (token: string, user: HostUser) => void;
  clearAuth: () => void;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  token: null,
  user: null,
};

const STORAGE_KEY = "supersquad-host-auth";

export const createAuthSlice: StateCreator<AuthStore, [], [], AuthStore> = (
  set
) => ({
  ...initialState,

  setAuth: (token, user) => set({ token, user }),

  clearAuth: () => set(initialState),
});

export const useAuthStore = create<AuthStore>()(
  persist(createAuthSlice, { name: STORAGE_KEY })
);
