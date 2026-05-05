const { interpolateValue, interpolateEnv } = require('./interpolator');

describe('interpolateValue', () => {
  const vars = { HOST: 'localhost', PORT: '5432', DB: 'mydb' };

  test('returns plain string unchanged', () => {
    expect(interpolateValue('hello', vars)).toBe('hello');
  });

  test('resolves ${VAR} syntax', () => {
    expect(interpolateValue('${HOST}:${PORT}', vars)).toBe('localhost:5432');
  });

  test('resolves $VAR syntax', () => {
    expect(interpolateValue('$HOST/$DB', vars)).toBe('localhost/mydb');
  });

  test('leaves unresolved reference intact', () => {
    expect(interpolateValue('${UNKNOWN}', vars)).toBe('${UNKNOWN}');
  });

  test('handles mixed resolved and unresolved', () => {
    expect(interpolateValue('${HOST}:${MISSING}', vars)).toBe('localhost:${MISSING}');
  });

  test('returns non-string values as-is', () => {
    expect(interpolateValue(42, vars)).toBe(42);
  });
});

describe('interpolateEnv', () => {
  test('resolves cross-references between keys', () => {
    const env = {
      HOST: 'localhost',
      PORT: '5432',
      DATABASE_URL: 'postgres://${HOST}:${PORT}/mydb',
    };
    const result = interpolateEnv(env);
    expect(result.DATABASE_URL).toBe('postgres://localhost:5432/mydb');
  });

  test('leaves unresolvable refs intact', () => {
    const env = { URL: 'http://${UNKNOWN_HOST}/path' };
    const result = interpolateEnv(env);
    expect(result.URL).toBe('http://${UNKNOWN_HOST}/path');
  });

  test('does not mutate the original env object', () => {
    const env = { A: 'hello', B: '$A world' };
    const result = interpolateEnv(env);
    expect(env.B).toBe('$A world');
    expect(result.B).toBe('hello world');
  });

  test('handles env with no references', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    expect(interpolateEnv(env)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });
});
