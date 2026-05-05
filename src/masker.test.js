const { isSensitiveKey, maskValue, maskEnv } = require('./masker');

describe('isSensitiveKey', () => {
  test('detects password keys', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('user_password')).toBe(true);
  });

  test('detects token keys', () => {
    expect(isSensitiveKey('ACCESS_TOKEN')).toBe(true);
    expect(isSensitiveKey('github_token')).toBe(true);
  });

  test('detects api key variants', () => {
    expect(isSensitiveKey('API_KEY')).toBe(true);
    expect(isSensitiveKey('APIKEY')).toBe(true);
    expect(isSensitiveKey('STRIPE_API_KEY')).toBe(true);
  });

  test('does not flag non-sensitive keys', () => {
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
    expect(isSensitiveKey('APP_NAME')).toBe(false);
  });

  test('supports extra patterns', () => {
    expect(isSensitiveKey('MY_PIN', ['pin'])).toBe(true);
    expect(isSensitiveKey('REGION', ['pin'])).toBe(false);
  });
});

describe('maskValue', () => {
  test('masks value with default options', () => {
    expect(maskValue('supersecret')).toBe('********');
  });

  test('masks empty string as-is', () => {
    expect(maskValue('')).toBe('');
  });

  test('shows trailing visible chars', () => {
    const result = maskValue('abcdefgh', { visibleChars: 3 });
    expect(result).toContain('fgh');
    expect(result.startsWith('*')).toBe(true);
  });

  test('supports custom mask char', () => {
    expect(maskValue('secret', { maskChar: '#' })).toBe('########');
  });
});

describe('maskEnv', () => {
  const env = {
    PORT: '3000',
    NODE_ENV: 'production',
    DB_PASSWORD: 'hunter2',
    API_KEY: 'abc123xyz',
    APP_NAME: 'envguard',
  };

  test('masks sensitive keys and leaves others intact', () => {
    const masked = maskEnv(env);
    expect(masked.PORT).toBe('3000');
    expect(masked.NODE_ENV).toBe('production');
    expect(masked.APP_NAME).toBe('envguard');
    expect(masked.DB_PASSWORD).toBe('********');
    expect(masked.API_KEY).toBe('********');
  });

  test('applies extra patterns', () => {
    const masked = maskEnv({ MY_PIN: '1234', PORT: '8080' }, { extraPatterns: ['pin'] });
    expect(masked.MY_PIN).toBe('********');
    expect(masked.PORT).toBe('8080');
  });

  test('does not mutate original env object', () => {
    const original = { DB_PASSWORD: 'secret' };
    maskEnv(original);
    expect(original.DB_PASSWORD).toBe('secret');
  });
});
