import type {
  SilencingRule,
  CreateSilencingRuleRequest,
  UpdateSilencingRuleRequest,
  QuickSilenceRequest,
  SilencingStatus,
  SilencingTarget,
  AddTargetToRuleRequest
} from '../../../entities/silencing/types';

// Используем тот же API клиент, что и в остальном проекте
import { api } from '../../../shared/api/privateApi';

/*
 * API для сайленсинга использует тот же axiosInstance что и остальные API
 * 
 * Все endpoints работают в соответствии с OpenAPI спецификацией
 */

const API_BASE = '/api/v1/silencing';


// === Управление правилами сайленсинга ===

/**
 * Создать новое правило сайленсинга
 */
export const createSilencingRule = async (
  data: CreateSilencingRuleRequest
): Promise<SilencingRule> => {
  const response = await api.post(`${API_BASE}/rules`, data);
  return response.data;
};

/**
 * Получить все правила сайленсинга
 */
export const getSilencingRules = async (userId?: number): Promise<SilencingRule[]> => {
  // API требует userId как query параметр
  // TODO: Получать текущий userId из контекста пользователя или localStorage
  const currentUserId = userId || 1; 
  const response = await api.get(`${API_BASE}/rules?userId=${currentUserId}`);
  return response.data;
};

/**
 * Получить правило сайленсинга по ID
 */
export const getSilencingRuleById = async (id: number): Promise<SilencingRule> => {
  const response = await api.get(`${API_BASE}/rules/${id}`);
  return response.data;
};

/**
 * Обновить правило сайленсинга
 */
export const updateSilencingRule = async (
  id: number,
  data: UpdateSilencingRuleRequest
): Promise<SilencingRule> => {
  const response = await api.put(`${API_BASE}/rules/${id}`, data);
  return response.data;
};

/**
 * Удалить правило сайленсинга
 */
export const deleteSilencingRule = async (id: number): Promise<void> => {
  await api.delete(`${API_BASE}/rules/${id}`);
};

// === Управление целями правил ===

/**
 * Добавить цель к правилу сайленсинга
 */
export const addTargetToSilencingRule = async (
  ruleId: number,
  data: AddTargetToRuleRequest
): Promise<SilencingTarget> => {
  const response = await api.post(`${API_BASE}/rules/${ruleId}/targets`, data);
  return response.data;
};

/**
 * Получить цели правила сайленсинга
 */
export const getSilencingRuleTargets = async (
  ruleId: number
): Promise<SilencingTarget[]> => {
  const response = await api.get(`${API_BASE}/rules/${ruleId}/targets`);
  return response.data;
};

/**
 * Удалить цель из правила сайленсинга
 */
export const removeSilencingTarget = async (targetId: number): Promise<void> => {
  await api.delete(`${API_BASE}/targets/${targetId}`);
};

// === Быстрый сайленсинг ===

/**
 * Создать быстрое правило сайленсинга
 */
export const createQuickSilence = async (
  data: QuickSilenceRequest
): Promise<SilencingRule> => {
  const response = await api.post(`${API_BASE}/quick-silence`, data);
  return response.data;
};

// === Статус и проверки ===

/**
 * Проверить статус сайленсинга для чека
 */
export const getCheckSilencingStatus = async (
  checkId: number
): Promise<SilencingStatus> => {
  const response = await api.get(`${API_BASE}/check/${checkId}/status`);
  return response.data;
};

/**
 * Получить все активные правила сайленсинга
 */
export const getActiveSilencingRules = async (): Promise<SilencingRule[]> => {
  const response = await api.get(`${API_BASE}/active-rules`);
  return response.data;
};

// === Обслуживание ===

/**
 * Очистить истекшие правила сайленсинга
 */
export const cleanupExpiredSilencingRules = async (): Promise<void> => {
  await api.post(`${API_BASE}/maintenance/cleanup`);
};

/**
 * Обновить кеш активных правил
 */
export const refreshSilencingCache = async (): Promise<void> => {
  await api.post(`${API_BASE}/maintenance/refresh-cache`);
};

// === Вспомогательные функции ===

/**
 * Проверить, активно ли правило сайленсинга в данный момент
 */
export const isRuleActiveNow = (rule: SilencingRule): boolean => {
  if (!rule.isActive) return false;
  
  const now = new Date();
  const startsAt = new Date(rule.startTime);
  const endsAt = new Date(rule.endTime);
  
  return now >= startsAt && now <= endsAt;
};

/**
 * Получить время до начала правила (если еще не началось) или до окончания (если активно)
 */
export const getTimeUntilRuleChange = (rule: SilencingRule): {
  type: 'starts' | 'ends' | 'expired';
  timeMs: number;
} => {
  const now = new Date();
  const startsAt = new Date(rule.startTime);
  const endsAt = new Date(rule.endTime);
  
  if (now < startsAt) {
    return {
      type: 'starts',
      timeMs: startsAt.getTime() - now.getTime()
    };
  } else if (now < endsAt) {
    return {
      type: 'ends',
      timeMs: endsAt.getTime() - now.getTime()
    };
  } else {
    return {
      type: 'expired',
      timeMs: 0
    };
  }
};

/**
 * Создать правило сайленсинга для технического окна
 */
export const createMaintenanceWindow = async (
  name: string,
  description: string,
  startsAt: Date,
  durationMinutes: number,
  targetChecks?: number[]
): Promise<SilencingRule> => {
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);
  
  const rule = await createSilencingRule({
    name: `Техническое окно: ${name}`,
    userId: 1, // TODO: получать из контекста пользователя
    isActive: true,
    startTime: startsAt.toISOString(),
    endTime: endsAt.toISOString(),
    silenceType: 'maintenance',
    config: {
      description,
      notifyOnStart: true,
      notifyOnEnd: true
    }
  });

  // Если указаны конкретные чеки, добавляем их как цели
  if (targetChecks && targetChecks.length > 0) {
    await Promise.all(
      targetChecks.map(checkId =>
        addTargetToSilencingRule(rule.id, {
          targetType: 'check',
          targetValue: checkId.toString(),
          description: `Чек ID: ${checkId}`
        })
      )
    );
  }

  return rule;
};
