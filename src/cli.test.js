'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function writeTmp(dir, name, content) {
  const p = path.join(dir, name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('cli', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envguard-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('validate passes with valid env', () => {
    writeTmp(tmpDir, '.env', 'PORT=3000\nNODE_ENV=production\n');
    writeTmp(tmpDir, '.env.schema.json', JSON.stringify({
      PORT: { required: true, type: 'number' },
      NODE_ENV: { required: true, type: 'string' },
    }));
    const result = execSync(
      `node ${path.resolve(__dirname, 'cli.js')} validate --env .env --schema .env.schema.json`,
      { cwd: tmpDir }
    );
    expect(result.toString()).toMatch(/valid|ok|pass/i);
  });

  test('validate exits with code 1 on missing required var', () => {
    writeTmp(tmpDir, '.env', 'PORT=3000\n');
    writeTmp(tmpDir, '.env.schema.json', JSON.stringify({
      PORT: { required: true },
      SECRET: { required: true },
    }));
    expect(() => {
      execSync(
        `node ${path.resolve(__dirname, 'cli.js')} validate --env .env --schema .env.schema.json`,
        { cwd: tmpDir }
      );
    }).toThrow();
  });

  test('diff command prints missing keys', () => {
    writeTmp(tmpDir, '.env', 'PORT=3000\n');
    writeTmp(tmpDir, '.env.schema.json', JSON.stringify({
      PORT: { required: true },
      DB_URL: { required: true },
    }));
    let output = '';
    try {
      execSync(
        `node ${path.resolve(__dirname, 'cli.js')} diff --env .env --schema .env.schema.json`,
        { cwd: tmpDir }
      );
    } catch (e) {
      output = e.stdout ? e.stdout.toString() : '';
    }
    expect(output).toMatch(/DB_URL/);
  });

  test('--help prints usage info', () => {
    const result = execSync(`node ${path.resolve(__dirname, 'cli.js')} --help`);
    expect(result.toString()).toMatch(/envguard/);
    expect(result.toString()).toMatch(/validate/);
  });

  test('exits with error when env file missing', () => {
    writeTmp(tmpDir, '.env.schema.json', JSON.stringify({ PORT: { required: true } }));
    expect(() => {
      execSync(
        `node ${path.resolve(__dirname, 'cli.js')} validate --env .env --schema .env.schema.json`,
        { cwd: tmpDir }
      );
    }).toThrow();
  });
});
