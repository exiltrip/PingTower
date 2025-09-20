import {
  HttpConfig,
  TcpConfig,
  PingConfig,
  CheckConfig,
  isHttpConfig,
  isTcpConfig,
  isPingConfig,
  configValidators
} from '../../../entities/check';

describe('Config Types', () => {
  describe('Type Guards', () => {
    test('isHttpConfig должен правильно определять HTTP конфигурацию', () => {
      const httpConfig: HttpConfig = {
        method: 'GET',
        expectedStatus: 200,
        timeoutMs: 5000,
        degraded_threshold_ms: 3000
      };

      expect(isHttpConfig(httpConfig)).toBe(true);
    });

    test('isHttpConfig должен отклонять TCP конфигурацию', () => {
      const tcpConfig: TcpConfig = {
        port: 80,
        timeoutMs: 5000,
        degraded_threshold_ms: 2000
      };

      expect(isHttpConfig(tcpConfig)).toBe(false);
    });

    test('isTcpConfig должен правильно определять TCP конфигурацию', () => {
      const tcpConfig: TcpConfig = {
        port: 80,
        timeoutMs: 5000,
        degraded_threshold_ms: 2000
      };

      expect(isTcpConfig(tcpConfig)).toBe(true);
    });

    test('isTcpConfig должен отклонять HTTP конфигурацию', () => {
      const httpConfig: HttpConfig = {
        method: 'GET',
        expectedStatus: 200,
        timeoutMs: 5000,
        degraded_threshold_ms: 3000
      };

      expect(isTcpConfig(httpConfig)).toBe(false);
    });

    test('isPingConfig должен правильно определять Ping конфигурацию', () => {
      const pingConfig: PingConfig = {
        packetSize: 32,
        timeoutMs: 3000,
        degraded_threshold_ms: 500
      };

      expect(isPingConfig(pingConfig)).toBe(true);
    });

    test('isPingConfig должен работать с базовой конфигурацией без packetSize', () => {
      const baseConfig = {
        timeoutMs: 3000,
        degraded_threshold_ms: 500
      };

      expect(isPingConfig(baseConfig)).toBe(true);
    });
  });

  describe('Config Validators', () => {
    describe('HTTP validators', () => {
      test('должен валидировать HTTP методы', () => {
        expect(configValidators.http.method.includes('GET')).toBe(true);
        expect(configValidators.http.method.includes('POST')).toBe(true);
        expect(configValidators.http.method.includes('INVALID')).toBe(false);
      });

      test('должен валидировать expectedStatus', () => {
        expect(configValidators.http.expectedStatus(200)).toBe(true);
        expect(configValidators.http.expectedStatus([200, 201])).toBe(true);
        expect(configValidators.http.expectedStatus(99)).toBe(false);
        expect(configValidators.http.expectedStatus(600)).toBe(false);
        expect(configValidators.http.expectedStatus([200, 99])).toBe(false);
      });

      test('должен валидировать timeoutMs', () => {
        expect(configValidators.http.timeoutMs(5000)).toBe(true);
        expect(configValidators.http.timeoutMs(500)).toBe(false);
        expect(configValidators.http.timeoutMs(70000)).toBe(false);
      });
    });

    describe('TCP validators', () => {
      test('должен валидировать порт', () => {
        expect(configValidators.tcp.port(80)).toBe(true);
        expect(configValidators.tcp.port(65535)).toBe(true);
        expect(configValidators.tcp.port(0)).toBe(false);
        expect(configValidators.tcp.port(65536)).toBe(false);
      });

      test('должен валидировать timeoutMs', () => {
        expect(configValidators.tcp.timeoutMs(5000)).toBe(true);
        expect(configValidators.tcp.timeoutMs(500)).toBe(false);
      });
    });

    describe('Ping validators', () => {
      test('должен валидировать размер пакета', () => {
        expect(configValidators.ping.packetSize(32)).toBe(true);
        expect(configValidators.ping.packetSize(65507)).toBe(true);
        expect(configValidators.ping.packetSize(0)).toBe(false);
        expect(configValidators.ping.packetSize(65508)).toBe(false);
      });

      test('должен валидировать timeoutMs', () => {
        expect(configValidators.ping.timeoutMs(3000)).toBe(true);
        expect(configValidators.ping.timeoutMs(500)).toBe(false);
      });
    });
  });

  describe('Config Structure', () => {
    test('HttpConfig должен содержать все необходимые поля', () => {
      const config: HttpConfig = {
        method: 'GET',
        expectedStatus: 200,
        timeoutMs: 5000,
        degraded_threshold_ms: 3000,
        headers: {
          'User-Agent': 'PingTower'
        },
        ssl_check_enabled: true,
        content_check: {
          type: 'JSON_CONTAINS',
          key: 'status',
          expected_value: 'ok'
        }
      };

      expect(config.method).toBe('GET');
      expect(config.expectedStatus).toBe(200);
      expect(config.headers).toBeDefined();
      expect(config.ssl_check_enabled).toBe(true);
      expect(config.content_check?.type).toBe('JSON_CONTAINS');
    });

    test('TcpConfig должен содержать все необходимые поля', () => {
      const config: TcpConfig = {
        port: 443,
        timeoutMs: 8000,
        degraded_threshold_ms: 3000
      };

      expect(config.port).toBe(443);
      expect(config.timeoutMs).toBe(8000);
      expect(config.degraded_threshold_ms).toBe(3000);
    });

    test('PingConfig должен содержать все необходимые поля', () => {
      const config: PingConfig = {
        timeoutMs: 3000,
        degraded_threshold_ms: 500,
        packetSize: 64
      };

      expect(config.timeoutMs).toBe(3000);
      expect(config.degraded_threshold_ms).toBe(500);
      expect(config.packetSize).toBe(64);
    });
  });
});
