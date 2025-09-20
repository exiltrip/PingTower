import { useState, useEffect, useCallback } from 'react';
import type { CheckExamples } from '../types/responses';
import { getCheckExamples, createCheckTemplate, DEFAULT_CONFIGS } from '../api/examples';
import { CheckType } from '../../../entities/check';
import { getErrorMessage } from '../lib/errors';

export interface UseCheckExamplesReturn {
  examples: CheckExamples | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getTemplate: (type: CheckType, name: string, target: string, variant?: string) => any;
  getDefaultConfig: (type: CheckType, variant?: string) => any;
}

/**
 * Hook для работы с примерами конфигураций checks
 */
export function useCheckExamples(): UseCheckExamplesReturn {
  const [examples, setExamples] = useState<CheckExamples | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExamples = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCheckExamples();
      setExamples(data);
    } catch (err) {
      setError(getErrorMessage(err));
      // Fallback на локальные примеры если API недоступен
      setExamples({
        basicHttp: {
          name: 'Basic HTTP Check',
          type: 'http',
          target: 'https://example.com',
          interval: 300,
          config: DEFAULT_CONFIGS.http.basic
        },
        advancedHttp: {
          name: 'Advanced HTTP Check',
          type: 'http', 
          target: 'https://api.example.com',
          interval: 120,
          config: DEFAULT_CONFIGS.http.advanced
        },
        tcpCheck: {
          name: 'TCP Port Check',
          type: 'tcp',
          target: 'example.com', 
          interval: 300,
          config: DEFAULT_CONFIGS.tcp.basic
        },
        pingCheck: {
          name: 'Ping Check',
          type: 'ping',
          target: '8.8.8.8',
          interval: 60,
          config: DEFAULT_CONFIGS.ping.basic
        },
        multiStatusHttp: {
          name: 'Multi-Status HTTP',
          type: 'http',
          target: 'https://example.com/redirect',
          interval: 600,
          config: {
            ...DEFAULT_CONFIGS.http.basic,
            expectedStatus: [200, 201, 202, 301, 302]
          }
        },
        highPerfPing: {
          name: 'Fast Ping Check',
          type: 'ping',
          target: '1.1.1.1',
          interval: 30,
          config: DEFAULT_CONFIGS.ping.fast
        }
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplate = useCallback((
    type: CheckType, 
    name: string, 
    target: string, 
    variant = 'basic'
  ) => {
    return createCheckTemplate(type, name, target, variant);
  }, []);

  const getDefaultConfig = useCallback((type: CheckType, variant = 'basic') => {
    return DEFAULT_CONFIGS[type][variant as keyof typeof DEFAULT_CONFIGS[typeof type]] || 
           DEFAULT_CONFIGS[type].basic;
  }, []);

  useEffect(() => {
    fetchExamples();
  }, [fetchExamples]);

  return {
    examples,
    loading,
    error,
    refetch: fetchExamples,
    getTemplate,
    getDefaultConfig
  };
}

/**
 * Hook для получения конкретного примера по типу
 */
export function useCheckExample(type: CheckType) {
  const { examples, loading, error } = useCheckExamples();
  
  const example = useState(() => {
    if (!examples) return null;
    
    switch (type) {
      case CheckType.HTTP:
        return examples.basicHttp;
      case CheckType.TCP:
        return examples.tcpCheck;
      case CheckType.PING:
        return examples.pingCheck;
      default:
        return null;
    }
  })[0];

  return {
    example,
    loading,
    error
  };
}
