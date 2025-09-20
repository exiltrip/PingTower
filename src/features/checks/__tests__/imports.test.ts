/**
 * Тесты для проверки корректности импортов и экспортов API слоя
 */
describe('API Layer Imports', () => {
  test('должен импортировать основные типы из entities/check', async () => {
    const checkTypes = await import('../../../entities/check');
    
    expect(checkTypes.CheckType).toBeDefined();
    expect(checkTypes.CheckStatus).toBeDefined();
    expect(checkTypes.CheckType.HTTP).toBe('http');
    expect(checkTypes.CheckType.TCP).toBe('tcp');
    expect(checkTypes.CheckType.PING).toBe('ping');
    
    expect(checkTypes.CheckStatus.UP).toBe('UP');
    expect(checkTypes.CheckStatus.DOWN).toBe('DOWN');
    expect(checkTypes.CheckStatus.DEGRADED).toBe('DEGRADED');
  });

  test('должен импортировать API функции', async () => {
    const checksApi = await import('../api/checks');
    
    expect(typeof checksApi.getAllChecks).toBe('function');
    expect(typeof checksApi.createCheck).toBe('function');
    expect(typeof checksApi.getCheckById).toBe('function');
    expect(typeof checksApi.updateCheck).toBe('function');
    expect(typeof checksApi.deleteCheck).toBe('function');
    expect(typeof checksApi.createAlertRule).toBe('function');
    expect(typeof checksApi.getAlertRules).toBe('function');
  });

  test('должен импортировать функции истории', async () => {
    const historyApi = await import('../api/history');
    
    expect(typeof historyApi.getCheckHistory).toBe('function');
    expect(typeof historyApi.getRecentHistory).toBe('function');
    expect(typeof historyApi.getCheckStats).toBe('function');
    expect(typeof historyApi.getLastCheckStatus).toBe('function');
  });

  test('должен импортировать функции примеров', async () => {
    const examplesApi = await import('../api/examples');
    
    expect(typeof examplesApi.getCheckExamples).toBe('function');
    expect(typeof examplesApi.createCheckTemplate).toBe('function');
    expect(typeof examplesApi.validateTarget).toBe('function');
    expect(examplesApi.DEFAULT_CONFIGS).toBeDefined();
  });

  test('должен импортировать типы запросов и ответов', async () => {
    const requestTypes = await import('../types/requests');
    const responseTypes = await import('../types/responses');
    
    expect(requestTypes.CHECK_VALIDATION).toBeDefined();
    expect(requestTypes.CHECK_VALIDATION.name).toBeDefined();
    expect(requestTypes.CHECK_VALIDATION.target).toBeDefined();
    expect(requestTypes.CHECK_VALIDATION.interval).toBeDefined();
  });

  test('должен импортировать функции валидации', async () => {
    const validation = await import('../lib/validation');
    
    expect(typeof validation.validateCreateCheckRequest).toBe('function');
    expect(typeof validation.validateUpdateCheckRequest).toBe('function');
    expect(typeof validation.validateName).toBe('function');
    expect(typeof validation.validateTarget).toBe('function');
    expect(typeof validation.validateInterval).toBe('function');
  });

  test('должен импортировать классы ошибок', async () => {
    const errors = await import('../lib/errors');
    
    expect(errors.ChecksApiError).toBeDefined();
    expect(errors.ValidationError).toBeDefined();
    expect(errors.AuthenticationError).toBeDefined();
    expect(errors.NotFoundError).toBeDefined();
    expect(errors.NetworkError).toBeDefined();
    expect(typeof errors.getErrorMessage).toBe('function');
    expect(typeof errors.handleApiCall).toBe('function');
  });

  test('должен импортировать React hooks', async () => {
    const { useChecks } = await import('../hooks/useChecks');
    const { useCheckHistory } = await import('../hooks/useCheckHistory');
    const { useCheckExamples } = await import('../hooks/useCheckExamples');
    
    expect(typeof useChecks).toBe('function');
    expect(typeof useCheckHistory).toBe('function');
    expect(typeof useCheckExamples).toBe('function');
  });

  test('должен импортировать все из главного индекса', async () => {
    const checksFeature = await import('../index');
    
    // API функции
    expect(typeof checksFeature.getAllChecks).toBe('function');
    expect(typeof checksFeature.createCheck).toBe('function');
    expect(typeof checksFeature.getCheckHistory).toBe('function');
    
    // Типы
    expect(checksFeature.CHECK_VALIDATION).toBeDefined();
    
    // Hooks
    expect(typeof checksFeature.useChecks).toBe('function');
    expect(typeof checksFeature.useCheckHistory).toBe('function');
    
    // Утилиты
    expect(typeof checksFeature.validateCreateCheckRequest).toBe('function');
    expect(typeof checksFeature.getErrorMessage).toBe('function');
    expect(checksFeature.ChecksApiError).toBeDefined();
  });

  test('должен иметь правильную структуру конфигурации', async () => {
    const { isHttpConfig, isTcpConfig, isPingConfig } = await import('../../../entities/check');
    
    expect(typeof isHttpConfig).toBe('function');
    expect(typeof isTcpConfig).toBe('function');
    expect(typeof isPingConfig).toBe('function');
  });
});
