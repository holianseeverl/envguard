/**
 * redactor.js
 * Redacts sensitive values from env objects for safe logging/output.
 * Goes beyond masking — replaces values with configurable placeholders
 * and supports pattern-based redaction rules.
 */

const { isSensitiveKey } = require('./masker');

const DEFAULT_PLACEHOLDER = '[REDACTED]';

/**
 * Redact a single value based on key sensitivity or custom patterns.
 * @param {string} key
 * @param {string} value
 * @param {object} options
 * @returns {string}
 */
function redactValue(key, value, options = {}) {
  const {
    placeholder = DEFAULT_PLACEHOLDER,
    patterns = [],
    extraSensitiveKeys = [],
  } = options;

  const allSensitiveKeys = [...extraSensitiveKeys];

  if (isSensitiveKey(key) || allSensitiveKeys.some(k => k.toLowerCase() === key.toLowerCase())) {
    return placeholder;
  }

  for (const pattern of patterns) {
    const re = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    if (re.test(value)) {
      return placeholder;
    }
  }

  return value;
}

/**
 * Redact all sensitive values in an env object.
 * @param {object} env - key/value pairs
 * @param {object} options
 * @returns {object}
 */
function redactEnv(env, options = {}) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = redactValue(key, value, options);
  }
  return result;
}

/**
 * Produce a redaction report: which keys were redacted.
 * @param {object} env
 * @param {object} options
 * @returns {{ redacted: string[], env: object }}
 */
function redactWithReport(env, options = {}) {
  const redacted = [];
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    const redactedValue = redactValue(key, value, options);
    result[key] = redactedValue;
    if (redactedValue !== value) {
      redacted.push(key);
    }
  }
  return { redacted, env: result };
}

module.exports = { redactValue, redactEnv, redactWithReport };
