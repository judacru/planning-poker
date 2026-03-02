import { createContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentUser, loginUser, registerUser } from "../modules/auth/service";
import { AuthUser, LoginRequest, RegisterRequest } from "../modules/auth/types";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<{ message: string; userId: string }>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const response = await fetchCurrentUser();
      setUser(response.user);
    } catch {
      localStorage.removeItem("auth_token");
      setUser(null);
    }
  };

  const login = async (payload: LoginRequest) => {
    const response = await loginUser(payload);
    localStorage.setItem("auth_token", response.token);
    setUser(response.user);
  };

  const register = async (payload: RegisterRequest) => {
    return registerUser(payload);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    refreshMe().finally(() => setIsLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      refreshMe,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
