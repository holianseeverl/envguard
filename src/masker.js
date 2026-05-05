/**
 * masker.js
 * Masks sensitive environment variable values for safe logging/display.
 */

const DEFAULT_SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /passphrase/i,
];

/**
 * Determines if a key is considered sensitive.
 * @param {string} key
 * @param {string[]} [extraPatterns]
 * @returns {boolean}
 */
function isSensitiveKey(key, extraPatterns = []) {
  const allPatterns = [
    ...DEFAULT_SENSITIVE_PATTERNS,
    ...extraPatterns.map((p) => new RegExp(p, 'i')),
  ];
  return allPatterns.some((pattern) => pattern.test(key));
}

/**
 * Masks a single value.
 * @param {string} value
 * @param {object} [options]
 * @param {number} [options.visibleChars=0] - number of trailing chars to show
 * @param {string} [options.maskChar='*']
 * @returns {string}
 */
function maskValue(value, options = {}) {
  const { visibleChars = 0, maskChar = '*' } = options;
  if (!value || value.length === 0) return value;
  if (visibleChars <= 0) return maskChar.repeat(8);
  const visible = value.slice(-visibleChars);
  return maskChar.repeat(8 - visibleChars > 0 ? 8 - visibleChars : 4) + visible;
}

/**
 * Returns a copy of the env object with sensitive values masked.
 * @param {Record<string, string>} env
 * @param {object} [options]
 * @param {string[]} [options.extraPatterns]
 * @param {number} [options.visibleChars]
 * @param {string} [options.maskChar]
 * @returns {Record<string, string>}
 */
function maskEnv(env, options = {}) {
  const { extraPatterns = [], visibleChars = 0, maskChar = '*' } = options;
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = isSensitiveKey(key, extraPatterns)
      ? maskValue(value, { visibleChars, maskChar })
      : value;
  }
  return result;
}

module.exports = { isSensitiveKey, maskValue, maskEnv };
