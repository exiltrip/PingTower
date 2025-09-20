import { 
  validateName, 
  validateTarget, 
  validateInterval, 
  validateCreateCheckRequest,
  validateUpdateCheckRequest
} from '../lib/validation';
import { CheckType } from '../../../entities/check';

describe('Validation Functions', () => {
  describe('validateName', () => {
    test('должен принимать корректное название', () => {
      const errors = validateName('My Website Check');
      expect(errors).toHaveLength(0);
    });

    test('должен отклонять пустое название', () => {
      const errors = validateName('');
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('name');
      expect(errors[0].message).toContain('обязательно');
    });

    test('должен отклонять слишком длинное название', () => {
      const longName = 'a'.repeat(256);
      const errors = validateName(longName);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('255 символов');
    });
  });

  describe('validateTarget', () => {
    test('должен принимать корректный HTTP URL', () => {
      const errors = validateTarget(CheckType.HTTP, 'https://example.com');
      expect(errors).toHaveLength(0);
    });

    test('должен отклонять некорректный HTTP URL', () => {
      const errors = validateTarget(CheckType.HTTP, 'not-a-url');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('корректный URL');
    });

    test('должен принимать IP адрес для TCP', () => {
      const errors = validateTarget(CheckType.TCP, '192.168.1.1');
      expect(errors).toHaveLength(0);
    });

    test('должен принимать доменное имя для PING', () => {
      const errors = validateTarget(CheckType.PING, 'google.com');
      expect(errors).toHaveLength(0);
    });

    test('должен отклонять пустой target', () => {
      const errors = validateTarget(CheckType.HTTP, '');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('обязателен');
    });
  });

  describe('validateInterval', () => {
    test('должен принимать корректный интервал', () => {
      const errors = validateInterval(300);
      expect(errors).toHaveLength(0);
    });

    test('должен отклонять слишком маленький интервал', () => {
      const errors = validateInterval(1);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('от 5 секунд');
    });

    test('должен отклонять слишком большой интервал', () => {
      const errors = validateInterval(100000);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('24 часов');
    });
  });

  describe('validateCreateCheckRequest', () => {
    test('должен принимать корректный запрос', () => {
      const request = {
        name: 'Test Check',
        type: CheckType.HTTP,
        target: 'https://example.com',
        interval: 300,
        config: {
          method: 'GET' as const,
          timeoutMs: 5000,
          expectedStatus: 200,
          degraded_threshold_ms: 3000
        }
      };

      const result = validateCreateCheckRequest(request);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('должен отклонять запрос с ошибками', () => {
      const request = {
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

      const result = validateCreateCheckRequest(request);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateUpdateCheckRequest', () => {
    test('должен принимать частичные обновления', () => {
      const request = {
        enabled: false
      };

      const result = validateUpdateCheckRequest(request);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('должен валидировать предоставленные поля', () => {
      const request = {
        name: '',
        interval: 1
      };

      const result = validateUpdateCheckRequest(request);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
