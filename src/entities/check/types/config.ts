// Базовая конфигурация (общая для всех типов)
export interface BaseConfig {
  timeoutMs: number;
  degraded_threshold_ms: number;
}

// HTTP методы
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';

// Типы проверки контента
export type ContentCheckType = 'JSON_CONTAINS' | 'TEXT_CONTAINS' | 'REGEX';

// Проверка контента для HTTP
export interface ContentCheck {
  type: ContentCheckType;
  key?: string;           // для JSON_CONTAINS: "status" или "data.result"
  expected_value?: any;   // ожидаемое значение
  pattern?: string;       // для REGEX
}

// HTTP конфигурация
export interface HttpConfig extends BaseConfig {
  method: HttpMethod;
  expectedStatus: number | number[];  // 200 или [200, 201, 202]
  headers?: Record<string, string>;
  ssl_check_enabled?: boolean;
  content_check?: ContentCheck;
}

// TCP конфигурация  
export interface TcpConfig extends BaseConfig {
  port: number;           // 1-65535
}

// Ping конфигурация
export interface PingConfig extends BaseConfig {
  packetSize?: number;    // размер пакета, по умолчанию 32
}

// Союз всех конфигураций
export type CheckConfig = HttpConfig | TcpConfig | PingConfig;

// Type guards для определения типа конфигурации
export function isHttpConfig(config: CheckConfig): config is HttpConfig {
  return 'method' in config && 'expectedStatus' in config;
}

export function isTcpConfig(config: CheckConfig): config is TcpConfig {
  return 'port' in config;
}

export function isPingConfig(config: CheckConfig): config is PingConfig {
  return 'packetSize' in config || (!('method' in config) && !('port' in config));
}

// Валидаторы конфигураций
export const configValidators = {
  http: {
    method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
    expectedStatus: (status: number | number[]) => {
      if (Array.isArray(status)) {
        return status.every(s => s >= 100 && s <= 599);
      }
      return status >= 100 && status <= 599;
    },
    timeoutMs: (timeout: number) => timeout >= 1000 && timeout <= 60000,
  },
  tcp: {
    port: (port: number) => port >= 1 && port <= 65535,
    timeoutMs: (timeout: number) => timeout >= 1000 && timeout <= 60000,
  },
  ping: {
    packetSize: (size: number) => size >= 1 && size <= 65507,
    timeoutMs: (timeout: number) => timeout >= 1000 && timeout <= 60000,
  },
};
