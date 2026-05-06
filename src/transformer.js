/**
 * transformer.js
 * Transform env values using built-in or custom transformers.
 */

const BUILT_IN = {
  trim: (v) => v.trim(),
  lowercase: (v) => v.toLowerCase(),
  uppercase: (v) => v.toUpperCase(),
  int: (v) => {
    const n = parseInt(v, 10);
    if (isNaN(n)) throw new Error(`Cannot convert "${v}" to int`);
    return n;
  },
  float: (v) => {
    const n = parseFloat(v);
    if (isNaN(n)) throw new Error(`Cannot convert "${v}" to float`);
    return n;
  },
  bool: (v) => {
    if (['true', '1', 'yes'].includes(v.toLowerCase())) return true;
    if (['false', '0', 'no'].includes(v.toLowerCase())) return false;
    throw new Error(`Cannot convert "${v}" to bool`);
  },
  json: (v) => {
    try {
      return JSON.parse(v);
    } catch {
      throw new Error(`Cannot parse "${v}" as JSON`);
    }
  },
};

/**
 * Apply a single named transformer to a value.
 * @param {string} value
 * @param {string} transformerName
 * @returns {*}
 */
function applyTransformer(value, transformerName) {
  const fn = BUILT_IN[transformerName];
  if (!fn) throw new Error(`Unknown transformer: "${transformerName}"`);
  return fn(value);
}

/**
 * Transform an env object according to a schema that may specify
 * a `transform` field per key (string or array of strings).
 *
 * @param {Record<string, string>} env
 * @param {Record<string, {transform?: string|string[]}>} schema
 * @returns {{ result: Record<string, *>, errors: {key: string, message: string}[] }}
 */
function transformEnv(env, schema) {
  const result = { ...env };
  const errors = [];

  for (const [key, def] of Object.entries(schema)) {
    if (!def.transform) continue;
    if (!(key in env)) continue;

    const transforms = Array.isArray(def.transform)
      ? def.transform
      : [def.transform];

    let value = env[key];
    try {
      for (const t of transforms) {
        value = applyTransformer(String(value), t);
      }
      result[key] = value;
    } catch (err) {
      errors.push({ key, message: err.message });
    }
  }

  return { result, errors };
}

module.exports = { applyTransformer, transformEnv, BUILT_IN };
