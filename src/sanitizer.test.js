const { sanitizeValue, truncateValue, sanitizeEnv } = require('./sanitizer');

describe('sanitizeValue', () => {
  test('trims leading and trailing whitespace', () => {
    expect(sanitizeValue('  hello  ')).toBe('hello');
  });

  test('removes control characters', () => {
    expect(sanitizeValue('hel\x01lo')).toBe('hello');
    expect(sanitizeValue('\x00start')).toBe('start');
  });

  test('preserves normal strings unchanged', () => {
    expect(sanitizeValue('hello world')).toBe('hello world');
  });

  test('returns non-string values as-is', () => {
    expect(sanitizeValue(42)).toBe(42);
    expect(sanitizeValue(null)).toBe(null);
  });

  test('handles empty string', () => {
    expect(sanitizeValue('')).toBe('');
  });
});

describe('truncateValue', () => {
  test('truncates value exceeding maxLength', () => {
    expect(truncateValue('abcdef', 3)).toBe('abc');
  });

  test('leaves value unchanged if within maxLength', () => {
    expect(truncateValue('abc', 10)).toBe('abc');
  });

  test('returns non-string values as-is', () => {
    expect(truncateValue(123, 5)).toBe(123);
  });
});

describe('sanitizeEnv', () => {
  test('sanitizes all values in env object', () => {
    const env = { FOO: '  bar  ', BAZ: 'clean' };
    const { env: result } = sanitizeEnv(env);
    expect(result.FOO).toBe('bar');
    expect(result.BAZ).toBe('clean');
  });

  test('reports warnings for sanitized values', () => {
    const env = { KEY: '  padded  ' };
    const { warnings } = sanitizeEnv(env);
    expect(warnings).toContain('KEY: value was sanitized');
  });

  test('truncates values when maxLength is set', () => {
    const env = { TOKEN: 'supersecretlongtoken' };
    const { env: result, warnings } = sanitizeEnv(env, { maxLength: 5 });
    expect(result.TOKEN).toBe('super');
    expect(warnings.some(w => w.includes('truncated'))).toBe(true);
  });

  test('collapses internal whitespace when option is set', () => {
    const env = { MSG: 'hello   world' };
    const { env: result } = sanitizeEnv(env, { collapseWhitespace: true });
    expect(result.MSG).toBe('hello world');
  });

  test('returns no warnings for already clean env', () => {
    const env = { A: 'foo', B: 'bar' };
    const { warnings } = sanitizeEnv(env);
    expect(warnings).toHaveLength(0);
  });

  test('handles empty env object', () => {
    const { env: result, warnings } = sanitizeEnv({});
    expect(result).toEqual({});
    expect(warnings).toHaveLength(0);
  });
});
