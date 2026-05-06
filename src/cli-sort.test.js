const fs = require('fs');
const os = require('os');
const path = require('path');
const { runSort } = require('./cli-sort');

function writeTmp(content, ext = '.env') {
  const file = path.join(os.tmpdir(), `envguard-sort-test-${Date.now()}${ext}`);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

describe('runSort', () => {
  let stdout;
  beforeEach(() => {
    stdout = '';
    jest.spyOn(process.stdout, 'write').mockImplementation(s => { stdout += s; });
  });
  afterEach(() => jest.restoreAllMocks());

  test('sorts alphabetically by default and writes to stdout', () => {
    const f = writeTmp('ZEBRA=1\nAPPLE=2\nMANGO=3\n');
    runSort([f]);
    const lines = stdout.trim().split('\n').map(l => l.split('=')[0]);
    expect(lines).toEqual(['APPLE', 'MANGO', 'ZEBRA']);
  });

  test('sorts by prefix strategy', () => {
    const f = writeTmp('DB_PORT=5432\nAPP_NAME=test\nDB_HOST=localhost\n');
    runSort([f, '--strategy', 'prefix']);
    const lines = stdout.trim().split('\n').map(l => l.split('=')[0]);
    expect(lines.indexOf('APP_NAME')).toBeLessThan(lines.indexOf('DB_HOST'));
  });

  test('sorts by schema strategy', () => {
    const envFile = writeTmp('A=1\nB=2\nC=3\n');
    const schemaFile = writeTmp(JSON.stringify({ C: { required: true }, B: {}, A: {} }), '.json');
    runSort([envFile, '--strategy', 'schema', '--schema', schemaFile]);
    const lines = stdout.trim().split('\n').map(l => l.split('=')[0]);
    expect(lines).toEqual(['C', 'B', 'A']);
  });

  test('writes output to file when --output is given', () => {
    const envFile = writeTmp('Z=1\nA=2\n');
    const outFile = path.join(os.tmpdir(), `envguard-sort-out-${Date.now()}.env`);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    runSort([envFile, '--output', outFile]);
    const content = fs.readFileSync(outFile, 'utf8');
    const lines = content.trim().split('\n').map(l => l.split('=')[0]);
    expect(lines).toEqual(['A', 'Z']);
    consoleSpy.mockRestore();
    fs.unlinkSync(outFile);
  });

  test('exits with error when no file given', () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => runSort([])).toThrow('exit');
    errSpy.mockRestore();
    exitSpy.mockRestore();
  });

  test('exits with error when schema strategy used without --schema', () => {
    const envFile = writeTmp('A=1\n');
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => runSort([envFile, '--strategy', 'schema'])).toThrow('exit');
    errSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
