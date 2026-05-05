const fs = require('fs');
const os = require('os');
const path = require('path');
const { saveSnapshot, loadSnapshot, compareSnapshot } = require('./snapshot');

function tmpFile(name) {
  return path.join(os.tmpdir(), `envguard-snap-${name}-${Date.now()}.json`);
}

describe('saveSnapshot', () => {
  it('writes a JSON file with keys and timestamp', () => {
    const env = { PORT: '3000', NODE_ENV: 'production' };
    const file = tmpFile('save');
    const snap = saveSnapshot(env, file);
    expect(fs.existsSync(file)).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(parsed.env).toEqual(env);
    expect(parsed.keys).toEqual(['NODE_ENV', 'PORT']);
    expect(parsed.timestamp).toBeDefined();
    fs.unlinkSync(file);
  });

  it('includes optional meta fields', () => {
    const env = { API_KEY: 'abc' };
    const file = tmpFile('meta');
    saveSnapshot(env, file, { label: 'v1.0' });
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(parsed.label).toBe('v1.0');
    fs.unlinkSync(file);
  });
});

describe('loadSnapshot', () => {
  it('loads a previously saved snapshot', () => {
    const env = { DB_URL: 'postgres://localhost/test' };
    const file = tmpFile('load');
    saveSnapshot(env, file);
    const snap = loadSnapshot(file);
    expect(snap.env).toEqual(env);
    fs.unlinkSync(file);
  });

  it('throws if snapshot file does not exist', () => {
    expect(() => loadSnapshot('/nonexistent/path.json')).toThrow('Snapshot not found');
  });
});

describe('compareSnapshot', () => {
  const baseSnapshot = {
    env: { PORT: '3000', NODE_ENV: 'production', DB_URL: 'postgres://old' },
  };

  it('detects added keys', () => {
    const current = { PORT: '3000', NODE_ENV: 'production', DB_URL: 'postgres://old', NEW_KEY: 'yes' };
    const result = compareSnapshot(current, baseSnapshot);
    expect(result.added).toEqual(['NEW_KEY']);
    expect(result.hasDrift).toBe(true);
  });

  it('detects removed keys', () => {
    const current = { PORT: '3000', NODE_ENV: 'production' };
    const result = compareSnapshot(current, baseSnapshot);
    expect(result.removed).toContain('DB_URL');
    expect(result.hasDrift).toBe(true);
  });

  it('detects changed values', () => {
    const current = { PORT: '4000', NODE_ENV: 'production', DB_URL: 'postgres://old' };
    const result = compareSnapshot(current, baseSnapshot);
    expect(result.changed).toContain('PORT');
    expect(result.hasDrift).toBe(true);
  });

  it('reports no drift when envs match', () => {
    const current = { PORT: '3000', NODE_ENV: 'production', DB_URL: 'postgres://old' };
    const result = compareSnapshot(current, baseSnapshot);
    expect(result.hasDrift).toBe(false);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.changed).toHaveLength(0);
  });
});
