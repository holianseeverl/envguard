const { renameKeys, renameKeysWith, transforms } = require('./renamer');

describe('renameKeys', () => {
  const env = { DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'myapp' };

  test('renames keys according to map', () => {
    const result = renameKeys(env, { DB_HOST: 'DATABASE_HOST', DB_PORT: 'DATABASE_PORT' });
    expect(result).toEqual({
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: '5432',
      APP_NAME: 'myapp',
    });
  });

  test('leaves unmapped keys unchanged by default', () => {
    const result = renameKeys(env, { DB_HOST: 'DATABASE_HOST' });
    expect(result.DB_PORT).toBe('5432');
    expect(result.APP_NAME).toBe('myapp');
  });

  test('drops unmapped keys when dropUnmapped is true', () => {
    const result = renameKeys(env, { DB_HOST: 'DATABASE_HOST' }, { dropUnmapped: true });
    expect(result).toEqual({ DATABASE_HOST: 'localhost' });
  });

  test('throws in strict mode when key has no mapping', () => {
    expect(() => renameKeys(env, { DB_HOST: 'DATABASE_HOST' }, { strict: true })).toThrow(
      'No mapping defined for key "DB_PORT" in strict mode'
    );
  });

  test('throws when map target is empty string', () => {
    expect(() => renameKeys(env, { DB_HOST: '' })).toThrow('Invalid mapping');
  });

  test('returns empty object for empty env', () => {
    expect(renameKeys({}, { DB_HOST: 'X' })).toEqual({});
  });
});

describe('renameKeysWith', () => {
  const env = { db_host: 'localhost', db_port: '5432' };

  test('applies transform function to all keys', () => {
    const result = renameKeysWith(env, transforms.toUpper);
    expect(result).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  test('toLower transform', () => {
    const upper = { DB_HOST: 'localhost' };
    expect(renameKeysWith(upper, transforms.toLower)).toEqual({ db_host: 'localhost' });
  });

  test('addPrefix transform', () => {
    const result = renameKeysWith(env, transforms.addPrefix('APP_'));
    expect(result).toEqual({ APP_db_host: 'localhost', APP_db_port: '5432' });
  });

  test('removePrefix transform strips prefix', () => {
    const prefixed = { APP_HOST: 'localhost', APP_PORT: '80', OTHER: 'x' };
    const result = renameKeysWith(prefixed, transforms.removePrefix('APP_'));
    expect(result).toEqual({ HOST: 'localhost', PORT: '80', OTHER: 'x' });
  });

  test('addSuffix transform', () => {
    const result = renameKeysWith({ HOST: 'localhost' }, transforms.addSuffix('_VAR'));
    expect(result).toEqual({ HOST_VAR: 'localhost' });
  });

  test('throws when fn is not a function', () => {
    expect(() => renameKeysWith(env, 'toUpper')).toThrow(TypeError);
  });

  test('throws when transform returns empty string', () => {
    expect(() => renameKeysWith(env, () => '')).toThrow('Transform function returned invalid key');
  });
});
