import { api } from '../../../shared/api/privateApi';
import { CheckHistoryResponse } from '../../../entities/check';
import { GetHistoryParams } from '../types/requests';
import { handleApiCall } from '../lib/errors';

/**
 * Получает историю выполнения check'а
 * Эндпоинт: GET /api/v1/checks/{id}/history
 */
export async function getCheckHistory(
  id: number, 
  params?: GetHistoryParams
): Promise<CheckHistoryResponse> {
  return handleApiCall(async () => {
    const response = await api.get<CheckHistoryResponse>(
      `/api/v1/checks/${id}/history`,
      { params }
    );
    return response.data;
  });
}

/**
 * Получает последние N записей истории
 */
export async function getRecentHistory(id: number, limit: number = 10): Promise<CheckHistoryResponse> {
  return getCheckHistory(id, { limit, offset: 0 });
}

/**
 * Получает историю с пагинацией
 */
export async function getPaginatedHistory(
  id: number, 
  page: number = 1, 
  pageSize: number = 50
): Promise<CheckHistoryResponse> {
  const offset = (page - 1) * pageSize;
  return getCheckHistory(id, { limit: pageSize, offset });
}

/**
 * Получает только неудачные попытки из истории
 */
export async function getFailedHistory(id: number, limit?: number): Promise<CheckHistoryResponse> {
  const history = await getCheckHistory(id, { limit });
  
  return {
    data: history.data.filter(item => item.status === 'DOWN'),
    pagination: {
      ...history.pagination,
      total: history.data.filter(item => item.status === 'DOWN').length
    }
  };
}

/**
 * Получает статистику по истории check'а
 */
export async function getCheckStats(id: number, days: number = 7) {
  const limit = days * 24 * 12; // примерно каждые 5 минут
  const history = await getCheckHistory(id, { limit });
  
  const totalChecks = history.data.length;
  if (totalChecks === 0) {
    return {
      uptime: 0,
      totalChecks: 0,
      upChecks: 0,
      downChecks: 0,
      degradedChecks: 0,
      averageLatency: 0
    };
  }
  
  const upChecks = history.data.filter(h => h.status === 'UP').length;
  const downChecks = history.data.filter(h => h.status === 'DOWN').length;
  const degradedChecks = history.data.filter(h => h.status === 'DEGRADED').length;
  
  const latencies = history.data
    .filter(h => h.latencyMs !== null)
    .map(h => h.latencyMs!);
  
  const averageLatency = latencies.length > 0 
    ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length 
    : 0;
  
  return {
    uptime: (upChecks / totalChecks) * 100,
    totalChecks,
    upChecks,
    downChecks,
    degradedChecks,
    averageLatency: Math.round(averageLatency * 100) / 100
  };
}

/**
 * Получает последний статус check'а
 */
export async function getLastCheckStatus(id: number) {
  const history = await getRecentHistory(id, 1);
  return history.data.length > 0 ? history.data[0] : null;
}

/**
 * Получает тенденцию изменения latency (улучшается/ухудшается)
 */
export async function getLatencyTrend(id: number, samples: number = 20) {
  const history = await getCheckHistory(id, { limit: samples });
  
  if (history.data.length < 2) {
    return { trend: 'stable', change: 0 };
  }
  
  const latencies = history.data
    .filter(h => h.latencyMs !== null)
    .map(h => h.latencyMs!)
    .reverse(); // от старых к новым
  
  if (latencies.length < 2) {
    return { trend: 'stable', change: 0 };
  }
  
  const firstHalf = latencies.slice(0, Math.floor(latencies.length / 2));
  const secondHalf = latencies.slice(Math.floor(latencies.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, lat) => sum + lat, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, lat) => sum + lat, 0) / secondHalf.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  let trend: 'improving' | 'degrading' | 'stable' = 'stable';
  if (Math.abs(change) > 10) { // более 10% изменения
    trend = change > 0 ? 'degrading' : 'improving';
  }
  
  return { trend, change: Math.round(change * 100) / 100 };
}
