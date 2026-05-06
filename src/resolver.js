/**
 * resolver.js — Resolves env variable values from multiple sources with priority ordering.
 * Sources are applied left-to-right, with later sources taking precedence.
 */

/**
 * Resolve a single key from an ordered list of env maps.
 * Returns the value from the highest-priority source that defines the key.
 * @param {string} key
 * @param {Object[]} sources - array of env objects, ascending priority
 * @returns {{ value: string|undefined, source: number|null }}
 */
function resolveKey(key, sources) {
  let value;
  let source = null;
  for (let i = 0; i < sources.length; i++) {
    if (Object.prototype.hasOwnProperty.call(sources[i], key)) {
      value = sources[i][key];
      source = i;
    }
  }
  return { value, source };
}

/**
 * Resolve all keys across multiple env sources.
 * @param {Object[]} sources - array of env objects, ascending priority
 * @returns {Object} resolved env map
 */
function resolveEnv(sources) {
  if (!Array.isArray(sources) || sources.length === 0) return {};
  const allKeys = new Set(sources.flatMap(s => Object.keys(s)));
  const resolved = {};
  for (const key of allKeys) {
    const { value } = resolveKey(key, sources);
    if (value !== undefined) resolved[key] = value;
  }
  return resolved;
}

/**
 * Resolve env with provenance — returns each key's value and which source index it came from.
 * @param {Object[]} sources
 * @param {string[]} [labels] - optional labels for each source
 * @returns {Object} map of key -> { value, sourceIndex, label }
 */
function resolveWithProvenance(sources, labels = []) {
  if (!Array.isArray(sources) || sources.length === 0) return {};
  const allKeys = new Set(sources.flatMap(s => Object.keys(s)));
  const result = {};
  for (const key of allKeys) {
    const { value, source } = resolveKey(key, sources);
    result[key] = {
      value,
      sourceIndex: source,
      label: source !== null ? (labels[source] ?? `source[${source}]`) : null
    };
  }
  return result;
}

module.exports = { resolveKey, resolveEnv, resolveWithProvenance };
