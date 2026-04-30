/**
 * Schema definition parser and validator for envguard.
 * Defines the structure for env variable rules.
 */

const VALID_TYPES = ['string', 'number', 'boolean', 'url', 'email'];

/**
 * Validates a schema definition object.
 * @param {Object} schema - The schema to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateSchema(schema) {
  const errors = [];

  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return { valid: false, errors: ['Schema must be a plain object'] };
  }

  for (const [key, rule] of Object.entries(schema)) {
    if (typeof rule !== 'object' || Array.isArray(rule)) {
      errors.push(`[${key}] Rule must be an object`);
      continue;
    }

    if (rule.type && !VALID_TYPES.includes(rule.type)) {
      errors.push(`[${key}] Invalid type "${rule.type}". Must be one of: ${VALID_TYPES.join(', ')}`);
    }

    if (rule.required !== undefined && typeof rule.required !== 'boolean') {
      errors.push(`[${key}] "required" must be a boolean`);
    }

    if (rule.default !== undefined && rule.required === true) {
      errors.push(`[${key}] Cannot set both "required: true" and a "default" value`);
    }

    if (rule.pattern !== undefined && !(rule.pattern instanceof RegExp)) {
      errors.push(`[${key}] "pattern" must be a RegExp instance`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Normalizes a schema by filling in default rule values.
 * @param {Object} schema
 * @returns {Object}
 */
function normalizeSchema(schema) {
  const normalized = {};
  for (const [key, rule] of Object.entries(schema)) {
    normalized[key] = {
      type: 'string',
      required: true,
      ...rule,
    };
  }
  return normalized;
}

module.exports = { validateSchema, normalizeSchema, VALID_TYPES };
