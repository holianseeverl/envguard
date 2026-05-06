/**
 * comparator.js
 * Compare two env objects and produce a structured diff report.
 */

/**
 * Compare two env objects key by key.
 * Returns an array of change records.
 * @param {Object} base
 * @param {Object} head
 * @returns {Array<{key, status, baseValue, headValue}>}
 */
function compareEnvs(base, head) {
  const keys = new Set([...Object.keys(base), ...Object.keys(head)]);
  const changes = [];

  for (const key of keys) {
    const inBase = Object.prototype.hasOwnProperty.call(base, key);
    const inHead = Object.prototype.hasOwnProperty.call(head, key);

    if (inBase && !inHead) {
      changes.push({ key, status: 'removed', baseValue: base[key], headValue: undefined });
    } else if (!inBase && inHead) {
      changes.push({ key, status: 'added', baseValue: undefined, headValue: head[key] });
    } else if (base[key] !== head[key]) {
      changes.push({ key, status: 'changed', baseValue: base[key], headValue: head[key] });
    } else {
      changes.push({ key, status: 'unchanged', baseValue: base[key], headValue: head[key] });
    }
  }

  return changes.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Summarise a list of change records.
 * @param {Array} changes
 * @returns {{ added: number, removed: number, changed: number, unchanged: number }}
 */
function summariseChanges(changes) {
  const summary = { added: 0, removed: 0, changed: 0, unchanged: 0 };
  for (const c of changes) {
    summary[c.status] = (summary[c.status] || 0) + 1;
  }
  return summary;
}

/**
 * Filter changes by one or more statuses.
 * @param {Array} changes
 * @param {string|string[]} statuses
 * @returns {Array}
 */
function filterChanges(changes, statuses) {
  const set = new Set(Array.isArray(statuses) ? statuses : [statuses]);
  return changes.filter(c => set.has(c.status));
}

module.exports = { compareEnvs, summariseChanges, filterChanges };
