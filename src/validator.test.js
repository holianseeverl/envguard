const { validateEnv, VALIDATORS } = require('./validator');

describe('VALIDATORS', () => {
  test('string validator accepts any string', () => {
    expect(VALIDATORS.string('hello')).toBe(true);
    expect(VALIDATORS.string('')).toBe(true);
  });

  test('number validator accepts numeric strings', () => {
    expect(VALIDATORS.number('42')).toBe(true);
    expect(VALIDATORS.number('3.14')).toBe(true);
    expect(VALIDATORS.number('abc')).toBe(false);
    expect(VALIDATORS.number('')).toBe(false);
  });

  test('boolean validator accepts true/false strings', () => {
    expect(VALIDATORS.boolean('true')).toBe(true);
    expect(VALIDATORS.boolean('false')).toBe(true);
    expect(VALIDATORS.boolean('yes')).toBe(false);
  });

  test('url validator accepts valid URLs', () => {
    expect(VALIDATORS.url('https://example.com')).toBe(true);
    expect(VALIDATORS.url('not-a-url')).toBe(false);
  });

  test('email validator accepts valid emails', () => {
    expect(VALIDATORS.email('user@example.com')).toBe(true);
    expect(VALIDATORS.email('invalid-email')).toBe(false);
  });
});

describe('validateEnv', () => {
  const schema = {
    PORT: { type: 'number', required: true },
    NODE_ENV: { type: 'string', required: true, allowedValues: ['development', 'production', 'test'] },
    API_URL: { type: 'url', required: false },
    DEBUG: { type: 'boolean', required: false, default: 'false' },
  };

  test('returns valid when all required vars are present and correct', () => {
    const env = { PORT: '3000', NODE_ENV: 'production' };
    const result = validateEnv(env, schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('reports error for missing required variable', () => {
    const env = { NODE_ENV: 'production' };
    const result = validateEnv(env, schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].key).toBe('PORT');
  });

  test('reports error for invalid type', () => {
    const env = { PORT: 'not-a-number', NODE_ENV: 'production' };
    const result = validateEnv(env, schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('Invalid type for PORT');
  });

  test('reports error for disallowed value', () => {
    const env = { PORT: '3000', NODE_ENV: 'staging' };
    const result = validateEnv(env, schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('not one of');
  });

  test('adds warning for optional unset variable without default', () => {
    const env = { PORT: '3000', NODE_ENV: 'development' };
    const result = validateEnv(env, schema);
    expect(result.warnings.some((w) => w.key === 'API_URL')).toBe(true);
  });
});
