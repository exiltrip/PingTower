import { CheckType, CheckStatus } from '../../../entities/check';
import { CreateCheckRequest, UpdateCheckRequest } from '../types/requests';
import { ApiResponse } from '../types/responses';

describe('Checks Types', () => {
  test('CheckType enum должен содержать все типы', () => {
    expect(CheckType.HTTP).toBe('http');
    expect(CheckType.TCP).toBe('tcp');
    expect(CheckType.PING).toBe('ping');
  });

  test('CheckStatus enum должен содержать все статусы', () => {
    expect(CheckStatus.UP).toBe('UP');
    expect(CheckStatus.DOWN).toBe('DOWN');
    expect(CheckStatus.DEGRADED).toBe('DEGRADED');
  });

  test('CreateCheckRequest должен иметь правильную структуру', () => {
    const request: CreateCheckRequest = {
      name: 'Test Check',
      type: CheckType.HTTP,
      target: 'https://example.com',
      interval: 300,
      config: {
        method: 'GET',
        timeoutMs: 5000,
        expectedStatus: 200,
        degraded_threshold_ms: 3000
      }
    };

    expect(request.name).toBe('Test Check');
    expect(request.type).toBe(CheckType.HTTP);
    expect(request.target).toBe('https://example.com');
    expect(request.interval).toBe(300);
    expect(request.config).toBeDefined();
  });

  test('UpdateCheckRequest должен работать с частичными данными', () => {
    const request: UpdateCheckRequest = {
      enabled: false
    };

    expect(request.enabled).toBe(false);
    expect(request.name).toBeUndefined();
  });

  test('ApiResponse должен иметь правильную структуру', () => {
    const response: ApiResponse<string> = {
      message: 'Success',
      data: 'test data'
    };

    expect(response.message).toBe('Success');
    expect(response.data).toBe('test data');
  });
});
