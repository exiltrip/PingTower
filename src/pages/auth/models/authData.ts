export interface ApiResponse<T> {
  message: string;
  data?: T;
  meta?: Record<string, any>;
  accessToken?: string;
  refreshToken?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string[] | string;
  timestamp: string;
  path: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export type RegisterResponse = ApiResponse<RegisterData>;
export type LoginResponse = ApiResponse<LoginData>;