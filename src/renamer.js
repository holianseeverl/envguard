/**
 * renamer.js — rename keys in an env object using a mapping or transform function
 */

/**
 * Rename keys in an env object using a static map.
 * Keys not in the map are left unchanged unless `strict` is true.
 * @param {Record<string,string>} env
 * @param {Record<string,string>} map - { OLD_KEY: 'NEW_KEY' }
 * @param {{ strict?: boolean, dropUnmapped?: boolean }} options
 * @returns {Record<string,string>}
 */
function renameKeys(env, map, options = {}) {
  const { strict = false, dropUnmapped = false } = options;
  const result = {};

  for (const [key, value] of Object.entries(env)) {
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      const newKey = map[key];
      if (!newKey || typeof newKey !== 'string') {
        throw new Error(`Invalid mapping for key "${key}": target must be a non-empty string`);
      }
      result[newKey] = value;
    } else if (strict) {
      throw new Error(`No mapping defined for key "${key}" in strict mode`);
    } else if (!dropUnmapped) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Rename keys using a transform function applied to every key.
 * @param {Record<string,string>} env
 * @param {(key: string) => string} fn
 * @returns {Record<string,string>}
 */
function renameKeysWith(env, fn) {
  if (typeof fn !== 'function') {
    throw new TypeError('renameKeysWith: second argument must be a function');
  }
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    const newKey = fn(key);
    if (!newKey || typeof newKey !== 'string') {
      throw new Error(`Transform function returned invalid key for "${key}"`);
    }
    result[newKey] = value;
  }
  return result;
}

/**
 * Built-in transform helpers.
 */
const transforms = {
  toUpper: (k) => k.toUpperCase(),
  toLower: (k) => k.toLowerCase(),
  addPrefix: (prefix) => (k) => `${prefix}${k}`,
  removePrefix: (prefix) => (k) => k.startsWith(prefix) ? k.slice(prefix.length) : k,
  addSuffix: (suffix) => (k) => `${k}${suffix}`,
};

module.exports = { renameKeys, renameKeysWith, transforms };
