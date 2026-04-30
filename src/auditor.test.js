const { auditEnv } = require('./auditor');

const baseSchema = {
  PORT: { required: true, type: 'number', pattern: null },
  NODE_ENV: { required: true, type: 'string', pattern: '^(development|production|test)$' },
  API_URL: { required: false, type: 'url', pattern: null },
  DEBUG: { required: false, type: 'boolean', pattern: null },
};

describe('auditEnv', () => {
  test('returns empty results for a fully valid env', () => {
    const env = { PORT: '3000', NODE_ENV: 'production', API_URL: 'https://api.example.com', DEBUG: 'false' };
    const result = auditEnv(env, baseSchema);
    expect(result.missing).toHaveLength(0);
    expect(result.invalid).toHaveLength(0);
    expect(result.extra).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  test('detects missing required keys', () => {
    const env = { NODE_ENV: 'development' };
    const result = auditEnv(env, baseSchema);
    expect(result.missing).toContain('PORT');
    expect(result.errors['PORT']).toMatch(/Missing required/);
  });

  test('adds optional missing keys to warnings, not missing', () => {
    const env = { PORT: '8080', NODE_ENV: 'test' };
    const result = auditEnv(env, baseSchema);
    expect(result.missing).not.toContain('API_URL');
    expect(result.warnings).toContain('API_URL');
  });

  test('detects invalid number type', () => {
    const env = { PORT: 'abc', NODE_ENV: 'production' };
    const result = auditEnv(env, baseSchema);
    expect(result.invalid).toContain('PORT');
    expect(result.errors['PORT']).toMatch(/must be a number/);
  });

  test('detects invalid boolean type', () => {
    const env = { PORT: '3000', NODE_ENV: 'production', DEBUG: 'yes' };
    const result = auditEnv(env, baseSchema);
    expect(result.invalid).toContain('DEBUG');
    expect(result.errors['DEBUG']).toMatch(/must be a boolean/);
  });

  test('detects invalid URL type', () => {
    const env = { PORT: '3000', NODE_ENV: 'production', API_URL: 'not-a-url' };
    const result = auditEnv(env, baseSchema);
    expect(result.invalid).toContain('API_URL');
    expect(result.errors['API_URL']).toMatch(/must be a valid URL/);
  });

  test('detects pattern mismatch', () => {
    const env = { PORT: '3000', NODE_ENV: 'staging' };
    const result = auditEnv(env, baseSchema);
    expect(result.invalid).toContain('NODE_ENV');
    expect(result.errors['NODE_ENV']).toMatch(/does not match pattern/);
  });

  test('detects extra keys not in schema', () => {
    const env = { PORT: '3000', NODE_ENV: 'test', UNKNOWN_VAR: 'foo' };
    const result = auditEnv(env, baseSchema);
    expect(result.extra).toContain('UNKNOWN_VAR');
  });

  test('handles empty env object', () => {
    const result = auditEnv({}, baseSchema);
    expect(result.missing).toContain('PORT');
    expect(result.missing).toContain('NODE_ENV');
    expect(result.warnings).toContain('API_URL');
  });
});
