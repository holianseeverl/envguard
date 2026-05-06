const { sortAlpha, sortByPrefix, sortBySchema, sortEnv } = require('./sorter');

describe('sortAlpha', () => {
  test('sorts keys alphabetically', () => {
    const env = { ZEBRA: '1', APPLE: '2', MANGO: '3' };
    const result = sortAlpha(env);
    expect(Object.keys(result)).toEqual(['APPLE', 'MANGO', 'ZEBRA']);
  });

  test('preserves values', () => {
    const env = { B: 'bee', A: 'ay' };
    expect(sortAlpha(env)).toEqual({ A: 'ay', B: 'bee' });
  });

  test('handles empty object', () => {
    expect(sortAlpha({})).toEqual({});
  });
});

describe('sortByPrefix', () => {
  test('groups by prefix then sorts within group', () => {
    const env = { DB_PORT: '5432', APP_NAME: 'test', DB_HOST: 'localhost', APP_ENV: 'prod' };
    const keys = Object.keys(sortByPrefix(env));
    expect(keys.indexOf('APP_ENV')).toBeLessThan(keys.indexOf('APP_NAME'));
    expect(keys.indexOf('DB_HOST')).toBeLessThan(keys.indexOf('DB_PORT'));
    expect(keys.indexOf('APP_NAME')).toBeLessThan(keys.indexOf('DB_HOST'));
  });

  test('handles keys without underscore', () => {
    const env = { PORT: '3000', HOST: 'localhost' };
    const keys = Object.keys(sortByPrefix(env));
    expect(keys).toEqual(['HOST', 'PORT']);
  });
});

describe('sortBySchema', () => {
  const schema = { PORT: {}, HOST: {}, DEBUG: {} };

  test('orders env keys to match schema order', () => {
    const env = { DEBUG: 'true', HOST: 'localhost', PORT: '3000' };
    const keys = Object.keys(sortBySchema(env, schema));
    expect(keys).toEqual(['PORT', 'HOST', 'DEBUG']);
  });

  test('appends extra keys not in schema at end', () => {
    const env = { EXTRA: 'x', PORT: '3000', HOST: 'h' };
    const keys = Object.keys(sortBySchema(env, schema));
    expect(keys[keys.length - 1]).toBe('EXTRA');
  });

  test('skips schema keys missing from env', () => {
    const env = { PORT: '3000' };
    const keys = Object.keys(sortBySchema(env, schema));
    expect(keys).toEqual(['PORT']);
  });
});

describe('sortEnv', () => {
  test('dispatches to alpha by default', () => {
    const env = { Z: '1', A: '2' };
    expect(Object.keys(sortEnv(env))).toEqual(['A', 'Z']);
  });

  test('dispatches to prefix strategy', () => {
    const env = { DB_X: '1', APP_Y: '2' };
    const keys = Object.keys(sortEnv(env, 'prefix'));
    expect(keys[0]).toBe('APP_Y');
  });

  test('dispatches to schema strategy', () => {
    const schema = { B: {}, A: {} };
    const env = { A: '1', B: '2' };
    expect(Object.keys(sortEnv(env, 'schema', schema))).toEqual(['B', 'A']);
  });

  test('throws on unknown strategy', () => {
    expect(() => sortEnv({}, 'random')).toThrow('Unknown sort strategy');
  });
});
