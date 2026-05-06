const { groupByPrefix, groupByClassifier, flattenGroups } = require('./grouper');

describe('groupByPrefix', () => {
  const env = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    APP_NAME: 'envguard',
    APP_ENV: 'production',
    SECRET: 'abc123',
  };

  test('groups variables by underscore prefix', () => {
    const result = groupByPrefix(env);
    expect(result['DB']).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(result['APP']).toEqual({ APP_NAME: 'envguard', APP_ENV: 'production' });
    expect(result['__ungrouped__']).toEqual({ SECRET: 'abc123' });
  });

  test('uses custom separator', () => {
    const dotEnv = { 'DB.HOST': 'localhost', 'APP.NAME': 'envguard', PLAIN: 'val' };
    const result = groupByPrefix(dotEnv, '.');
    expect(result['DB']).toEqual({ 'DB.HOST': 'localhost' });
    expect(result['APP']).toEqual({ 'APP.NAME': 'envguard' });
    expect(result['__ungrouped__']).toEqual({ PLAIN: 'val' });
  });

  test('returns empty object for empty env', () => {
    expect(groupByPrefix({})).toEqual({});
  });
});

describe('groupByClassifier', () => {
  const env = { DB_HOST: 'localhost', PORT: '3000', SECRET_KEY: 'xyz', LOG_LEVEL: 'info' };

  test('groups by custom classifier', () => {
    const classifier = (key) => key.startsWith('DB') ? 'database' : 'other';
    const result = groupByClassifier(env, classifier);
    expect(result['database']).toEqual({ DB_HOST: 'localhost' });
    expect(Object.keys(result['other'])).toHaveLength(3);
  });

  test('places unclassified keys in __ungrouped__', () => {
    const classifier = () => null;
    const result = groupByClassifier(env, classifier);
    expect(result['__ungrouped__']).toEqual(env);
  });

  test('throws if classifier is not a function', () => {
    expect(() => groupByClassifier(env, 'not-a-fn')).toThrow('classifier must be a function');
  });
});

describe('flattenGroups', () => {
  test('flattens grouped env back to flat', () => {
    const grouped = {
      DB: { DB_HOST: 'localhost', DB_PORT: '5432' },
      APP: { APP_NAME: 'envguard' },
    };
    expect(flattenGroups(grouped)).toEqual({
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      APP_NAME: 'envguard',
    });
  });

  test('returns empty object for empty groups', () => {
    expect(flattenGroups({})).toEqual({});
  });

  test('last group wins on key conflict', () => {
    const grouped = { A: { KEY: 'first' }, B: { KEY: 'second' } };
    expect(flattenGroups(grouped).KEY).toBe('second');
  });
});
