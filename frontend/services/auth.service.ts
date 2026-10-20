import api, { clearStoredTokens, getStoredRefreshToken, setStoredTokens } from "./api";
import type {
  ApiResponse,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types/auth";
import axios from "axios";

export const authService = {
  /**
   * Log in user with email, password, and optional rememberMe
   */
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await api.post<ApiResponse<AuthTokens>>("/auth/login", credentials);

    const tokens = response.data.data;
    if (!tokens) {
      throw new Error("Missing tokens in login response");
    }

    setStoredTokens(tokens);
    return tokens;
  },

  /**
   * Register a new user
   */
  async register(
    data: RegisterCredentials
  ): Promise<ApiResponse<{ id: string; username: string; email: string; emailVerified: boolean }>> {
    const response = await api.post<
      ApiResponse<{ id: string; username: string; email: string; emailVerified: boolean }>
    >("/auth/register", data);
    return response.data;
  },

  /**
   * Fetch current authenticated user profile
   */
  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    if (!response.data.data) {
      throw new Error("User data not found in response");
    }
    return response.data.data;
  },

  /**
   * Log out from current session
   */
  async logout(): Promise<void> {
    const refreshToken = getStoredRefreshToken();
    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      // Even if backend fails (e.g., token expired), proceed to wipe local storage
    } finally {
      clearStoredTokens();
    }
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<ApiResponse<null>> {
    const response = await api.get<ApiResponse<null>>(`/auth/verify-email`, {
      params: { token },
    });
    return response.data;
  },
};

/**
 * Helper to extract human-readable error messages from backend responses
 */
export const getApiErrorMessage = (
  error: unknown,
  fallback: string = "Something went wrong"
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object") {
      if ("message" in data && typeof data.message === "string") {
        return data.message;
      }
    }
    if (error.message === "Network Error") {
      return "Cannot connect to server. Please ensure the backend is running.";
    }
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};
