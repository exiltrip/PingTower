import { api } from '../../../shared/api/privateApi';
import type { Check } from '../../../entities/check';
import type {
  CreateCheckRequest, 
  UpdateCheckRequest, 
  CreateAlertRuleRequest,
  ChecksQueryParams
} from '../types/requests';
import { handleApiCall, ValidationError as ChecksValidationError } from '../lib/errors';
import { validateCreateCheckRequest, validateUpdateCheckRequest } from '../lib/validation';

/**
 * Получает все checks текущего пользователя
 * Эндпоинт: GET /api/v1/checks
 */
export async function getAllChecks(params?: ChecksQueryParams): Promise<Check[]> {
  return handleApiCall(async () => {
    const response = await api.get<Check[]>('/api/v1/checks', { params });
    return response.data;
  });
}

/**
 * Создает новый monitor
 * Эндпоинт: POST /api/v1/checks
 */
export async function createCheck(data: CreateCheckRequest): Promise<Check> {
  // Валидируем данные перед отправкой
  const validation = validateCreateCheckRequest(data);
  if (!validation.isValid) {
    throw new ChecksValidationError('Ошибка валидации данных', validation.errors);
  }
  
  return handleApiCall(async () => {
    const response = await api.post<Check>('/api/v1/checks', data);
    return response.data;
  });
}

/**
 * Получает конкретный check по ID
 * Эндпоинт: GET /api/v1/checks/{id}
 */
export async function getCheckById(id: number): Promise<Check> {
  return handleApiCall(async () => {
    const response = await api.get<Check>(`/api/v1/checks/${id}`);
    return response.data;
  });
}

/**
 * Обновляет конфигурацию существующего check'а
 * Эндпоинт: PUT /api/v1/checks/{id}
 */
export async function updateCheck(id: number, data: UpdateCheckRequest): Promise<Check> {
  // Валидируем данные перед отправкой
  const validation = validateUpdateCheckRequest(data);
  if (!validation.isValid) {
    throw new ChecksValidationError('Ошибка валидации данных', validation.errors);
  }
  
  return handleApiCall(async () => {
    const response = await api.put<Check>(`/api/v1/checks/${id}`, data);
    return response.data;
  });
}

/**
 * Удаляет check и всю его историю (необратимо!)
 * Эндпоинт: DELETE /api/v1/checks/{id}
 */
export async function deleteCheck(id: number): Promise<void> {
  return handleApiCall(async () => {
    await api.delete(`/api/v1/checks/${id}`);
  });
}

/**
 * Создает alert rule для check'а
 * Эндпоинт: POST /api/v1/checks/{id}/alert-rules
 */
export async function createAlertRule(checkId: number, data: CreateAlertRuleRequest): Promise<any> {
  return handleApiCall(async () => {
    const response = await api.post(`/api/v1/checks/${checkId}/alert-rules`, data);
    return response.data;
  });
}

/**
 * Получает alert rules для check'а
 * Эндпоинт: GET /api/v1/checks/{id}/alert-rules
 */
export async function getAlertRules(checkId: number): Promise<any[]> {
  return handleApiCall(async () => {
    const response = await api.get(`/api/v1/checks/${checkId}/alert-rules`);
    return response.data;
  });
}

// Вспомогательные функции для работы с checks

/**
 * Получает только активные (enabled=true) checks
 */
export async function getActiveChecks(): Promise<Check[]> {
  return getAllChecks({ enabled: true });
}

/**
 * Получает checks определенного типа
 */
export async function getChecksByType(type: string): Promise<Check[]> {
  return getAllChecks({ type: type as any });
}

/**
 * Включает/выключает check
 */
export async function toggleCheck(id: number, enabled: boolean): Promise<Check> {
  return updateCheck(id, { enabled });
}

/**
 * Дублирует существующий check с новым именем
 */
export async function duplicateCheck(sourceId: number, newName: string): Promise<Check> {
  const sourceCheck = await getCheckById(sourceId);
  
  const duplicateData: CreateCheckRequest = {
    name: newName,
    type: sourceCheck.type,
    target: sourceCheck.target,
    interval: sourceCheck.interval,
    config: sourceCheck.config as any
  };
  
  return createCheck(duplicateData);
}
