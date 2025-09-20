import { CheckType, CheckConfig, HttpConfig, TcpConfig, PingConfig } from '../../../entities/check';
import { CreateCheckRequest, UpdateCheckRequest } from '../types/requests';

// Результат валидации
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Основные валидаторы

/**
 * Валидирует название check'а
 */
export function validateName(name: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!name || name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Название обязательно для заполнения',
      value: name
    });
  } else if (name.length > 255) {
    errors.push({
      field: 'name',
      message: 'Название не должно превышать 255 символов',
      value: name
    });
  }
  
  return errors;
}

/**
 * Валидирует target в зависимости от типа check'а
 */
export function validateTarget(type: CheckType, target: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!target || target.trim().length === 0) {
    errors.push({
      field: 'target',
      message: 'Target обязателен для заполнения',
      value: target
    });
    return errors;
  }
  
  switch (type) {
    case CheckType.HTTP:
      if (!isValidUrl(target)) {
        errors.push({
          field: 'target',
          message: 'Для HTTP проверки укажите корректный URL (http:// или https://)',
          value: target
        });
      }
      break;
      
    case CheckType.TCP:
    case CheckType.PING:
      if (!isValidHostname(target) && !isValidIP(target)) {
        errors.push({
          field: 'target',
          message: 'Укажите корректный IP адрес или доменное имя',
          value: target
        });
      }
      break;
  }
  
  return errors;
}

/**
 * Валидирует интервал выполнения
 */
export function validateInterval(interval: number): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!Number.isInteger(interval) || interval < 5 || interval > 86400) {
    errors.push({
      field: 'interval',
      message: 'Интервал должен быть от 5 секунд до 24 часов (86400 секунд)',
      value: interval
    });
  }
  
  return errors;
}

/**
 * Валидирует конфигурацию в зависимости от типа check'а
 */
export function validateConfig(type: CheckType, config: CheckConfig): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Базовые поля
  if (config.timeoutMs && (config.timeoutMs < 1000 || config.timeoutMs > 60000)) {
    errors.push({
      field: 'config.timeoutMs',
      message: 'Timeout должен быть от 1000 до 60000 мс',
      value: config.timeoutMs
    });
  }
  
  if (config.degraded_threshold_ms && (config.degraded_threshold_ms < 100 || config.degraded_threshold_ms > 60000)) {
    errors.push({
      field: 'config.degraded_threshold_ms',
      message: 'Порог degraded должен быть от 100 до 60000 мс',
      value: config.degraded_threshold_ms
    });
  }
  
  switch (type) {
    case CheckType.HTTP:
      errors.push(...validateHttpConfig(config as HttpConfig));
      break;
      
    case CheckType.TCP:
      errors.push(...validateTcpConfig(config as TcpConfig));
      break;
      
    case CheckType.PING:
      errors.push(...validatePingConfig(config as PingConfig));
      break;
  }
  
  return errors;
}

/**
 * Валидирует HTTP конфигурацию
 */
function validateHttpConfig(config: HttpConfig): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'];
  if (!validMethods.includes(config.method)) {
    errors.push({
      field: 'config.method',
      message: `HTTP метод должен быть одним из: ${validMethods.join(', ')}`,
      value: config.method
    });
  }
  
  // Валидация статус кодов
  if (Array.isArray(config.expectedStatus)) {
    for (const status of config.expectedStatus) {
      if (!Number.isInteger(status) || status < 100 || status > 599) {
        errors.push({
          field: 'config.expectedStatus',
          message: 'HTTP статус коды должны быть от 100 до 599',
          value: status
        });
      }
    }
  } else if (typeof config.expectedStatus === 'number') {
    if (!Number.isInteger(config.expectedStatus) || config.expectedStatus < 100 || config.expectedStatus > 599) {
      errors.push({
        field: 'config.expectedStatus',
        message: 'HTTP статус код должен быть от 100 до 599',
        value: config.expectedStatus
      });
    }
  }
  
  // Валидация content_check
  if (config.content_check) {
    const validTypes = ['JSON_CONTAINS', 'TEXT_CONTAINS', 'REGEX'];
    if (!validTypes.includes(config.content_check.type)) {
      errors.push({
        field: 'config.content_check.type',
        message: `Тип проверки контента должен быть: ${validTypes.join(', ')}`,
        value: config.content_check.type
      });
    }
    
    if (config.content_check.type === 'REGEX' && !config.content_check.pattern) {
      errors.push({
        field: 'config.content_check.pattern',
        message: 'Для типа REGEX необходимо указать pattern',
        value: config.content_check.pattern
      });
    }
  }
  
  return errors;
}

/**
 * Валидирует TCP конфигурацию
 */
function validateTcpConfig(config: TcpConfig): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    errors.push({
      field: 'config.port',
      message: 'Порт должен быть от 1 до 65535',
      value: config.port
    });
  }
  
  return errors;
}

/**
 * Валидирует Ping конфигурацию
 */
function validatePingConfig(config: PingConfig): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (config.packetSize && (!Number.isInteger(config.packetSize) || config.packetSize < 1 || config.packetSize > 65507)) {
    errors.push({
      field: 'config.packetSize',
      message: 'Размер пакета должен быть от 1 до 65507 байт',
      value: config.packetSize
    });
  }
  
  return errors;
}

/**
 * Полная валидация запроса на создание check'а
 */
export function validateCreateCheckRequest(request: CreateCheckRequest): ValidationResult {
  const errors: ValidationError[] = [];
  
  errors.push(...validateName(request.name));
  errors.push(...validateTarget(request.type, request.target));
  errors.push(...validateInterval(request.interval));
  
  if (request.config) {
    errors.push(...validateConfig(request.type, request.config));
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Валидация запроса на обновление check'а
 */
export function validateUpdateCheckRequest(request: UpdateCheckRequest): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (request.name !== undefined) {
    errors.push(...validateName(request.name));
  }
  
  if (request.type !== undefined && request.target !== undefined) {
    errors.push(...validateTarget(request.type, request.target));
  }
  
  if (request.interval !== undefined) {
    errors.push(...validateInterval(request.interval));
  }
  
  if (request.config !== undefined && request.type !== undefined) {
    errors.push(...validateConfig(request.type, request.config));
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Вспомогательные функции для валидации

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
}

function isValidHostname(hostname: string): boolean {
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return hostnameRegex.test(hostname) && hostname.length <= 253;
}
