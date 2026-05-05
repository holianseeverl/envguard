/**
 * cli-merge.js — CLI subcommand handler for `envguard merge`
 * Merges multiple .env files and reports conflicts.
 */

const { parseEnvFile } = require('./parser');
const { mergeEnvsWithSources } = require('./merger');
const { maskEnv } = require('./masker');

/**
 * Run the merge subcommand.
 *
 * @param {string[]} filePaths - ordered list of .env file paths (ascending priority)
 * @param {Object} options
 * @param {boolean} options.mask - mask sensitive values in output
 * @param {boolean} options.quiet - suppress conflict warnings
 * @returns {{ merged: Object, conflicts: Object }}
 */
function runMerge(filePaths, options = {}) {
  const { mask = false, quiet = false } = options;

  if (!filePaths || filePaths.length === 0) {
    throw new Error('merge requires at least one file path');
  }

  const sources = filePaths.map((fp) => ({
    name: fp,
    env: parseEnvFile(fp)
  }));

  const { merged, conflicts } = mergeEnvsWithSources(sources);

  if (!quiet && Object.keys(conflicts).length > 0) {
    console.warn('\n⚠  Merge conflicts detected:');
    for (const [key, entries] of Object.entries(conflicts)) {
      console.warn(`  ${key}:`);
      for (const { source, value } of entries) {
        console.warn(`    [${source}] ${value}`);
      }
    }
    console.warn('');
  }

  const output = mask ? maskEnv(merged) : merged;

  console.log('\nMerged result:');
  for (const [key, value] of Object.entries(output)) {
    console.log(`  ${key}=${value}`);
  }

  return { merged, conflicts };
}

module.exports = { runMerge };
