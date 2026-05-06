/**
 * profiler.js — Profiles .env files to generate statistics and insights
 */

/**
 * Count total, empty, commented, and set variables
 * @param {Object} env - parsed env object
 * @param {string} rawString - raw .env file content
 * @returns {Object} stats
 */
function profileEnv(env, rawString = '') {
  const keys = Object.keys(env);
  const total = keys.length;
  const emptyKeys = keys.filter(k => env[k] === '');
  const setKeys = keys.filter(k => env[k] !== '');

  const lines = rawString.split('\n');
  const commentLines = lines.filter(l => l.trim().startsWith('#'));
  const blankLines = lines.filter(l => l.trim() === '');

  const valueLengths = keys.map(k => env[k].length);
  const avgValueLength = total > 0
    ? Math.round(valueLengths.reduce((a, b) => a + b, 0) / total)
    : 0;
  const longestKey = keys.reduce((a, b) => (b.length > a.length ? b : a), '');

  const prefixes = {};
  for (const key of keys) {
    const parts = key.split('_');
    if (parts.length > 1) {
      const prefix = parts[0];
      prefixes[prefix] = (prefixes[prefix] || 0) + 1;
    }
  }

  const topPrefixes = Object.entries(prefixes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([prefix, count]) => ({ prefix, count }));

  return {
    total,
    set: setKeys.length,
    empty: emptyKeys.length,
    emptyKeys,
    commentLines: commentLines.length,
    blankLines: blankLines.length,
    avgValueLength,
    longestKey,
    topPrefixes,
  };
}

/**
 * Format profile stats as a human-readable string
 * @param {Object} stats - output of profileEnv
 * @returns {string}
 */
function formatProfile(stats) {
  const lines = [
    `Total variables : ${stats.total}`,
    `Set             : ${stats.set}`,
    `Empty           : ${stats.empty}`,
    `Comment lines   : ${stats.commentLines}`,
    `Blank lines     : ${stats.blankLines}`,
    `Avg value length: ${stats.avgValueLength}`,
    `Longest key     : ${stats.longestKey || '(none)'}`,
  ];

  if (stats.topPrefixes.length > 0) {
    lines.push('Top prefixes:');
    for (const { prefix, count } of stats.topPrefixes) {
      lines.push(`  ${prefix}_* — ${count} var${count !== 1 ? 's' : ''}`);
    }
  }

  if (stats.emptyKeys.length > 0) {
    lines.push(`Empty keys: ${stats.emptyKeys.join(', ')}`);
  }

  return lines.join('\n');
}

module.exports = { profileEnv, formatProfile };
