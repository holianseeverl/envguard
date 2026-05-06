/**
 * sanitizer.js
 * Sanitizes env values by trimming whitespace, removing control characters,
 * and optionally enforcing max length or allowed character patterns.
 */

/**
 * Trim whitespace and remove control characters from a single value.
 * @param {string} value
 * @returns {string}
 */
function sanitizeValue(value) {
  if (typeof value !== 'string') return value;
  // Remove control characters (except tab/newline which may be intentional in some envs)
  return value.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Truncate a value to a maximum length.
 * @param {string} value
 * @param {number} maxLength
 * @returns {string}
 */
function truncateValue(value, maxLength) {
  if (typeof value !== 'string') return value;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

/**
 * Sanitize all values in an env object.
 * @param {Record<string, string>} env
 * @param {object} [options]
 * @param {number} [options.maxLength] - Max allowed length per value
 * @param {boolean} [options.collapseWhitespace] - Replace internal runs of whitespace with single space
 * @returns {{ env: Record<string, string>, warnings: string[] }}
 */
function sanitizeEnv(env, options = {}) {
  const { maxLength, collapseWhitespace = false } = options;
  const result = {};
  const warnings = [];

  for (const [key, raw] of Object.entries(env)) {
    let value = sanitizeValue(raw);

    if (collapseWhitespace) {
      value = value.replace(/\s+/g, ' ');
    }

    if (maxLength !== undefined && typeof value === 'string' && value.length > maxLength) {
      warnings.push(`${key}: value truncated from ${value.length} to ${maxLength} characters`);
      value = truncateValue(value, maxLength);
    }

    if (typeof raw === 'string' && raw !== value && !warnings.some(w => w.startsWith(key + ':'))) {
      warnings.push(`${key}: value was sanitized`);
    }

    result[key] = value;
  }

  return { env: result, warnings };
}

module.exports = { sanitizeValue, truncateValue, sanitizeEnv };
