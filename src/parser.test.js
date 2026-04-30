const { parseEnvString, parseEnvFile } = require('./parser');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('parseEnvString', () => {
  test('parses simple key=value pairs', () => {
    const result = parseEnvString('FOO=bar\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  test('ignores blank lines', () => {
    const result = parseEnvString('\nFOO=bar\n\nBAZ=qux\n');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  test('ignores comment lines', () => {
    const result = parseEnvString('# this is a comment\nFOO=bar');
    expect(result).toEqual({ FOO: 'bar' });
  });

  test('strips inline comments', () => {
    const result = parseEnvString('FOO=bar # inline comment');
    expect(result).toEqual({ FOO: 'bar' });
  });

  test('strips double-quoted values', () => {
    const result = parseEnvString('FOO="hello world"');
    expect(result).toEqual({ FOO: 'hello world' });
  });

  test('strips single-quoted values', () => {
    const result = parseEnvString("FOO='hello world'");
    expect(result).toEqual({ FOO: 'hello world' });
  });

  test('preserves inline comment inside quoted value', () => {
    const result = parseEnvString('FOO="bar # not a comment"');
    expect(result).toEqual({ FOO: 'bar # not a comment' });
  });

  test('handles empty values', () => {
    const result = parseEnvString('FOO=');
    expect(result).toEqual({ FOO: '' });
  });

  test('skips lines without equals sign', () => {
    const result = parseEnvString('NODOMAIN\nFOO=bar');
    expect(result).toEqual({ FOO: 'bar' });
  });

  test('handles CRLF line endings', () => {
    const result = parseEnvString('FOO=bar\r\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });
});

describe('parseEnvFile', () => {
  let tmpFile;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `.env.test.${Date.now()}`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  test('reads and parses a real file', () => {
    fs.writeFileSync(tmpFile, 'PORT=3000\nNODE_ENV=test\n', 'utf8');
    const result = parseEnvFile(tmpFile);
    expect(result).toEqual({ PORT: '3000', NODE_ENV: 'test' });
  });

  test('throws if file does not exist', () => {
    expect(() => parseEnvFile('/nonexistent/.env')).toThrow('envguard: file not found');
  });
});
