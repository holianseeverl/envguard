const fs = require('fs');
const os = require('os');
const path = require('path');
const { runMerge } = require('./cli-merge');

function writeTmp(name, content) {
  const fp = path.join(os.tmpdir(), name);
  fs.writeFileSync(fp, content, 'utf8');
  return fp;
}

describe('runMerge', () => {
  test('merges two files without conflicts', () => {
    const a = writeTmp('merge-a.env', 'FOO=foo\n');
    const b = writeTmp('merge-b.env', 'BAR=bar\n');
    const { merged, conflicts } = runMerge([a, b], { quiet: true });
    expect(merged.FOO).toBe('foo');
    expect(merged.BAR).toBe('bar');
    expect(Object.keys(conflicts)).toHaveLength(0);
  });

  test('later file overrides earlier file', () => {
    const a = writeTmp('merge-c.env', 'DB=postgres://base\n');
    const b = writeTmp('merge-d.env', 'DB=postgres://override\n');
    const { merged } = runMerge([a, b], { quiet: true });
    expect(merged.DB).toBe('postgres://override');
  });

  test('reports conflicts for differing values', () => {
    const a = writeTmp('merge-e.env', 'SECRET=abc\n');
    const b = writeTmp('merge-f.env', 'SECRET=xyz\n');
    const { conflicts } = runMerge([a, b], { quiet: true });
    expect(conflicts.SECRET).toBeDefined();
    expect(conflicts.SECRET).toHaveLength(2);
  });

  test('no conflict when same value appears in both files', () => {
    const a = writeTmp('merge-g.env', 'PORT=3000\n');
    const b = writeTmp('merge-h.env', 'PORT=3000\n');
    const { conflicts } = runMerge([a, b], { quiet: true });
    expect(conflicts).toEqual({});
  });

  test('masks sensitive keys when mask option is true', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const a = writeTmp('merge-i.env', 'API_SECRET=topsecret\n');
    runMerge([a], { quiet: true, mask: true });
    const output = spy.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(output).not.toContain('topsecret');
    spy.mockRestore();
  });

  test('throws when no file paths provided', () => {
    expect(() => runMerge([])).toThrow('merge requires at least one file path');
  });

  test('warns about conflicts when quiet is false', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    const a = writeTmp('merge-j.env', 'X=1\n');
    const b = writeTmp('merge-k.env', 'X=2\n');
    runMerge([a, b], { quiet: false });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    console.log.mockRestore();
  });
});
