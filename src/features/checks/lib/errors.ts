import { AxiosError } from 'axios';
import { ApiError, ValidationErrorResponse } from '../types/responses';

// Базовый класс ошибки API
export class ChecksApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ChecksApiError';
  }
}

// Ошибка валидации
export class ValidationError extends ChecksApiError {
  constructor(
    message: string,
    public validationErrors: Array<{ field: string; message: string; value?: any }>
  ) {
    super(message, 400, validationErrors);
    this.name = 'ValidationError';
  }
}

// Ошибка авторизации
export class AuthenticationError extends ChecksApiError {
  constructor(message: string = 'Требуется авторизация') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

// Ошибка доступа
export class ForbiddenError extends ChecksApiError {
  constructor(message: string = 'Доступ запрещен') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

// Ошибка "не найдено"
export class NotFoundError extends ChecksApiError {
  constructor(message: string = 'Ресурс не найден') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

// Ошибка конфликта
export class ConflictError extends ChecksApiError {
  constructor(message: string = 'Конфликт данных') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

// Ошибка сети
export class NetworkError extends ChecksApiError {
  constructor(message: string = 'Ошибка сети. Проверьте подключение') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}

/**
 * Обработчик ошибок для API вызовов
 */
export function handleApiError(error: unknown): never {
  if (error instanceof AxiosError) {
    const response = error.response;
    
    if (!response) {
      // Ошибка сети
      throw new NetworkError('Не удается подключиться к серверу');
    }
    
    const apiError: ApiError = response.data;
    const statusCode = response.status;
    const message = apiError.message || error.message;
    
    switch (statusCode) {
      case 400:
        // Проверяем, является ли это ошибкой валидации
        if (Array.isArray(apiError.error)) {
          const validationErrors = apiError.error.map(err => {
            if (typeof err === 'string') {
              return { field: 'unknown', message: err };
            }
            return err;
          });
          throw new ValidationError(message, validationErrors);
        }
        throw new ChecksApiError(message, statusCode, apiError.error);
      
      case 401:
        throw new AuthenticationError(message);
      
      case 403:
        throw new ForbiddenError(message);
      
      case 404:
        throw new NotFoundError(message);
      
      case 409:
        throw new ConflictError(message);
      
      default:
        throw new ChecksApiError(message, statusCode, apiError.error);
    }
  }
  
  // Если это уже наша ошибка, перебрасываем как есть
  if (error instanceof ChecksApiError) {
    throw error;
  }
  
  // Неожиданная ошибка
  throw new ChecksApiError(
    error instanceof Error ? error.message : 'Неизвестная ошибка',
    500
  );
}

/**
 * Враппер для API вызовов с обработкой ошибок
 */
export async function handleApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Получает пользовательское сообщение для ошибки
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    const messages = error.validationErrors.map(e => e.message);
    return messages.length > 1 
      ? `Ошибки валидации:\n${messages.join('\n')}` 
      : messages[0] || 'Ошибка валидации данных';
  }
  
  if (error instanceof AuthenticationError) {
    return 'Необходимо войти в систему';
  }
  
  if (error instanceof ForbiddenError) {
    return 'У вас нет прав для выполнения этого действия';
  }
  
  if (error instanceof NotFoundError) {
    return 'Запрашиваемый ресурс не найден или был удален';
  }
  
  if (error instanceof ConflictError) {
    return 'Конфликт данных. Возможно, такой объект уже существует';
  }
  
  if (error instanceof NetworkError) {
    return 'Проблемы с подключением к серверу. Проверьте интернет-соединение';
  }
  
  if (error instanceof ChecksApiError) {
    return error.message;
  }
  
  return 'Произошла неожиданная ошибка';
}

/**
 * Получает детали ошибки для разработчика
 */
export function getErrorDetails(error: unknown) {
  if (error instanceof ChecksApiError) {
    return {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details
    };
  }
  
  return {
    name: error instanceof Error ? error.name : 'UnknownError',
    message: error instanceof Error ? error.message : String(error),
    statusCode: 0,
    details: null
  };
}
