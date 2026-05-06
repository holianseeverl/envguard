const fs = require('fs');
const os = require('os');
const path = require('path');
const { runCompare } = require('./cli-compare');

function writeTmp(content) {
  const file = path.join(os.tmpdir(), `envguard-cmp-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

describe('runCompare', () => {
  let logs, errors;

  beforeEach(() => {
    logs = [];
    errors = [];
    jest.spyOn(console, 'log').mockImplementation((...a) => logs.push(a.join(' ')));
    jest.spyOn(console, 'error').mockImplementation((...a) => errors.push(a.join(' ')));
    process.exitCode = 0;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('prints help with no args', () => {
    runCompare([]);
    expect(logs.some(l => l.includes('Usage'))).toBe(true);
  });

  test('errors when only one file given', () => {
    const f = writeTmp('A=1');
    runCompare([f]);
    expect(errors.some(e => e.includes('two file paths'))).toBe(true);
    expect(process.exitCode).toBe(1);
  });

  test('errors on missing file', () => {
    runCompare(['/no/such/file.env', '/no/other.env']);
    expect(errors.some(e => e.includes('Error reading file'))).toBe(true);
    expect(process.exitCode).toBe(1);
  });

  test('shows added, removed, changed keys', () => {
    const base = writeTmp('HOST=localhost\nPORT=3000\nDEBUG=true');
    const head = writeTmp('HOST=example.com\nPORT=3000\nLOG_LEVEL=info');
    runCompare([base, head]);
    expect(logs.some(l => l.includes('+ LOG_LEVEL'))).toBe(true);
    expect(logs.some(l => l.includes('- DEBUG'))).toBe(true);
    expect(logs.some(l => l.includes('~ HOST'))).toBe(true);
    expect(logs.some(l => l.includes('Summary'))).toBe(true);
  });

  test('--summary flag suppresses per-key output', () => {
    const base = writeTmp('A=1');
    const head = writeTmp('A=2');
    runCompare([base, head, '--summary']);
    expect(logs.every(l => !l.startsWith('~'))).toBe(true);
    expect(logs.some(l => l.includes('Summary'))).toBe(true);
  });

  test('--no-unchanged hides unchanged keys', () => {
    const base = writeTmp('A=1\nB=2');
    const head = writeTmp('A=1\nB=3');
    runCompare([base, head, '--no-unchanged']);
    const unchanged = logs.filter(l => l.startsWith('  A='));
    expect(unchanged).toHaveLength(0);
  });

  test('--only added shows only added', () => {
    const base = writeTmp('A=1');
    const head = writeTmp('A=1\nB=2');
    runCompare([base, head, '--only', 'added']);
    expect(logs.some(l => l.includes('+ B=2'))).toBe(true);
    expect(logs.filter(l => l.startsWith(' ')).length).toBe(0);
  });

  test('--mask masks sensitive values', () => {
    const base = writeTmp('SECRET=mysecret');
    const head = writeTmp('SECRET=newsecret');
    runCompare([base, head, '--mask']);
    expect(logs.some(l => l.includes('mysecret'))).toBe(false);
  });
});
