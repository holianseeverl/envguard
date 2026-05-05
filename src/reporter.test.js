const { formatResult, formatDiff } = require('./reporter');

describe('formatResult', () => {
  test('returns success message when valid', () => {
    const result = formatResult({ valid: true, errors: [] });
    expect(result).toContain('✅');
    expect(result).toContain('valid');
  });

  test('returns failure message with errors listed', () => {
    const result = formatResult({
      valid: false,
      errors: ['PORT is required', 'SECRET must be a string'],
    });
    expect(result).toContain('❌');
    expect(result).toContain('PORT is required');
    expect(result).toContain('SECRET must be a string');
  });

  test('bullet-points each error', () => {
    const result = formatResult({ valid: false, errors: ['ERR_A', 'ERR_B'] });
    const lines = result.split('\n');
    const bullets = lines.filter((l) => l.trim().startsWith('•'));
    expect(bullets).toHaveLength(2);
  });
});

describe('formatDiff', () => {
  test('shows no differences message for empty diff', () => {
    const result = formatDiff({});
    expect(result).toContain('No differences');
  });

  test('formats added keys', () => {
    const result = formatDiff({ added: [{ key: 'NEW_VAR', value: 'hello' }] });
    expect(result).toContain('Added');
    expect(result).toContain('+ NEW_VAR=hello');
  });

  test('formats removed keys', () => {
    const result = formatDiff({ removed: [{ key: 'OLD_VAR', value: 'bye' }] });
    expect(result).toContain('Removed');
    expect(result).toContain('- OLD_VAR=bye');
  });

  test('formats changed keys', () => {
    const result = formatDiff({
      changed: [{ key: 'HOST', from: 'localhost', to: 'prod.example.com' }],
    });
    expect(result).toContain('Changed');
    expect(result).toContain('HOST');
    expect(result).toContain('localhost');
    expect(result).toContain('prod.example.com');
  });

  test('formats missing in env', () => {
    const result = formatDiff({
      missingInEnv: [{ key: 'SECRET', rule: { required: true } }],
    });
    expect(result).toContain('Missing in env');
    expect(result).toContain('SECRET');
  });

  test('formats undeclared in schema', () => {
    const result = formatDiff({
      undeclaredInSchema: [{ key: 'MYSTERY', value: '42' }],
    });
    expect(result).toContain('Undeclared in schema');
    expect(result).toContain('MYSTERY=42');
  });

  test('handles a combined diff correctly', () => {
    const result = formatDiff({
      added: [{ key: 'A', value: '1' }],
      removed: [{ key: 'B', value: '2' }],
    });
    expect(result).toContain('Added');
    expect(result).toContain('Removed');
  });
});
