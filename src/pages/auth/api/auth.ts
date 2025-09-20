import { publicApi } from "../../../shared/api/publicApi";
import type { RegisterResponse, ApiErrorResponse, RegisterData, LoginData, LoginResponse } from "../models/authData";


export const registerUser = async (data: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await publicApi.post<RegisterResponse>(`/auth/register`, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const apiError: ApiErrorResponse = error.response.data;
      throw apiError;
    }
    throw new Error("Ошибка сети. Проверьте подключение");
  }
};

export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const response = await publicApi.post<LoginResponse>('/auth/login', data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const apiError: ApiErrorResponse = error.response.data;
      throw apiError;
    }
    throw new Error("Ошибка сети. Проверьте подключение");
  }
};