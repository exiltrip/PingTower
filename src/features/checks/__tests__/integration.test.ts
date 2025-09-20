/**
 * Интеграционные тесты для проверки взаимодействия компонентов API слоя
 */
import { CheckType } from '../../../entities/check';
import { validateCreateCheckRequest } from '../lib/validation';
import { createCheckTemplate, validateTarget } from '../api/examples';
import { getErrorMessage, ValidationError } from '../lib/errors';

describe('Integration Tests', () => {
  describe('Валидация + Примеры', () => {
    test('должен создать валидный HTTP шаблон и пройти валидацию', () => {
      const template = createCheckTemplate(
        'http', 
        'My Website', 
        'https://example.com'
      );
      
      const validation = validateCreateCheckRequest(template);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('должен создать валидный TCP шаблон и пройти валидацию', () => {
      const template = createCheckTemplate(
        'tcp', 
        'Database Server', 
        'db.example.com'
      );
      
      const validation = validateCreateCheckRequest(template);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('должен создать валидный PING шаблон и пройти валидацию', () => {
      const template = createCheckTemplate(
        'ping', 
        'Google DNS', 
        '8.8.8.8'
      );
      
      const validation = validateCreateCheckRequest(template);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Валидация Target + Examples', () => {
    test('должен корректно валидировать HTTP targets', () => {
      expect(validateTarget('http', 'https://example.com')).toBe(true);
      expect(validateTarget('http', 'http://localhost:3000')).toBe(true);
      expect(validateTarget('http', 'not-a-url')).toBe(false);
    });

    test('должен корректно валидировать TCP targets', () => {
      expect(validateTarget('tcp', 'example.com')).toBe(true);
      expect(validateTarget('tcp', '192.168.1.1')).toBe(true);
      expect(validateTarget('tcp', 'localhost')).toBe(true);
    });

    test('должен корректно валидировать PING targets', () => {
      expect(validateTarget('ping', '8.8.8.8')).toBe(true);
      expect(validateTarget('ping', 'google.com')).toBe(true);
      expect(validateTarget('ping', 'invalid..domain')).toBe(false);
    });
  });

  describe('Ошибки + Валидация', () => {
    test('должен создать ValidationError и получить читаемое сообщение', () => {
      const invalidRequest = {
        name: '',
        type: CheckType.HTTP,
        target: 'invalid-url',
        interval: 1,
        config: {
          method: 'GET' as const,
          timeoutMs: 5000,
          expectedStatus: 200,
          degraded_threshold_ms: 3000
        }
      };

      const validation = validateCreateCheckRequest(invalidRequest);
      expect(validation.isValid).toBe(false);

      const error = new ValidationError('Validation failed', validation.errors);
      const message = getErrorMessage(error);
      
      expect(message).toContain('Ошибки валидации:');
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Полный workflow создания check', () => {
    test('должен пройти полный процесс создания HTTP check', () => {
      // 1. Создаем шаблон
      const template = createCheckTemplate(
        'http',
        'Production API',
        'https://api.production.com'
      );

      // 2. Валидируем target
      expect(validateTarget('http', template.target)).toBe(true);

      // 3. Валидируем весь запрос
      const validation = validateCreateCheckRequest(template);
      expect(validation.isValid).toBe(true);

      // 4. Проверяем структуру
      expect(template.name).toBe('Production API');
      expect(template.type).toBe('http');
      expect(template.target).toBe('https://api.production.com');
      expect(template.interval).toBe(300);
      expect(template.config).toBeDefined();
    });

    test('должен обработать ошибки при некорректных данных', () => {
      // 1. Пытаемся создать некорректный check
      const invalidData = {
        name: '',
        type: CheckType.HTTP,
        target: 'not-a-url',
        interval: -1,
        config: {
          method: 'INVALID' as any,
          timeoutMs: -1,
          expectedStatus: 999,
          degraded_threshold_ms: -1
        }
      };

      // 2. Валидируем
      const validation = validateCreateCheckRequest(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);

      // 3. Проверяем, что ошибки описательные
      const nameError = validation.errors.find(e => e.field === 'name');
      const targetError = validation.errors.find(e => e.field === 'target');
      const intervalError = validation.errors.find(e => e.field === 'interval');

      expect(nameError).toBeDefined();
      expect(targetError).toBeDefined();
      expect(intervalError).toBeDefined();
    });
  });

  describe('Типы конфигураций', () => {
    test('должен работать с различными HTTP конфигурациями', () => {
      const basicHttp = createCheckTemplate('http', 'Basic', 'https://example.com', 'basic');
      const advancedHttp = createCheckTemplate('http', 'Advanced', 'https://api.com', 'advanced');

      expect(validateCreateCheckRequest(basicHttp).isValid).toBe(true);
      expect(validateCreateCheckRequest(advancedHttp).isValid).toBe(true);

      // Проверяем что конфигурации разные
      expect(basicHttp.config).not.toEqual(advancedHttp.config);
    });

    test('должен работать с различными TCP конфигурациями', () => {
      const basicTcp = createCheckTemplate('tcp', 'Web Server', 'example.com', 'basic');
      const dbTcp = createCheckTemplate('tcp', 'Database', 'db.example.com', 'database');

      expect(validateCreateCheckRequest(basicTcp).isValid).toBe(true);
      expect(validateCreateCheckRequest(dbTcp).isValid).toBe(true);
    });

    test('должен работать с различными PING конфигурациями', () => {
      const basicPing = createCheckTemplate('ping', 'Server', '8.8.8.8', 'basic');
      const fastPing = createCheckTemplate('ping', 'Fast Check', '1.1.1.1', 'fast');

      expect(validateCreateCheckRequest(basicPing).isValid).toBe(true);
      expect(validateCreateCheckRequest(fastPing).isValid).toBe(true);

      // PING должен иметь короткий интервал
      expect(basicPing.interval).toBe(60);
      expect(fastPing.interval).toBe(60);
    });
  });
});
