#!/usr/bin/env node
/**
 * cli-compare.js
 * CLI entry point for comparing two .env files.
 */

const fs = require('fs');
const path = require('path');
const { parseEnvString } = require('./parser');
const { compareEnvs, summariseChanges, filterChanges } = require('./comparator');
const { maskEnv } = require('./masker');

function printHelp() {
  console.log(`
Usage: envguard compare <base> <head> [options]

Options:
  --only <status>   Show only: added, removed, changed, unchanged
  --mask            Mask sensitive values
  --no-unchanged    Hide unchanged keys
  --summary         Print summary only
  -h, --help        Show this help
`.trim());
}

function runCompare(argv = process.argv.slice(2)) {
  if (!argv.length || argv.includes('-h') || argv.includes('--help')) {
    printHelp();
    return;
  }

  const [baseFile, headFile, ...flags] = argv;

  if (!baseFile || !headFile) {
    console.error('Error: two file paths are required.');
    process.exitCode = 1;
    return;
  }

  let baseRaw, headRaw;
  try {
    baseRaw = fs.readFileSync(path.resolve(baseFile), 'utf8');
    headRaw = fs.readFileSync(path.resolve(headFile), 'utf8');
  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  let base = parseEnvString(baseRaw);
  let head = parseEnvString(headRaw);

  const doMask = flags.includes('--mask');
  const summaryOnly = flags.includes('--summary');
  const hideUnchanged = flags.includes('--no-unchanged');
  const onlyIdx = flags.indexOf('--only');
  const onlyStatus = onlyIdx !== -1 ? flags[onlyIdx + 1] : null;

  if (doMask) {
    base = maskEnv(base);
    head = maskEnv(head);
  }

  let changes = compareEnvs(base, head);

  if (onlyStatus) {
    changes = filterChanges(changes, onlyStatus);
  } else if (hideUnchanged) {
    changes = filterChanges(changes, ['added', 'removed', 'changed']);
  }

  const summary = summariseChanges(changes);

  if (!summaryOnly) {
    for (const c of changes) {
      const prefix = { added: '+', removed: '-', changed: '~', unchanged: ' ' }[c.status];
      if (c.status === 'changed') {
        console.log(`${prefix} ${c.key}: ${c.baseValue} → ${c.headValue}`);
      } else if (c.status === 'added') {
        console.log(`${prefix} ${c.key}=${c.headValue}`);
      } else if (c.status === 'removed') {
        console.log(`${prefix} ${c.key}=${c.baseValue}`);
      } else {
        console.log(`${prefix} ${c.key}=${c.baseValue}`);
      }
    }
  }

  console.log(`\nSummary: +${summary.added} added, -${summary.removed} removed, ~${summary.changed} changed, ${summary.unchanged} unchanged`);
}

if (require.main === module) {
  runCompare();
}

module.exports = { runCompare, printHelp };
