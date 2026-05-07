/**
 * scorer.js — Score an .env file for quality/health based on schema compliance,
 * documentation, naming conventions, and value hygiene.
 */

'use strict';

const WEIGHTS = {
  schemaCompliance: 40,
  documentation: 20,
  namingConvention: 20,
  valueHygiene: 20,
};

/**
 * Score schema compliance: ratio of keys present vs required.
 * @param {object} env
 * @param {object} schema normalised schema map
 * @returns {number} 0-100
 */
function scoreSchemaCompliance(env, schema) {
  const required = Object.entries(schema).filter(([, s]) => s.required);
  if (required.length === 0) return 100;
  const present = required.filter(([k]) => env[k] !== undefined && env[k] !== '');
  return Math.round((present.length / required.length) * 100);
}

/**
 * Score documentation: ratio of keys that have a description in the schema.
 * @param {object} env
 * @param {object} schema
 * @returns {number} 0-100
 */
function scoreDocumentation(env, schema) {
  const keys = Object.keys(env);
  if (keys.length === 0) return 100;
  const documented = keys.filter((k) => schema[k] && schema[k].description);
  return Math.round((documented.length / keys.length) * 100);
}

/**
 * Score naming convention: UPPER_SNAKE_CASE compliance.
 * @param {object} env
 * @returns {number} 0-100
 */
function scoreNamingConvention(env) {
  const keys = Object.keys(env);
  if (keys.length === 0) return 100;
  const valid = keys.filter((k) => /^[A-Z][A-Z0-9_]*$/.test(k));
  return Math.round((valid.length / keys.length) * 100);
}

/**
 * Score value hygiene: penalise empty values, leading/trailing whitespace.
 * @param {object} env
 * @returns {number} 0-100
 */
function scoreValueHygiene(env) {
  const keys = Object.keys(env);
  if (keys.length === 0) return 100;
  const clean = keys.filter((k) => {
    const v = env[k];
    return v !== '' && v === v.trim();
  });
  return Math.round((clean.length / keys.length) * 100);
}

/**
 * Compute a weighted overall score and per-dimension breakdown.
 * @param {object} env
 * @param {object} schema normalised schema map (may be {})
 * @returns {{ total: number, breakdown: object }}
 */
function scoreEnv(env, schema = {}) {
  const breakdown = {
    schemaCompliance: scoreSchemaCompliance(env, schema),
    documentation: scoreDocumentation(env, schema),
    namingConvention: scoreNamingConvention(env),
    valueHygiene: scoreValueHygiene(env),
  };

  const total = Math.round(
    Object.entries(breakdown).reduce((sum, [dim, score]) => {
      return sum + (score * WEIGHTS[dim]) / 100;
    }, 0)
  );

  return { total, breakdown };
}

/**
 * Return a letter grade for a numeric score.
 * @param {number} score 0-100
 * @returns {string}
 */
function gradeScore(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

module.exports = { scoreEnv, gradeScore, scoreSchemaCompliance, scoreDocumentation, scoreNamingConvention, scoreValueHygiene };
