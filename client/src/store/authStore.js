import { create } from "zustand";

/**
 * Store global Zustand pour l'authentification client.
 * Synchronise l'etat de session avec localStorage pour maintenir la connexion au rechargement.
 */

const initialToken = localStorage.getItem("gymon_token") || null;
const initialUser = (() => {
  try {
    const raw = localStorage.getItem("gymon_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

export const useAuthStore = create((set) => ({
  token: initialToken,
  user: initialUser,
  isAuthenticated: Boolean(initialToken),

  setAuth: ({ token, user }) => {
    if (token) {
      localStorage.setItem("gymon_token", token);
    }
    if (user) {
      localStorage.setItem("gymon_user", JSON.stringify(user));
    }
    set({
      token,
      user,
      isAuthenticated: Boolean(token),
    });
  },

  updateUser: (updatedFields) => {
    set((state) => {
      const newUser = { ...state.user, ...updatedFields };
      localStorage.setItem("gymon_user", JSON.stringify(newUser));
      return { user: newUser };
    });
  },

  logout: () => {
    localStorage.removeItem("gymon_token");
    localStorage.removeItem("gymon_user");
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
