/**
 * merger.js — Merges multiple .env objects with priority and conflict detection
 */

/**
 * Merge multiple env objects, later sources take priority.
 * Returns merged env and a map of keys that had conflicts.
 *
 * @param {...Object} envObjects - plain key/value env objects
 * @returns {{ merged: Object, conflicts: Object }}
 */
function mergeEnvs(...envObjects) {
  const merged = {};
  const conflicts = {};

  for (const env of envObjects) {
    if (!env || typeof env !== 'object') continue;
    for (const [key, value] of Object.entries(env)) {
      if (key in merged && merged[key] !== value) {
        if (!conflicts[key]) {
          conflicts[key] = [merged[key]];
        }
        conflicts[key].push(value);
      }
      merged[key] = value;
    }
  }

  return { merged, conflicts };
}

/**
 * Merge envs with an explicit priority list (highest priority last).
 * Keys not present in higher-priority sources fall back to lower-priority ones.
 *
 * @param {Object[]} sources - array of { name: string, env: Object }
 * @returns {{ merged: Object, conflicts: Object, sources: Object }}
 */
function mergeEnvsWithSources(sources) {
  const merged = {};
  const conflicts = {};
  const keySource = {};

  for (const { name, env } of sources) {
    if (!env || typeof env !== 'object') continue;
    for (const [key, value] of Object.entries(env)) {
      if (key in merged && merged[key] !== value) {
        if (!conflicts[key]) {
          conflicts[key] = [{ source: keySource[key], value: merged[key] }];
        }
        conflicts[key].push({ source: name, value });
      }
      merged[key] = value;
      keySource[key] = name;
    }
  }

  return { merged, conflicts, sources: keySource };
}

module.exports = { mergeEnvs, mergeEnvsWithSources };
