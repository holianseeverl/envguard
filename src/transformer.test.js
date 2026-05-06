const { applyTransformer, transformEnv } = require('./transformer');

describe('applyTransformer', () => {
  test('trim removes whitespace', () => {
    expect(applyTransformer('  hello  ', 'trim')).toBe('hello');
  });

  test('lowercase converts to lower', () => {
    expect(applyTransformer('HELLO', 'lowercase')).toBe('hello');
  });

  test('uppercase converts to upper', () => {
    expect(applyTransformer('hello', 'uppercase')).toBe('HELLO');
  });

  test('int parses integer string', () => {
    expect(applyTransformer('42', 'int')).toBe(42);
  });

  test('int throws on non-numeric', () => {
    expect(() => applyTransformer('abc', 'int')).toThrow('Cannot convert');
  });

  test('float parses float string', () => {
    expect(applyTransformer('3.14', 'float')).toBeCloseTo(3.14);
  });

  test('bool parses true values', () => {
    expect(applyTransformer('true', 'bool')).toBe(true);
    expect(applyTransformer('1', 'bool')).toBe(true);
    expect(applyTransformer('yes', 'bool')).toBe(true);
  });

  test('bool parses false values', () => {
    expect(applyTransformer('false', 'bool')).toBe(false);
    expect(applyTransformer('0', 'bool')).toBe(false);
  });

  test('bool throws on invalid value', () => {
    expect(() => applyTransformer('maybe', 'bool')).toThrow('Cannot convert');
  });

  test('json parses valid JSON', () => {
    expect(applyTransformer('{"a":1}', 'json')).toEqual({ a: 1 });
  });

  test('json throws on invalid JSON', () => {
    expect(() => applyTransformer('{bad}', 'json')).toThrow('Cannot parse');
  });

  test('throws on unknown transformer', () => {
    expect(() => applyTransformer('x', 'base64decode')).toThrow('Unknown transformer');
  });
});

describe('transformEnv', () => {
  test('applies single transform per key', () => {
    const env = { PORT: '8080', NAME: '  api  ' };
    const schema = { PORT: { transform: 'int' }, NAME: { transform: 'trim' } };
    const { result, errors } = transformEnv(env, schema);
    expect(result.PORT).toBe(8080);
    expect(result.NAME).toBe('api');
    expect(errors).toHaveLength(0);
  });

  test('applies chained transforms', () => {
    const env = { LABEL: '  Hello World  ' };
    const schema = { LABEL: { transform: ['trim', 'uppercase'] } };
    const { result } = transformEnv(env, schema);
    expect(result.LABEL).toBe('HELLO WORLD');
  });

  test('skips keys not in env', () => {
    const env = {};
    const schema = { MISSING: { transform: 'int' } };
    const { result, errors } = transformEnv(env, schema);
    expect(result).not.toHaveProperty('MISSING');
    expect(errors).toHaveLength(0);
  });

  test('collects errors without throwing', () => {
    const env = { COUNT: 'not-a-number' };
    const schema = { COUNT: { transform: 'int' } };
    const { errors } = transformEnv(env, schema);
    expect(errors).toHaveLength(1);
    expect(errors[0].key).toBe('COUNT');
  });

  test('skips keys with no transform defined', () => {
    const env = { FOO: 'bar' };
    const schema = { FOO: { required: true } };
    const { result } = transformEnv(env, schema);
    expect(result.FOO).toBe('bar');
  });
});
