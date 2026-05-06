const { compareEnvs, summariseChanges, filterChanges } = require('./comparator');

describe('compareEnvs', () => {
  const base = { HOST: 'localhost', PORT: '3000', DEBUG: 'true' };
  const head = { HOST: 'example.com', PORT: '3000', LOG_LEVEL: 'info' };

  test('detects added keys', () => {
    const changes = compareEnvs(base, head);
    const added = changes.filter(c => c.status === 'added');
    expect(added).toHaveLength(1);
    expect(added[0].key).toBe('LOG_LEVEL');
    expect(added[0].headValue).toBe('info');
    expect(added[0].baseValue).toBeUndefined();
  });

  test('detects removed keys', () => {
    const changes = compareEnvs(base, head);
    const removed = changes.filter(c => c.status === 'removed');
    expect(removed).toHaveLength(1);
    expect(removed[0].key).toBe('DEBUG');
    expect(removed[0].baseValue).toBe('true');
  });

  test('detects changed keys', () => {
    const changes = compareEnvs(base, head);
    const changed = changes.filter(c => c.status === 'changed');
    expect(changed).toHaveLength(1);
    expect(changed[0].key).toBe('HOST');
    expect(changed[0].baseValue).toBe('localhost');
    expect(changed[0].headValue).toBe('example.com');
  });

  test('detects unchanged keys', () => {
    const changes = compareEnvs(base, head);
    const unchanged = changes.filter(c => c.status === 'unchanged');
    expect(unchanged).toHaveLength(1);
    expect(unchanged[0].key).toBe('PORT');
  });

  test('returns results sorted alphabetically', () => {
    const changes = compareEnvs(base, head);
    const keys = changes.map(c => c.key);
    expect(keys).toEqual([...keys].sort());
  });

  test('handles empty base', () => {
    const changes = compareEnvs({}, { A: '1' });
    expect(changes).toHaveLength(1);
    expect(changes[0].status).toBe('added');
  });

  test('handles empty head', () => {
    const changes = compareEnvs({ A: '1' }, {});
    expect(changes[0].status).toBe('removed');
  });

  test('handles identical envs', () => {
    const changes = compareEnvs({ A: '1' }, { A: '1' });
    expect(changes[0].status).toBe('unchanged');
  });
});

describe('summariseChanges', () => {
  test('counts all statuses', () => {
    const changes = compareEnvs(
      { HOST: 'localhost', PORT: '3000', DEBUG: 'true' },
      { HOST: 'example.com', PORT: '3000', LOG_LEVEL: 'info' }
    );
    const summary = summariseChanges(changes);
    expect(summary.added).toBe(1);
    expect(summary.removed).toBe(1);
    expect(summary.changed).toBe(1);
    expect(summary.unchanged).toBe(1);
  });
});

describe('filterChanges', () => {
  const changes = [
    { key: 'A', status: 'added' },
    { key: 'B', status: 'removed' },
    { key: 'C', status: 'unchanged' },
  ];

  test('filters by single status', () => {
    expect(filterChanges(changes, 'added')).toHaveLength(1);
  });

  test('filters by multiple statuses', () => {
    expect(filterChanges(changes, ['added', 'removed'])).toHaveLength(2);
  });

  test('returns empty array when no match', () => {
    expect(filterChanges(changes, 'changed')).toHaveLength(0);
  });
});
