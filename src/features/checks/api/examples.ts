import { axiosInstance } from '../../../shared/api/axiosInstance';
import type { CheckExamples } from '../types/responses';
import { CheckType } from '../../../entities/check';

/**
 * Получает готовые примеры конфигураций для всех типов checks
 * Эндпоинт: GET /api/v1/public/checks/examples
 * Авторизация: НЕ требуется (public endpoint)
 */
export async function getCheckExamples(): Promise<CheckExamples> {
  const response = await axiosInstance.get<CheckExamples>('/api/v1/public/checks/examples');
  return response.data;
}

/**
 * Получает пример конфигурации для HTTP check'а
 */
export async function getHttpExample(): Promise<any> {
  const examples = await getCheckExamples();
  return examples.basicHttp;
}

/**
 * Получает пример расширенной HTTP конфигурации
 */
export async function getAdvancedHttpExample(): Promise<any> {
  const examples = await getCheckExamples();
  return examples.advancedHttp;
}

/**
 * Получает пример конфигурации для TCP check'а
 */
export async function getTcpExample(): Promise<any> {
  const examples = await getCheckExamples();
  return examples.tcpCheck;
}

/**
 * Получает пример конфигурации для Ping check'а
 */
export async function getPingExample(): Promise<any> {
  const examples = await getCheckExamples();
  return examples.pingCheck;
}

// Локальные шаблоны конфигураций (fallback если API недоступен)
export const DEFAULT_CONFIGS = {
  [CheckType.HTTP]: {
    basic: {
      method: 'GET',
      timeoutMs: 5000,
      expectedStatus: 200,
      degraded_threshold_ms: 3000
    },
    advanced: {
      method: 'GET',
      timeoutMs: 8000,
      expectedStatus: [200, 201, 202],
      headers: {
        'User-Agent': 'PingTower/1.0'
      },
      ssl_check_enabled: true,
      content_check: {
        type: 'JSON_CONTAINS',
        key: 'status',
        expected_value: 'ok'
      },
      degraded_threshold_ms: 4000
    }
  },
  [CheckType.TCP]: {
    basic: {
      port: 80,
      timeoutMs: 5000,
      degraded_threshold_ms: 2000
    },
    database: {
      port: 5432,
      timeoutMs: 8000,
      degraded_threshold_ms: 3000
    }
  },
  [CheckType.PING]: {
    basic: {
      timeoutMs: 3000,
      packetSize: 32,
      degraded_threshold_ms: 500
    },
    fast: {
      timeoutMs: 1000,
      packetSize: 16,
      degraded_threshold_ms: 200
    }
  }
} as const;

/**
 * Получает локальный шаблон конфигурации
 */
export function getDefaultConfig(type: CheckType, variant: string = 'basic') {
  const typeConfigs = DEFAULT_CONFIGS[type];
  return typeConfigs[variant as keyof typeof typeConfigs] || typeConfigs.basic;
}

/**
 * Создает готовый к использованию пример check'а
 */
export function createCheckTemplate(
  type: CheckType,
  name: string,
  target: string,
  variant: string = 'basic'
) {
  return {
    name,
    type,
    target,
    interval: type === CheckType.PING ? 60 : 300, // ping чаще, остальные реже
    config: getDefaultConfig(type, variant)
  };
}

/**
 * Валидирует target в зависимости от типа check'а
 */
export function validateTarget(type: CheckType, target: string): boolean {
  switch (type) {
    case CheckType.HTTP:
      try {
        const url = new URL(target);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    
    case CheckType.TCP:
    case CheckType.PING:
      // Проверяем IP адрес или доменное имя
      return isValidIPv4(target) || isValidDomain(target);
    
    default:
      return false;
  }
}

/**
 * Предлагает исправления для некорректного target'а
 */
export function suggestTargetFix(type: 'http' | 'tcp' | 'ping', target: string): string[] {
  const suggestions: string[] = [];
  
  if (type === 'http') {
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      suggestions.push(`https://${target}`);
      suggestions.push(`http://${target}`);
    }
  }
  
  if (type === 'tcp' || type === 'ping') {
    // Убираем протокол если он есть
    const cleaned = target.replace(/^https?:\/\//, '');
    if (cleaned !== target) {
      suggestions.push(cleaned);
    }
  }
  
  return suggestions;
}

// Helper функции для валидации
function isValidIPv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  
  return parts.every(part => {
    if (part === '') return false;
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255 && num.toString() === part;
  });
}

function isValidDomain(domain: string): boolean {
  if (domain.length > 253) return false;
  if (domain.endsWith('.')) domain = domain.slice(0, -1);
  
  // Исключаем строки, которые выглядят как IP адреса (только цифры и точки)
  if (/^[\d.]+$/.test(domain)) return false;
  
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainRegex.test(domain);
}
