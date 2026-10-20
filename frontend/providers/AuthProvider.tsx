"use client";

import React, { createContext, useCallback, useEffect, useState } from "react";
import type { ApiResponse, LoginCredentials, RegisterCredentials, User } from "@/types/auth";
import { authService } from "@/services/auth.service";
import { getStoredAccessToken } from "@/services/api";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (
    credentials: RegisterCredentials
  ) => Promise<
    ApiResponse<{ id: string; username: string; email: string; emailVerified: boolean }>
  >;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredAccessToken();
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    };

    initAuth();

    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener("cpnudge:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("cpnudge:session-expired", handleSessionExpired);
    };
  }, [refreshUser]);

  const login = async (credentials: LoginCredentials) => {
    await authService.login(credentials);
    const currentUser = await authService.getMe();
    setUser(currentUser);
  };

  const register = async (credentials: RegisterCredentials) => {
    return await authService.register(credentials);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
