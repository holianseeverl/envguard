const fs = require('fs');
const os = require('os');
const path = require('path');
const { runSnapshot } = require('./cli-snapshot');

function writeTmp(name, content) {
  const file = path.join(os.tmpdir(), `envguard-clisnap-${name}-${Date.now()}`);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

describe('cli-snapshot save', () => {
  it('saves a snapshot file from a .env', () => {
    const envFile = writeTmp('env', 'PORT=3000\nNODE_ENV=production\n');
    const snapFile = envFile + '.snap.json';
    const origLog = console.log;
    const logs = [];
    console.log = (...a) => logs.push(a.join(' '));
    runSnapshot(['node', 'cli-snapshot.js', 'save', '--env', envFile, '--snapshot', snapFile]);
    console.log = origLog;
    expect(fs.existsSync(snapFile)).toBe(true);
    const snap = JSON.parse(fs.readFileSync(snapFile, 'utf8'));
    expect(snap.env.PORT).toBe('3000');
    expect(logs[0]).toMatch(/Snapshot saved/);
    fs.unlinkSync(envFile);
    fs.unlinkSync(snapFile);
  });

  it('includes label in snapshot when provided', () => {
    const envFile = writeTmp('env2', 'API=x\n');
    const snapFile = envFile + '.snap.json';
    runSnapshot(['node', 'cli-snapshot.js', 'save', '--env', envFile, '--snapshot', snapFile, '--label', 'release-1']);
    const snap = JSON.parse(fs.readFileSync(snapFile, 'utf8'));
    expect(snap.label).toBe('release-1');
    fs.unlinkSync(envFile);
    fs.unlinkSync(snapFile);
  });
});

describe('cli-snapshot compare', () => {
  it('exits cleanly when no drift', () => {
    const envFile = writeTmp('nodrift', 'PORT=3000\n');
    const snapFile = envFile + '.snap.json';
    runSnapshot(['node', 'cli-snapshot.js', 'save', '--env', envFile, '--snapshot', snapFile]);
    const origCode = process.exitCode;
    process.exitCode = 0;
    const logs = [];
    const origLog = console.log;
    console.log = (...a) => logs.push(a.join(' '));
    runSnapshot(['node', 'cli-snapshot.js', 'compare', '--env', envFile, '--snapshot', snapFile]);
    console.log = origLog;
    expect(process.exitCode).toBe(0);
    expect(logs.some(l => l.includes('No drift'))).toBe(true);
    fs.unlinkSync(envFile);
    fs.unlinkSync(snapFile);
  });

  it('sets exitCode 1 when drift is detected', () => {
    const envFile = writeTmp('drift', 'PORT=3000\n');
    const snapFile = envFile + '.snap.json';
    runSnapshot(['node', 'cli-snapshot.js', 'save', '--env', envFile, '--snapshot', snapFile]);
    const newEnvFile = writeTmp('drift2', 'PORT=4000\nNEW_VAR=yes\n');
    process.exitCode = 0;
    runSnapshot(['node', 'cli-snapshot.js', 'compare', '--env', newEnvFile, '--snapshot', snapFile]);
    expect(process.exitCode).toBe(1);
    fs.unlinkSync(envFile);
    fs.unlinkSync(newEnvFile);
    fs.unlinkSync(snapFile);
  });

  it('handles unknown command gracefully', () => {
    process.exitCode = 0;
    const origErr = console.error;
    console.error = () => {};
    runSnapshot(['node', 'cli-snapshot.js', 'unknown']);
    console.error = origErr;
    expect(process.exitCode).toBe(1);
  });
});
