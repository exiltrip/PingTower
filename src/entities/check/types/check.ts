// Основные статусы check'а
export enum CheckStatus {
  UP = 'UP',
  DOWN = 'DOWN', 
  DEGRADED = 'DEGRADED'
}

// Типы мониторов
export enum CheckType {
  HTTP = 'http',
  TCP = 'tcp',
  PING = 'ping'
}

// Основная модель Check'а (соответствует backend схеме)  
export interface Check {
  id: number;
  name: string;
  type: CheckType;
  target: string;
  interval: number;     // в секундах, от 5 до 86400
  config: CheckConfig;  // Типизированная конфигурация
  enabled: boolean;
  userId: number;
  createdAt: string;    // ISO date
  updatedAt: string;    // ISO date
}

// Forward declaration для CheckConfig (реальный тип в config.ts)
export type CheckConfig = any;

// Базовый интерфейс для всех типов check'ов
export interface BaseCheck {
  id: number;
  name: string;
  type: CheckType;
  target: string;
  interval: number;
  enabled: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}
