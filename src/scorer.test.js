'use strict';

const {
  scoreEnv,
  gradeScore,
  scoreSchemaCompliance,
  scoreDocumentation,
  scoreNamingConvention,
  scoreValueHygiene,
} = require('./scorer');

describe('scoreSchemaCompliance', () => {
  test('returns 100 when no required keys', () => {
    expect(scoreSchemaCompliance({}, {})).toBe(100);
  });

  test('returns 100 when all required keys present', () => {
    const schema = { PORT: { required: true }, HOST: { required: true } };
    expect(scoreSchemaCompliance({ PORT: '3000', HOST: 'localhost' }, schema)).toBe(100);
  });

  test('returns 50 when half of required keys missing', () => {
    const schema = { PORT: { required: true }, HOST: { required: true } };
    expect(scoreSchemaCompliance({ PORT: '3000' }, schema)).toBe(50);
  });

  test('treats empty string as missing', () => {
    const schema = { PORT: { required: true } };
    expect(scoreSchemaCompliance({ PORT: '' }, schema)).toBe(0);
  });
});

describe('scoreDocumentation', () => {
  test('returns 100 for empty env', () => {
    expect(scoreDocumentation({}, {})).toBe(100);
  });

  test('returns 100 when all keys documented', () => {
    const schema = { PORT: { description: 'app port' } };
    expect(scoreDocumentation({ PORT: '3000' }, schema)).toBe(100);
  });

  test('returns 0 when no keys documented', () => {
    expect(scoreDocumentation({ PORT: '3000' }, {})).toBe(0);
  });
});

describe('scoreNamingConvention', () => {
  test('returns 100 for empty env', () => {
    expect(scoreNamingConvention({})).toBe(100);
  });

  test('returns 100 for all UPPER_SNAKE_CASE keys', () => {
    expect(scoreNamingConvention({ APP_PORT: '3000', DB_HOST: 'localhost' })).toBe(100);
  });

  test('penalises lowercase keys', () => {
    expect(scoreNamingConvention({ port: '3000', APP_HOST: 'localhost' })).toBe(50);
  });
});

describe('scoreValueHygiene', () => {
  test('returns 100 for empty env', () => {
    expect(scoreValueHygiene({})).toBe(100);
  });

  test('penalises empty values', () => {
    expect(scoreValueHygiene({ PORT: '', HOST: 'localhost' })).toBe(50);
  });

  test('penalises values with leading/trailing whitespace', () => {
    expect(scoreValueHygiene({ PORT: ' 3000 ' })).toBe(0);
  });
});

describe('scoreEnv', () => {
  test('returns total and breakdown', () => {
    const result = scoreEnv({ APP_PORT: '3000' }, { APP_PORT: { required: true, description: 'port' } });
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('breakdown');
    expect(result.total).toBeGreaterThan(0);
  });

  test('perfect env scores 100', () => {
    const env = { APP_PORT: '3000' };
    const schema = { APP_PORT: { required: true, description: 'port' } };
    const { total } = scoreEnv(env, schema);
    expect(total).toBe(100);
  });
});

describe('gradeScore', () => {
  test.each([
    [95, 'A'],
    [80, 'B'],
    [65, 'C'],
    [45, 'D'],
    [20, 'F'],
  ])('score %i -> grade %s', (score, grade) => {
    expect(gradeScore(score)).toBe(grade);
  });
});
