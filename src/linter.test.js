const { lintEnvString, LINT_RULES } = require('./linter');

describe('lintEnvString', () => {
  test('returns no issues for clean env', () => {
    const input = 'PORT=3000\nDB_HOST=localhost\nAPI_KEY="secret"\n';
    expect(lintEnvString(input)).toEqual([]);
  });

  test('detects spaces around equals', () => {
    const issues = lintEnvString('PORT = 3000\n');
    expect(issues.some(i => i.rule === LINT_RULES.NO_SPACES_AROUND_EQUALS)).toBe(true);
  });

  test('detects lowercase keys', () => {
    const issues = lintEnvString('port=3000\n');
    expect(issues.some(i => i.rule === LINT_RULES.UPPERCASE_KEYS)).toBe(true);
  });

  test('allows uppercase keys without issue', () => {
    const issues = lintEnvString('PORT=3000\n');
    expect(issues.some(i => i.rule === LINT_RULES.UPPERCASE_KEYS)).toBe(false);
  });

  test('detects duplicate keys', () => {
    const issues = lintEnvString('PORT=3000\nPORT=4000\n');
    expect(issues.some(i => i.rule === LINT_RULES.NO_DUPLICATE_KEYS)).toBe(true);
  });

  test('detects inline comments', () => {
    const issues = lintEnvString('PORT=3000 # web port\n');
    expect(issues.some(i => i.rule === LINT_RULES.NO_INLINE_COMMENTS)).toBe(true);
  });

  test('no inline comment issue for quoted values', () => {
    const issues = lintEnvString('MSG="hello # world"\n');
    expect(issues.some(i => i.rule === LINT_RULES.NO_INLINE_COMMENTS)).toBe(false);
  });

  test('detects empty value without quotes', () => {
    const issues = lintEnvString('API_KEY=\n');
    expect(issues.some(i => i.rule === LINT_RULES.NO_EMPTY_VALUE_WITHOUT_QUOTES)).toBe(true);
  });

  test('no empty value issue when using empty quotes', () => {
    const issues = lintEnvString('API_KEY=""\n');
    expect(issues.some(i => i.rule === LINT_RULES.NO_EMPTY_VALUE_WITHOUT_QUOTES)).toBe(false);
  });

  test('detects leading whitespace on line', () => {
    const issues = lintEnvString('  PORT=3000\n');
    expect(issues.some(i => i.rule === LINT_RULES.NO_LEADING_TRAILING_WHITESPACE)).toBe(true);
  });

  test('skips comment lines', () => {
    const issues = lintEnvString('# this is a comment\nPORT=3000\n');
    expect(issues).toEqual([]);
  });

  test('skips blank lines', () => {
    const issues = lintEnvString('\nPORT=3000\n');
    expect(issues).toEqual([]);
  });

  test('reports correct line numbers', () => {
    const issues = lintEnvString('PORT=3000\ndb_host=localhost\n');
    const lcIssue = issues.find(i => i.rule === LINT_RULES.UPPERCASE_KEYS);
    expect(lcIssue.line).toBe(2);
  });

  test('multiple issues on same line', () => {
    const issues = lintEnvString('port = \n');
    const rules = issues.map(i => i.rule);
    expect(rules).toContain(LINT_RULES.UPPERCASE_KEYS);
    expect(rules).toContain(LINT_RULES.NO_SPACES_AROUND_EQUALS);
  });
});
