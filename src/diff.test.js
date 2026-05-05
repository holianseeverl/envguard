const { diffEnvs, diffEnvAgainstSchema } = require('./diff');

describe('diffEnvs', () => {
  const base = { HOST: 'localhost', PORT: '3000', DEBUG: 'false' };
  const target = { HOST: 'example.com', PORT: '3000', NEW_KEY: 'hello' };

  test('detects added keys', () => {
    const { added } = diffEnvs(base, target);
    expect(added).toEqual([{ key: 'NEW_KEY', value: 'hello' }]);
  });

  test('detects removed keys', () => {
    const { removed } = diffEnvs(base, target);
    expect(removed).toEqual([{ key: 'DEBUG', value: 'false' }]);
  });

  test('detects changed keys', () => {
    const { changed } = diffEnvs(base, target);
    expect(changed).toEqual([{ key: 'HOST', from: 'localhost', to: 'example.com' }]);
  });

  test('detects unchanged keys', () => {
    const { unchanged } = diffEnvs(base, target);
    expect(unchanged).toEqual([{ key: 'PORT' }]);
  });

  test('returns empty arrays when envs are identical', () => {
    const result = diffEnvs(base, base);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.changed).toHaveLength(0);
    expect(result.unchanged).toHaveLength(3);
  });

  test('handles empty base', () => {
    const result = diffEnvs({}, { A: '1' });
    expect(result.added).toEqual([{ key: 'A', value: '1' }]);
  });
});

describe('diffEnvAgainstSchema', () => {
  const schema = {
    DATABASE_URL: { required: true, type: 'string' },
    PORT: { required: false, type: 'number' },
    SECRET: { required: true, type: 'string' },
  };

  const env = {
    DATABASE_URL: 'postgres://localhost/db',
    EXTRA_KEY: 'not-in-schema',
  };

  test('finds keys missing in env', () => {
    const { missingInEnv } = diffEnvAgainstSchema(schema, env);
    const missingKeys = missingInEnv.map((m) => m.key);
    expect(missingKeys).toContain('PORT');
    expect(missingKeys).toContain('SECRET');
    expect(missingKeys).not.toContain('DATABASE_URL');
  });

  test('finds keys undeclared in schema', () => {
    const { undeclaredInSchema } = diffEnvAgainstSchema(schema, env);
    expect(undeclaredInSchema).toEqual([{ key: 'EXTRA_KEY', value: 'not-in-schema' }]);
  });

  test('returns empty arrays when env matches schema exactly', () => {
    const fullEnv = { DATABASE_URL: 'x', PORT: '8080', SECRET: 'abc' };
    const result = diffEnvAgainstSchema(schema, fullEnv);
    expect(result.missingInEnv).toHaveLength(0);
    expect(result.undeclaredInSchema).toHaveLength(0);
  });
});
