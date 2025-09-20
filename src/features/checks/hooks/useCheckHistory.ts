import { useState, useEffect, useCallback } from 'react';
import type { CheckHistoryItem } from '../../../entities/check';
import { getCheckHistory, getRecentHistory, getCheckStats, getLastCheckStatus } from '../api/history';
import type { GetHistoryParams } from '../types/requests';
import { getErrorMessage } from '../lib/errors';

export interface UseCheckHistoryReturn {
  history: CheckHistoryItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  } | null;
  loading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook для получения истории check'а с пагинацией
 */
export function useCheckHistory(checkId: number, initialParams?: GetHistoryParams): UseCheckHistoryReturn {
  const [history, setHistory] = useState<CheckHistoryItem[]>([]);
  const [pagination, setPagination] = useState<{
    total: number;
    limit: number;
    offset: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<GetHistoryParams>(initialParams || { limit: 50, offset: 0 });

  const fetchHistory = useCallback(async (append = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getCheckHistory(checkId, params);
      
      if (append) {
        setHistory(prev => [...prev, ...response.data]);
      } else {
        setHistory(response.data);
      }
      
      setPagination(response.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [checkId, params]);

  const loadMore = useCallback(async () => {
    if (!pagination) return;
    
    const newOffset = pagination.offset + pagination.limit;
    setParams(prev => ({ ...prev, offset: newOffset }));
    
    try {
      const response = await getCheckHistory(checkId, { 
        ...params, 
        offset: newOffset 
      });
      setHistory(prev => [...prev, ...response.data]);
      setPagination(response.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [checkId, params, pagination]);

  const refetch = useCallback(() => {
    setParams(prev => ({ ...prev, offset: 0 }));
    return fetchHistory(false);
  }, [fetchHistory]);

  useEffect(() => {
    fetchHistory(false);
  }, [fetchHistory]);

  return {
    history,
    pagination,
    loading,
    error,
    loadMore,
    refetch
  };
}

/**
 * Hook для получения последних записей истории
 */
export function useRecentHistory(checkId: number, limit = 10) {
  const [history, setHistory] = useState<CheckHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRecentHistory(checkId, limit);
      setHistory(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [checkId, limit]);

  useEffect(() => {
    fetchRecentHistory();
  }, [fetchRecentHistory]);

  return {
    history,
    loading,
    error,
    refetch: fetchRecentHistory
  };
}

/**
 * Hook для получения статистики check'а
 */
export function useCheckStats(checkId: number, days = 7) {
  const [stats, setStats] = useState<{
    uptime: number;
    totalChecks: number;
    upChecks: number;
    downChecks: number;
    degradedChecks: number;
    averageLatency: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCheckStats(checkId, days);
      setStats(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [checkId, days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

/**
 * Hook для получения последнего статуса check'а
 */
export function useLastCheckStatus(checkId: number) {
  const [lastStatus, setLastStatus] = useState<CheckHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLastStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await getLastCheckStatus(checkId);
      setLastStatus(status);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [checkId]);

  useEffect(() => {
    fetchLastStatus();
    
    // Обновляем статус каждые 30 секунд
    const interval = setInterval(fetchLastStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchLastStatus]);

  return {
    lastStatus,
    loading,
    error,
    refetch: fetchLastStatus
  };
}
