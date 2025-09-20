import { useState, useEffect, useCallback } from 'react';
import { CheckType } from '../../../entities/check';
import type { Check } from '../../../entities/check';
import { getAllChecks, createCheck, updateCheck, deleteCheck, getCheckById } from '../api/checks';
import type { CreateCheckRequest, UpdateCheckRequest } from '../types/requests';
import { getErrorMessage } from '../lib/errors';

export interface UseChecksReturn {
  checks: Check[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCheckMutation: (data: CreateCheckRequest) => Promise<Check | null>;
  updateCheckMutation: (id: number, data: UpdateCheckRequest) => Promise<Check | null>;
  deleteCheckMutation: (id: number) => Promise<boolean>;
}

/**
 * Hook для управления списком checks
 */
export function useChecks(): UseChecksReturn {
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChecks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllChecks();
      setChecks(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createCheckMutation = useCallback(async (data: CreateCheckRequest): Promise<Check | null> => {
    try {
      setError(null);
      const newCheck = await createCheck(data);
      setChecks(prev => [...prev, newCheck]);
      return newCheck;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    }
  }, []);

  const updateCheckMutation = useCallback(async (id: number, data: UpdateCheckRequest): Promise<Check | null> => {
    try {
      setError(null);
      const updatedCheck = await updateCheck(id, data);
      setChecks(prev => prev.map(check => check.id === id ? updatedCheck : check));
      return updatedCheck;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    }
  }, []);

  const deleteCheckMutation = useCallback(async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await deleteCheck(id);
      setChecks(prev => prev.filter(check => check.id !== id));
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    }
  }, []);

  useEffect(() => {
    fetchChecks();
  }, [fetchChecks]);

  return {
    checks,
    loading,
    error,
    refetch: fetchChecks,
    createCheckMutation,
    updateCheckMutation,
    deleteCheckMutation
  };
}

/**
 * Hook для работы с конкретным check
 */
export function useCheck(id: number) {
  const [check, setCheck] = useState<Check | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCheck = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getCheckById(id);
      setCheck(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCheck();
  }, [fetchCheck]);

  return {
    check,
    loading,
    error,
    refetch: fetchCheck
  };
}

/**
 * Hook для фильтрации checks
 */
export function useFilteredChecks(checks: Check[], filters: {
  type?: CheckType;
  enabled?: boolean;
  search?: string;
}) {
  return useState(() => {
    let filtered = checks;

    if (filters.type) {
      filtered = filtered.filter(check => check.type === filters.type);
    }

    if (filters.enabled !== undefined) {
      filtered = filtered.filter(check => check.enabled === filters.enabled);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(check => 
        check.name.toLowerCase().includes(search) ||
        check.target.toLowerCase().includes(search)
      );
    }

    return filtered;
  })[0];
}
