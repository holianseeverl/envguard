const { redactValue, redactEnv, redactWithReport } = require('./redactor');

describe('redactValue', () => {
  test('redacts known sensitive keys', () => {
    expect(redactValue('API_KEY', 'abc123')).toBe('[REDACTED]');
    expect(redactValue('DB_PASSWORD', 'secret')).toBe('[REDACTED]');
    expect(redactValue('AUTH_TOKEN', 'tok_xyz')).toBe('[REDACTED]');
  });

  test('leaves non-sensitive keys unchanged', () => {
    expect(redactValue('APP_NAME', 'myapp')).toBe('myapp');
    expect(redactValue('PORT', '3000')).toBe('3000');
    expect(redactValue('NODE_ENV', 'production')).toBe('production');
  });

  test('uses custom placeholder', () => {
    expect(redactValue('API_KEY', 'abc123', { placeholder: '***' })).toBe('***');
  });

  test('redacts by value pattern', () => {
    const options = { patterns: [/^sk-[a-z0-9]+/] };
    expect(redactValue('OPENAI_KEY', 'sk-abc123', options)).toBe('[REDACTED]');
    expect(redactValue('SOME_VAR', 'hello', options)).toBe('hello');
  });

  test('redacts extra sensitive keys', () => {
    const options = { extraSensitiveKeys: ['MY_CUSTOM_SECRET'] };
    expect(redactValue('MY_CUSTOM_SECRET', 'val', options)).toBe('[REDACTED]');
    expect(redactValue('OTHER_VAR', 'val', options)).toBe('val');
  });

  test('pattern matching is case-sensitive by default', () => {
    const options = { patterns: [/^Bearer /] };
    expect(redactValue('AUTH', 'Bearer token123', options)).toBe('[REDACTED]');
    expect(redactValue('AUTH', 'bearer token123', options)).toBe('bearer token123');
  });
});

describe('redactEnv', () => {
  test('redacts all sensitive keys in an object', () => {
    const env = {
      APP_NAME: 'myapp',
      API_KEY: 'secret-key',
      PORT: '8080',
      DB_PASSWORD: 'hunter2',
    };
    const result = redactEnv(env);
    expect(result.APP_NAME).toBe('myapp');
    expect(result.PORT).toBe('8080');
    expect(result.API_KEY).toBe('[REDACTED]');
    expect(result.DB_PASSWORD).toBe('[REDACTED]');
  });

  test('does not mutate original env', () => {
    const env = { API_KEY: 'original' };
    redactEnv(env);
    expect(env.API_KEY).toBe('original');
  });

  test('applies pattern options', () => {
    const env = { WEBHOOK_URL: 'https://hooks.example.com/secret/abc' };
    const result = redactEnv(env, { patterns: [/\/secret\//] });
    expect(result.WEBHOOK_URL).toBe('[REDACTED]');
  });
});

describe('redactWithReport', () => {
  test('returns list of redacted keys', () => {
    const env = { API_KEY: 'abc', APP_NAME: 'app', DB_PASS: 'pw' };
    const { redacted, env: result } = redactWithReport(env);
    expect(redacted).toContain('API_KEY');
    expect(redacted).toContain('DB_PASS');
    expect(redacted).not.toContain('APP_NAME');
    expect(result.APP_NAME).toBe('app');
  });

  test('returns empty redacted array when nothing sensitive', () => {
    const env = { HOST: 'localhost', PORT: '3000' };
    const { redacted } = redactWithReport(env);
    expect(redacted).toHaveLength(0);
  });
});
