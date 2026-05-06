const { resolveKey, resolveEnv, resolveWithProvenance } = require('./resolver');

describe('resolveKey', () => {
  it('returns undefined when no sources define the key', () => {
    const result = resolveKey('FOO', [{ BAR: '1' }]);
    expect(result.value).toBeUndefined();
    expect(result.source).toBeNull();
  });

  it('returns value from single source', () => {
    const result = resolveKey('FOO', [{ FOO: 'hello' }]);
    expect(result.value).toBe('hello');
    expect(result.source).toBe(0);
  });

  it('later source wins over earlier', () => {
    const result = resolveKey('FOO', [{ FOO: 'base' }, { FOO: 'override' }]);
    expect(result.value).toBe('override');
    expect(result.source).toBe(1);
  });

  it('falls back to earlier source if later does not define key', () => {
    const result = resolveKey('FOO', [{ FOO: 'base' }, { BAR: 'other' }]);
    expect(result.value).toBe('base');
    expect(result.source).toBe(0);
  });
});

describe('resolveEnv', () => {
  it('returns empty object for empty sources', () => {
    expect(resolveEnv([])).toEqual({});
  });

  it('merges keys from all sources with correct priority', () => {
    const result = resolveEnv([
      { A: '1', B: '2' },
      { B: '99', C: '3' }
    ]);
    expect(result).toEqual({ A: '1', B: '99', C: '3' });
  });

  it('handles a single source', () => {
    expect(resolveEnv([{ X: 'x', Y: 'y' }])).toEqual({ X: 'x', Y: 'y' });
  });

  it('handles three sources with layered overrides', () => {
    const result = resolveEnv([
      { A: 'base-a', B: 'base-b' },
      { B: 'mid-b', C: 'mid-c' },
      { C: 'top-c', D: 'top-d' }
    ]);
    expect(result).toEqual({ A: 'base-a', B: 'mid-b', C: 'top-c', D: 'top-d' });
  });
});

describe('resolveWithProvenance', () => {
  it('returns provenance info for each key', () => {
    const result = resolveWithProvenance(
      [{ A: '1' }, { A: '2', B: 'b' }],
      ['.env', '.env.local']
    );
    expect(result.A).toEqual({ value: '2', sourceIndex: 1, label: '.env.local' });
    expect(result.B).toEqual({ value: 'b', sourceIndex: 1, label: '.env.local' });
  });

  it('uses default label when labels array is short', () => {
    const result = resolveWithProvenance([{ X: 'x' }, { Y: 'y' }], ['base']);
    expect(result.Y.label).toBe('source[1]');
  });

  it('returns empty object for no sources', () => {
    expect(resolveWithProvenance([])).toEqual({});
  });
});
