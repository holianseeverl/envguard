/**
 * grouper.js — Group env variables by prefix or custom classifier
 */

/**
 * Groups env vars by their prefix (e.g. DB_HOST -> group 'DB')
 * @param {Object} env - flat env object
 * @param {string} [separator='_'] - prefix separator
 * @returns {Object} grouped env object
 */
function groupByPrefix(env, separator = '_') {
  const groups = {};
  for (const [key, value] of Object.entries(env)) {
    const idx = key.indexOf(separator);
    const prefix = idx !== -1 ? key.slice(0, idx) : '__ungrouped__';
    if (!groups[prefix]) groups[prefix] = {};
    groups[prefix][key] = value;
  }
  return groups;
}

/**
 * Groups env vars using a custom classifier function
 * @param {Object} env - flat env object
 * @param {Function} classifier - fn(key, value) => groupName string
 * @returns {Object} grouped env object
 */
function groupByClassifier(env, classifier) {
  if (typeof classifier !== 'function') {
    throw new Error('classifier must be a function');
  }
  const groups = {};
  for (const [key, value] of Object.entries(env)) {
    const groupName = classifier(key, value) || '__ungrouped__';
    if (!groups[groupName]) groups[groupName] = {};
    groups[groupName][key] = value;
  }
  return groups;
}

/**
 * Flattens a grouped env object back to a flat env object
 * @param {Object} grouped - grouped env object
 * @returns {Object} flat env object
 */
function flattenGroups(grouped) {
  const flat = {};
  for (const group of Object.values(grouped)) {
    Object.assign(flat, group);
  }
  return flat;
}

module.exports = { groupByPrefix, groupByClassifier, flattenGroups };
