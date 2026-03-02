import { api } from "../../services/api";
import { LoginRequest, LoginResponse, MeResponse, RegisterRequest } from "./types";

export async function registerUser(payload: RegisterRequest): Promise<{ message: string; userId: string }> {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

export async function fetchCurrentUser(): Promise<MeResponse> {
  const response = await api.get("/auth/me");
  return response.data;
}
