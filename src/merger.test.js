const { mergeEnvs, mergeEnvsWithSources } = require('./merger');

describe('mergeEnvs', () => {
  test('merges two non-overlapping envs', () => {
    const a = { FOO: 'foo' };
    const b = { BAR: 'bar' };
    const { merged, conflicts } = mergeEnvs(a, b);
    expect(merged).toEqual({ FOO: 'foo', BAR: 'bar' });
    expect(conflicts).toEqual({});
  });

  test('later source wins on conflict', () => {
    const a = { FOO: 'original' };
    const b = { FOO: 'override' };
    const { merged } = mergeEnvs(a, b);
    expect(merged.FOO).toBe('override');
  });

  test('records conflicts correctly', () => {
    const a = { FOO: 'v1' };
    const b = { FOO: 'v2' };
    const { conflicts } = mergeEnvs(a, b);
    expect(conflicts.FOO).toEqual(['v1', 'v2']);
  });

  test('no conflict when values are identical', () => {
    const a = { FOO: 'same' };
    const b = { FOO: 'same' };
    const { conflicts } = mergeEnvs(a, b);
    expect(conflicts).toEqual({});
  });

  test('handles three sources with chained conflicts', () => {
    const a = { X: '1' };
    const b = { X: '2' };
    const c = { X: '3' };
    const { merged, conflicts } = mergeEnvs(a, b, c);
    expect(merged.X).toBe('3');
    expect(conflicts.X).toEqual(['1', '2', '3']);
  });

  test('skips null or undefined sources gracefully', () => {
    const a = { FOO: 'bar' };
    const { merged } = mergeEnvs(a, null, undefined);
    expect(merged).toEqual({ FOO: 'bar' });
  });
});

describe('mergeEnvsWithSources', () => {
  test('tracks which source each key came from', () => {
    const sources = [
      { name: '.env', env: { FOO: 'foo' } },
      { name: '.env.local', env: { BAR: 'bar' } }
    ];
    const { merged, sources: keySource } = mergeEnvsWithSources(sources);
    expect(merged).toEqual({ FOO: 'foo', BAR: 'bar' });
    expect(keySource.FOO).toBe('.env');
    expect(keySource.BAR).toBe('.env.local');
  });

  test('conflict entries include source names', () => {
    const sources = [
      { name: 'base', env: { DB_URL: 'postgres://base' } },
      { name: 'local', env: { DB_URL: 'postgres://local' } }
    ];
    const { conflicts } = mergeEnvsWithSources(sources);
    expect(conflicts.DB_URL).toHaveLength(2);
    expect(conflicts.DB_URL[0].source).toBe('base');
    expect(conflicts.DB_URL[1].source).toBe('local');
  });

  test('last source wins in merged output', () => {
    const sources = [
      { name: 'a', env: { KEY: 'first' } },
      { name: 'b', env: { KEY: 'last' } }
    ];
    const { merged } = mergeEnvsWithSources(sources);
    expect(merged.KEY).toBe('last');
  });
});
