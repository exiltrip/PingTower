import {
  DEFAULT_CONFIGS,
  getDefaultConfig,
  createCheckTemplate,
  validateTarget,
  suggestTargetFix
} from '../api/examples';
import { CheckType } from '../../../entities/check';

describe('Examples API', () => {
  describe('DEFAULT_CONFIGS', () => {
    test('должен содержать конфигурации для всех типов', () => {
      expect(DEFAULT_CONFIGS.http).toBeDefined();
      expect(DEFAULT_CONFIGS.tcp).toBeDefined();
      expect(DEFAULT_CONFIGS.ping).toBeDefined();
    });

    test('HTTP конфигурация должна содержать необходимые поля', () => {
      const httpConfig = DEFAULT_CONFIGS.http.basic;
      expect(httpConfig.method).toBe('GET');
      expect(httpConfig.timeoutMs).toBe(5000);
      expect(httpConfig.expectedStatus).toBe(200);
      expect(httpConfig.degraded_threshold_ms).toBe(3000);
    });

    test('TCP конфигурация должна содержать необходимые поля', () => {
      const tcpConfig = DEFAULT_CONFIGS.tcp.basic;
      expect(tcpConfig.port).toBe(80);
      expect(tcpConfig.timeoutMs).toBe(5000);
      expect(tcpConfig.degraded_threshold_ms).toBe(2000);
    });

    test('PING конфигурация должна содержать необходимые поля', () => {
      const pingConfig = DEFAULT_CONFIGS.ping.basic;
      expect(pingConfig.timeoutMs).toBe(3000);
      expect(pingConfig.packetSize).toBe(32);
      expect(pingConfig.degraded_threshold_ms).toBe(500);
    });
  });

  describe('getDefaultConfig', () => {
    test('должен возвращать базовую конфигурацию для HTTP', () => {
      const config = getDefaultConfig('http');
      expect(config).toEqual(DEFAULT_CONFIGS.http.basic);
    });

    test('должен возвращать расширенную конфигурацию для HTTP', () => {
      const config = getDefaultConfig('http', 'advanced');
      expect(config).toEqual(DEFAULT_CONFIGS.http.advanced);
    });

    test('должен возвращать базовую конфигурацию для неизвестного варианта', () => {
      const config = getDefaultConfig('http', 'unknown');
      expect(config).toEqual(DEFAULT_CONFIGS.http.basic);
    });
  });

  describe('createCheckTemplate', () => {
    test('должен создавать шаблон для HTTP', () => {
      const template = createCheckTemplate('http', 'My Website', 'https://example.com');
      
      expect(template.name).toBe('My Website');
      expect(template.type).toBe('http');
      expect(template.target).toBe('https://example.com');
      expect(template.interval).toBe(300);
      expect(template.config).toEqual(DEFAULT_CONFIGS.http.basic);
    });

    test('должен создавать шаблон для TCP', () => {
      const template = createCheckTemplate('tcp', 'Database', 'db.example.com');
      
      expect(template.name).toBe('Database');
      expect(template.type).toBe('tcp');
      expect(template.target).toBe('db.example.com');
      expect(template.interval).toBe(300);
      expect(template.config).toEqual(DEFAULT_CONFIGS.tcp.basic);
    });

    test('должен создавать шаблон для PING с коротким интервалом', () => {
      const template = createCheckTemplate('ping', 'Server', '8.8.8.8');
      
      expect(template.name).toBe('Server');
      expect(template.type).toBe('ping');
      expect(template.target).toBe('8.8.8.8');
      expect(template.interval).toBe(60); // ping должен быть чаще
      expect(template.config).toEqual(DEFAULT_CONFIGS.ping.basic);
    });
  });

  describe('validateTarget', () => {
    test('должен валидировать HTTP URL', () => {
      expect(validateTarget('http', 'https://example.com')).toBe(true);
      expect(validateTarget('http', 'http://example.com')).toBe(true);
      expect(validateTarget('http', 'not-a-url')).toBe(false);
      expect(validateTarget('http', 'ftp://example.com')).toBe(false);
    });

    test('должен валидировать IP адреса для TCP', () => {
      expect(validateTarget('tcp', '192.168.1.1')).toBe(true);
      expect(validateTarget('tcp', '8.8.8.8')).toBe(true);
      expect(validateTarget('tcp', '999.999.999.999')).toBe(false);
    });

    test('должен валидировать доменные имена для TCP', () => {
      expect(validateTarget('tcp', 'example.com')).toBe(true);
      expect(validateTarget('tcp', 'sub.example.com')).toBe(true);
      expect(validateTarget('tcp', 'localhost')).toBe(true);
    });

    test('должен валидировать IP адреса и домены для PING', () => {
      expect(validateTarget('ping', '8.8.8.8')).toBe(true);
      expect(validateTarget('ping', 'google.com')).toBe(true);
      expect(validateTarget('ping', 'invalid..domain')).toBe(false);
    });
  });

  describe('suggestTargetFix', () => {
    test('должен предлагать исправления для HTTP', () => {
      const suggestions = suggestTargetFix('http', 'example.com');
      expect(suggestions).toContain('https://example.com');
      expect(suggestions).toContain('http://example.com');
    });

    test('должен не предлагать исправления для валидного HTTP URL', () => {
      const suggestions = suggestTargetFix('http', 'https://example.com');
      expect(suggestions).toHaveLength(0);
    });

    test('должен предлагать удаление протокола для TCP', () => {
      const suggestions = suggestTargetFix('tcp', 'https://example.com');
      expect(suggestions).toContain('example.com');
    });

    test('должен предлагать удаление протокола для PING', () => {
      const suggestions = suggestTargetFix('ping', 'http://example.com');
      expect(suggestions).toContain('example.com');
    });

    test('должен не предлагать исправления для валидных TCP/PING targets', () => {
      expect(suggestTargetFix('tcp', 'example.com')).toHaveLength(0);
      expect(suggestTargetFix('ping', '8.8.8.8')).toHaveLength(0);
    });
  });
});
