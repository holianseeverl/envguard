'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { runScore, parseArgs } = require('./cli-score');

function writeTmp(name, content) {
  const p = path.join(os.tmpdir(), `envguard-score-test-${name}`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('parseArgs', () => {
  test('parses envFile and schemaFile', () => {
    const args = parseArgs(['.env', 'schema.json']);
    expect(args.envFile).toBe('.env');
    expect(args.schemaFile).toBe('schema.json');
  });

  test('parses --format json', () => {
    const args = parseArgs(['.env', '--format', 'json']);
    expect(args.format).toBe('json');
  });

  test('parses --fail-below', () => {
    const args = parseArgs(['.env', '--fail-below', '80']);
    expect(args.failBelow).toBe(80);
  });
});

describe('runScore', () => {
  let envFile;
  let schemaFile;

  beforeAll(() => {
    envFile = writeTmp('.env', 'APP_PORT=3000\nDB_HOST=localhost\n');
    schemaFile = writeTmp('schema.json', JSON.stringify({
      APP_PORT: { required: true, description: 'app port' },
      DB_HOST: { required: true, description: 'database host' },
    }));
  });

  test('runs without error for valid env and schema', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    expect(() => runScore([envFile, schemaFile])).not.toThrow();
    spy.mockRestore();
  });

  test('outputs json when --format json', () => {
    const logs = [];
    const spy = jest.spyOn(console, 'log').mockImplementation((m) => logs.push(m));
    runScore([envFile, schemaFile, '--format', 'json']);
    spy.mockRestore();
    const parsed = JSON.parse(logs.join(''));
    expect(parsed).toHaveProperty('total');
    expect(parsed).toHaveProperty('grade');
  });

  test('exits 1 when score below --fail-below threshold', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const badEnv = writeTmp('.env-bad', 'port=\n');
    expect(() => runScore([badEnv, '--fail-below', '90'])).toThrow('exit');
    expect(exit).toHaveBeenCalledWith(1);
    spy.mockRestore();
    exit.mockRestore();
  });

  test('exits 1 when no envFile provided', () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => runScore([])).toThrow('exit');
    expect(exit).toHaveBeenCalledWith(1);
    errSpy.mockRestore();
    exit.mockRestore();
  });
});
