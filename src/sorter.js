/**
 * sorter.js — Sort and reorder env variables by various strategies
 */

/**
 * Sort env object keys alphabetically
 * @param {Object} env
 * @returns {Object}
 */
function sortAlpha(env) {
  return Object.fromEntries(
    Object.entries(env).sort(([a], [b]) => a.localeCompare(b))
  );
}

/**
 * Sort env keys by prefix groups, then alphabetically within each group
 * @param {Object} env
 * @returns {Object}
 */
function sortByPrefix(env) {
  const entries = Object.entries(env);
  entries.sort(([a], [b]) => {
    const prefixA = a.includes('_') ? a.split('_')[0] : '';
    const prefixB = b.includes('_') ? b.split('_')[0] : '';
    if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);
    return a.localeCompare(b);
  });
  return Object.fromEntries(entries);
}

/**
 * Sort env keys to match the order defined in a schema
 * Keys not in schema are appended at the end alphabetically
 * @param {Object} env
 * @param {Object} schema - normalized schema
 * @returns {Object}
 */
function sortBySchema(env, schema) {
  const schemaKeys = Object.keys(schema);
  const envKeys = Object.keys(env);
  const inSchema = schemaKeys.filter(k => envKeys.includes(k));
  const notInSchema = envKeys.filter(k => !schemaKeys.includes(k)).sort();
  return Object.fromEntries(
    [...inSchema, ...notInSchema].map(k => [k, env[k]])
  );
}

/**
 * Main sort dispatcher
 * @param {Object} env
 * @param {'alpha'|'prefix'|'schema'} strategy
 * @param {Object} [schema]
 * @returns {Object}
 */
function sortEnv(env, strategy = 'alpha', schema = {}) {
  switch (strategy) {
    case 'alpha':   return sortAlpha(env);
    case 'prefix':  return sortByPrefix(env);
    case 'schema':  return sortBySchema(env, schema);
    default:
      throw new Error(`Unknown sort strategy: "${strategy}". Use alpha, prefix, or schema.`);
  }
}

module.exports = { sortAlpha, sortByPrefix, sortBySchema, sortEnv };
