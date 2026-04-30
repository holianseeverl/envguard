const { normalizeSchema } = require('./schema');

const VALIDATORS = {
  string: (value) => typeof value === 'string',
  number: (value) => !isNaN(Number(value)) && value !== '',
  boolean: (value) => value === 'true' || value === 'false',
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
};

function validateEnv(env, schema) {
  const normalized = normalizeSchema(schema);
  const errors = [];
  const warnings = [];

  for (const [key, rules] of Object.entries(normalized)) {
    const value = env[key];
    const isDefined = value !== undefined && value !== '';

    if (!isDefined) {
      if (rules.required) {
        errors.push({ key, message: `Missing required variable: ${key}` });
      } else if (rules.default === undefined) {
        warnings.push({ key, message: `Optional variable not set: ${key}` });
      }
      continue;
    }

    if (rules.type && VALIDATORS[rules.type]) {
      if (!VALIDATORS[rules.type](value)) {
        errors.push({
          key,
          message: `Invalid type for ${key}: expected ${rules.type}, got "${value}"`,
        });
      }
    }

    if (rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        errors.push({
          key,
          message: `Value for ${key} does not match pattern ${rules.pattern}`,
        });
      }
    }

    if (rules.allowedValues && !rules.allowedValues.includes(value)) {
      errors.push({
        key,
        message: `Invalid value for ${key}: "${value}" is not one of [${rules.allowedValues.join(', ')}]`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = { validateEnv, VALIDATORS };
