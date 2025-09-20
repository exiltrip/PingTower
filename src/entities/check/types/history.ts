import { CheckStatus } from './check';

// История выполнения одного check'а
export interface CheckHistoryItem {
  id: number;
  checkId: number;
  status: CheckStatus;
  success: boolean;       // legacy поле для совместимости
  statusCode: number | null;
  latencyMs: number | null;
  message: string | null;
  createdAt: string;      // ISO date
}

// Метаданные пагинации
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

// Ответ с историей check'а
export interface CheckHistoryResponse {
  data: CheckHistoryItem[];
  pagination: PaginationMeta;
}

// Параметры для получения истории
export interface HistoryParams {
  limit?: number;    // 1-200, по умолчанию 50
  offset?: number;   // от 0, по умолчанию 0
}

// Дополнительные типы для анализа истории
export interface CheckUptime {
  uptime: number;      // процент доступности
  totalChecks: number;
  upChecks: number;
  downChecks: number;
  degradedChecks: number;
}

export interface CheckLatencyStats {
  averageMs: number;
  medianMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
  p99Ms: number;
}

// Агрегированная статистика по истории
export interface CheckHistoryStats {
  uptime: CheckUptime;
  latency: CheckLatencyStats;
  period: {
    from: string;
    to: string;
  };
}
