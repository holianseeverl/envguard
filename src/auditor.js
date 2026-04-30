/**
 * auditor.js
 * Audits a parsed env object against a normalized schema,
 * returning structured results for each variable.
 */

/**
 * @typedef {Object} AuditResult
 * @property {string[]} missing   - Required keys not present in env
 * @property {string[]} invalid   - Keys present but failing type/pattern checks
 * @property {string[]} extra     - Keys in env not defined in schema
 * @property {string[]} warnings  - Optional keys missing or deprecated notes
 * @property {Record<string, string>} errors - key -> human-readable error message
 */

/**
 * Audit an env object against a normalized schema.
 *
 * @param {Record<string, string>} env - Parsed env key/value pairs
 * @param {Record<string, import('./schema').NormalizedField>} schema - Normalized schema
 * @returns {AuditResult}
 */
function auditEnv(env, schema) {
  const missing = [];
  const invalid = [];
  const extra = [];
  const warnings = [];
  const errors = {};

  // Check schema-defined keys
  for (const [key, field] of Object.entries(schema)) {
    const value = env[key];

    if (value === undefined || value === '') {
      if (field.required) {
        missing.push(key);
        errors[key] = `Missing required variable "${key}"`;
      } else {
        warnings.push(key);
      }
      continue;
    }

    // Type validation
    const typeError = checkType(key, value, field.type);
    if (typeError) {
      invalid.push(key);
      errors[key] = typeError;
      continue;
    }

    // Pattern validation
    if (field.pattern) {
      const re = new RegExp(field.pattern);
      if (!re.test(value)) {
        invalid.push(key);
        errors[key] = `"${key}" does not match pattern ${field.pattern}`;
      }
    }
  }

  // Check for extra keys not in schema
  for (const key of Object.keys(env)) {
    if (!schema[key]) {
      extra.push(key);
    }
  }

  return { missing, invalid, extra, warnings, errors };
}

function checkType(key, value, type) {
  switch (type) {
    case 'number':
      if (isNaN(Number(value))) return `"${key}" must be a number, got "${value}"`;
      break;
    case 'boolean':
      if (!['true', 'false', '1', '0'].includes(value.toLowerCase()))
        return `"${key}" must be a boolean (true/false), got "${value}"`;
      break;
    case 'url':
      try { new URL(value); } catch {
        return `"${key}" must be a valid URL, got "${value}"`;
      }
      break;
    // 'string' is always valid
  }
  return null;
}

module.exports = { auditEnv };
