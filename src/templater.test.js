const { generateTemplate } = require('./templater');

const schema = {
  PORT: {
    type: 'number',
    required: true,
    default: 3000,
    description: 'HTTP server port',
    example: 8080,
  },
  DATABASE_URL: {
    type: 'string',
    required: true,
    description: 'Postgres connection string',
  },
  DEBUG: {
    type: 'boolean',
    required: false,
    default: false,
  },
};

describe('generateTemplate', () => {
  test('includes keys for all schema entries', () => {
    const out = generateTemplate(schema, { includeComments: false });
    expect(out).toContain('PORT=3000');
    expect(out).toContain('DATABASE_URL=');
    expect(out).toContain('DEBUG=false');
  });

  test('includes description comments', () => {
    const out = generateTemplate(schema);
    expect(out).toContain('# HTTP server port');
    expect(out).toContain('# Postgres connection string');
  });

  test('includes meta comments with type and required', () => {
    const out = generateTemplate(schema);
    expect(out).toContain('type: number');
    expect(out).toContain('required');
  });

  test('includes example in meta comment', () => {
    const out = generateTemplate(schema);
    expect(out).toContain('example: 8080');
  });

  test('omits comments when includeComments is false', () => {
    const out = generateTemplate(schema, { includeComments: false });
    expect(out).not.toContain('#');
  });

  test('omits defaults when includeDefaults is false', () => {
    const out = generateTemplate(schema, { includeComments: false, includeDefaults: false });
    expect(out).toContain('PORT=');
    expect(out).not.toContain('PORT=3000');
  });

  test('omits missing keys when includeMissing is false', () => {
    const out = generateTemplate(schema, {
      includeComments: false,
      includeDefaults: true,
      includeMissing: false,
    });
    expect(out).toContain('PORT=3000');
    expect(out).not.toContain('DATABASE_URL=');
  });

  test('returns empty string for empty schema', () => {
    const out = generateTemplate({});
    expect(out).toBe('');
  });
});
