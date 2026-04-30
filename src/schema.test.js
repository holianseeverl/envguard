const { validateSchema, normalizeSchema, VALID_TYPES } = require('./schema');

describe('validateSchema', () => {
  test('returns valid for a correct schema', () => {
    const schema = {
      PORT: { type: 'number', required: true },
      DATABASE_URL: { type: 'url', required: true },
      DEBUG: { type: 'boolean', required: false, default: 'false' },
    };
    const result = validateSchema(schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('returns error for non-object schema', () => {
    expect(validateSchema(null).valid).toBe(false);
    expect(validateSchema('string').valid).toBe(false);
    expect(validateSchema([]).valid).toBe(false);
  });

  test('returns error for invalid type', () => {
    const schema = { MY_VAR: { type: 'integer' } };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Invalid type/);
  });

  test('returns error when required is not boolean', () => {
    const schema = { MY_VAR: { required: 'yes' } };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/required.*boolean/);
  });

  test('returns error when required and default are both set', () => {
    const schema = { MY_VAR: { required: true, default: 'fallback' } };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/required.*default/);
  });

  test('returns error when pattern is not a RegExp', () => {
    const schema = { MY_VAR: { pattern: 'not-a-regex' } };
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/RegExp/);
  });
});

describe('normalizeSchema', () => {
  test('fills in default type and required', () => {
    const schema = { API_KEY: {} };
    const result = normalizeSchema(schema);
    expect(result.API_KEY.type).toBe('string');
    expect(result.API_KEY.required).toBe(true);
  });

  test('preserves explicitly set values', () => {
    const schema = { PORT: { type: 'number', required: false } };
    const result = normalizeSchema(schema);
    expect(result.PORT.type).toBe('number');
    expect(result.PORT.required).toBe(false);
  });
});

describe('VALID_TYPES', () => {
  test('exports expected types', () => {
    expect(VALID_TYPES).toEqual(expect.arrayContaining(['string', 'number', 'boolean', 'url', 'email']));
  });
});
