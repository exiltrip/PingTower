import { CheckType } from '../../../entities/check';
import type { CheckConfig } from '../../../entities/check';

export interface CreateCheckRequest {
  name: string;
  type: CheckType;
  target: string;
  interval: number;
  config?: CheckConfig;
}

// Данные для обновления check'а
export interface UpdateCheckRequest {
  name?: string;
  type?: CheckType;
  target?: string;
  interval?: number;
  config?: CheckConfig;
  enabled?: boolean;
}

// Параметры для получения истории
export interface GetHistoryParams {
  limit?: number;    // 1-200, по умолчанию 50
  offset?: number;   // от 0, по умолчанию 0
}

// Параметры для создания alert rule
export interface CreateAlertRuleRequest {
  channel_id: number;
  config: {
    notify_on_recovery?: boolean;
    notify_after_failures?: number;
  };
}

// Общие параметры запроса для фильтрации
export interface ChecksQueryParams {
  enabled?: boolean;
  type?: CheckType;
  limit?: number;
  offset?: number;
}

// Параметры валидации для создания check'а
export interface CreateCheckValidation {
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  target: {
    required: boolean;
    pattern?: RegExp;
  };
  interval: {
    required: boolean;
    min: number;
    max: number;
  };
}

// Константы валидации
export const CHECK_VALIDATION: CreateCheckValidation = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 255
  },
  target: {
    required: true,
  },
  interval: {
    required: true,
    min: 5,
    max: 86400 // 24 hours
  }
};
