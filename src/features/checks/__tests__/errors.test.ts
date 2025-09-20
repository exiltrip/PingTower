import {
  ChecksApiError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  NetworkError,
  getErrorMessage,
  getErrorDetails
} from '../lib/errors';

describe('Error Handling', () => {
  describe('ChecksApiError', () => {
    test('должен создаваться с правильными параметрами', () => {
      const error = new ChecksApiError('Test error', 400, { detail: 'test' });
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.name).toBe('ChecksApiError');
    });
  });

  describe('ValidationError', () => {
    test('должен создаваться с ошибками валидации', () => {
      const validationErrors = [
        { field: 'name', message: 'Required' },
        { field: 'target', message: 'Invalid URL' }
      ];
      
      const error = new ValidationError('Validation failed', validationErrors);
      
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.validationErrors).toEqual(validationErrors);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('AuthenticationError', () => {
    test('должен создаваться с дефолтным сообщением', () => {
      const error = new AuthenticationError();
      
      expect(error.message).toBe('Требуется авторизация');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    test('должен принимать кастомное сообщение', () => {
      const error = new AuthenticationError('Custom auth error');
      
      expect(error.message).toBe('Custom auth error');
    });
  });

  describe('NotFoundError', () => {
    test('должен создаваться с дефолтным сообщением', () => {
      const error = new NotFoundError();
      
      expect(error.message).toBe('Ресурс не найден');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('NetworkError', () => {
    test('должен создаваться с дефолтным сообщением', () => {
      const error = new NetworkError();
      
      expect(error.message).toBe('Ошибка сети. Проверьте подключение');
      expect(error.statusCode).toBe(0);
    });
  });

  describe('getErrorMessage', () => {
    test('должен возвращать сообщение для ValidationError', () => {
      const error = new ValidationError('Validation failed', [
        { field: 'name', message: 'Name is required' }
      ]);
      
      const message = getErrorMessage(error);
      expect(message).toBe('Name is required');
    });

    test('должен возвращать сообщение для ValidationError с несколькими ошибками', () => {
      const error = new ValidationError('Validation failed', [
        { field: 'name', message: 'Name is required' },
        { field: 'target', message: 'Invalid URL' }
      ]);
      
      const message = getErrorMessage(error);
      expect(message).toContain('Ошибки валидации:');
      expect(message).toContain('Name is required');
      expect(message).toContain('Invalid URL');
    });

    test('должен возвращать сообщение для AuthenticationError', () => {
      const error = new AuthenticationError();
      const message = getErrorMessage(error);
      expect(message).toBe('Необходимо войти в систему');
    });

    test('должен возвращать сообщение для NotFoundError', () => {
      const error = new NotFoundError();
      const message = getErrorMessage(error);
      expect(message).toBe('Запрашиваемый ресурс не найден или был удален');
    });

    test('должен возвращать сообщение для NetworkError', () => {
      const error = new NetworkError();
      const message = getErrorMessage(error);
      expect(message).toBe('Проблемы с подключением к серверу. Проверьте интернет-соединение');
    });

    test('должен возвращать дефолтное сообщение для неизвестной ошибки', () => {
      const error = new Error('Unknown error');
      const message = getErrorMessage(error);
      expect(message).toBe('Произошла неожиданная ошибка');
    });
  });

  describe('getErrorDetails', () => {
    test('должен возвращать детали для ChecksApiError', () => {
      const error = new ChecksApiError('Test error', 400, { detail: 'test' });
      const details = getErrorDetails(error);
      
      expect(details.name).toBe('ChecksApiError');
      expect(details.message).toBe('Test error');
      expect(details.statusCode).toBe(400);
      expect(details.details).toEqual({ detail: 'test' });
    });

    test('должен возвращать детали для обычной ошибки', () => {
      const error = new Error('Standard error');
      const details = getErrorDetails(error);
      
      expect(details.name).toBe('Error');
      expect(details.message).toBe('Standard error');
      expect(details.statusCode).toBe(0);
      expect(details.details).toBeNull();
    });

    test('должен обрабатывать неизвестные типы ошибок', () => {
      const error = 'String error';
      const details = getErrorDetails(error);
      
      expect(details.name).toBe('UnknownError');
      expect(details.message).toBe('String error');
      expect(details.statusCode).toBe(0);
    });
  });
});
