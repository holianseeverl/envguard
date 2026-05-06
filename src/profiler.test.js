const { profileEnv, formatProfile } = require('./profiler');

const sampleEnv = {
  APP_NAME: 'myapp',
  APP_PORT: '3000',
  APP_SECRET: 'abc123',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_PASS: '',
  EMPTY_VAR: '',
};

const sampleRaw = `# App config
APP_NAME=myapp
APP_PORT=3000
APP_SECRET=abc123

# DB config
DB_HOST=localhost
DB_PORT=5432
DB_PASS=
EMPTY_VAR=
`;

describe('profileEnv', () => {
  test('counts total variables', () => {
    const stats = profileEnv(sampleEnv, sampleRaw);
    expect(stats.total).toBe(7);
  });

  test('counts set vs empty variables', () => {
    const stats = profileEnv(sampleEnv, sampleRaw);
    expect(stats.set).toBe(5);
    expect(stats.empty).toBe(2);
  });

  test('lists empty keys', () => {
    const stats = profileEnv(sampleEnv, sampleRaw);
    expect(stats.emptyKeys).toContain('DB_PASS');
    expect(stats.emptyKeys).toContain('EMPTY_VAR');
  });

  test('counts comment and blank lines', () => {
    const stats = profileEnv(sampleEnv, sampleRaw);
    expect(stats.commentLines).toBe(2);
    expect(stats.blankLines).toBeGreaterThanOrEqual(1);
  });

  test('computes average value length', () => {
    const stats = profileEnv(sampleEnv, sampleRaw);
    expect(stats.avgValueLength).toBeGreaterThanOrEqual(0);
  });

  test('identifies longest key', () => {
    const stats = profileEnv(sampleEnv, sampleRaw);
    expect(stats.longestKey).toBe('APP_SECRET');
  });

  test('returns top prefixes', () => {
    const stats = profileEnv(sampleEnv, sampleRaw);
    const prefixNames = stats.topPrefixes.map(p => p.prefix);
    expect(prefixNames).toContain('APP');
    expect(prefixNames).toContain('DB');
  });

  test('handles empty env', () => {
    const stats = profileEnv({}, '');
    expect(stats.total).toBe(0);
    expect(stats.set).toBe(0);
    expect(stats.avgValueLength).toBe(0);
    expect(stats.longestKey).toBe('');
  });
});

describe('formatProfile', () => {
  test('returns a non-empty string', () => {
    const stats = profileEnv(sampleEnv, sampleRaw);
    const output = formatProfile(stats);
    expect(typeof output).toBe('string');
    expect(output.length).toBeGreaterThan(0);
  });

  test('includes total count in output', () => {
    const stats = profileEnv(sampleEnv, sampleRaw);
    const output = formatProfile(stats);
    expect(output).toMatch(/Total variables/);
    expect(output).toMatch(/7/);
  });

  test('lists empty keys when present', () => {
    const stats = profileEnv(sampleEnv, sampleRaw);
    const output = formatProfile(stats);
    expect(output).toMatch(/DB_PASS/);
  });

  test('shows top prefixes', () => {
    const stats = profileEnv(sampleEnv, sampleRaw);
    const output = formatProfile(stats);
    expect(output).toMatch(/APP_\*/);
  });
});
