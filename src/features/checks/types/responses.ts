import { Check, CheckHistoryResponse } from '../../../entities/check';

// Стандартный формат ответа API
export interface ApiResponse<T> {
  message: string;
  data?: T;
  meta?: Record<string, any>;
}

// Ответы для конкретных операций с checks
export type CreateCheckResponse = ApiResponse<Check>;
export type UpdateCheckResponse = ApiResponse<Check>;
export type GetCheckResponse = ApiResponse<Check>;
export type GetChecksResponse = ApiResponse<Check[]>;

// Простой ответ без данных (для DELETE операций)
export interface ApiSuccessResponse {
  message: string;
}

// Ответ с историей check'а
export type GetCheckHistoryResponse = CheckHistoryResponse;

// Примеры конфигураций от backend
export interface CheckExamples {
  basicHttp: {
    name: string;
    type: string;
    target: string;
    interval: number;
    config: object;
  };
  advancedHttp: {
    name: string;
    type: string;
    target: string;
    interval: number;
    config: object;
  };
  tcpCheck: {
    name: string;
    type: string;
    target: string;
    interval: number;
    config: object;
  };
  pingCheck: {
    name: string;
    type: string;
    target: string;
    interval: number;
    config: object;
  };
  multiStatusHttp: {
    name: string;
    type: string;
    target: string;
    interval: number;
    config: object;
  };
  highPerfPing: {
    name: string;
    type: string;
    target: string;
    interval: number;
    config: object;
  };
}

// Ответ с примерами конфигураций
export type GetCheckExamplesResponse = CheckExamples;

// Ошибка API
export interface ApiError {
  statusCode: number;
  message: string;
  error: string | string[];
  timestamp: string;
  path: string;
}

// Alert Rule типы
export interface AlertRule {
  id: number;
  checkId: number;
  channelId: number;
  config: object;
  notifyOnRecovery: boolean;
  notifyAfterFailures: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateAlertRuleResponse = ApiResponse<AlertRule>;
export type GetAlertRulesResponse = AlertRule[];

// Типы для сообщений об ошибках
export type ValidationError = {
  field: string;
  message: string;
  value?: any;
};

export interface ValidationErrorResponse {
  statusCode: number;
  message: string;
  error: ValidationError[];
  timestamp: string;
  path: string;
}
