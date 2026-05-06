#!/usr/bin/env node
/**
 * cli-group.js — CLI for grouping env variables by prefix
 */

const { parseEnvFile } = require('./parser');
const { groupByPrefix } = require('./grouper');
const { maskEnv } = require('./masker');

function printHelp() {
  console.log(`
Usage: envguard-group <envfile> [options]

Options:
  --separator <char>   Prefix separator (default: _)
  --mask               Mask sensitive values
  --json               Output as JSON
  --group <name>       Show only a specific group
  --help               Show this help message
`.trim());
}

function runGroup(argv = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.length === 0) {
    printHelp();
    return;
  }

  const file = argv[0];
  const sepIdx = argv.indexOf('--separator');
  const separator = sepIdx !== -1 ? argv[sepIdx + 1] : '_';
  const doMask = argv.includes('--mask');
  const asJson = argv.includes('--json');
  const groupIdx = argv.indexOf('--group');
  const onlyGroup = groupIdx !== -1 ? argv[groupIdx + 1] : null;

  let env;
  try {
    env = parseEnvFile(file);
  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
    process.exit(1);
  }

  if (doMask) env = maskEnv(env);

  const grouped = groupByPrefix(env, separator);
  const output = onlyGroup ? { [onlyGroup]: grouped[onlyGroup] || {} } : grouped;

  if (asJson) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  for (const [group, vars] of Object.entries(output)) {
    console.log(`\n[${group}]`);
    for (const [key, val] of Object.entries(vars)) {
      console.log(`  ${key}=${val}`);
    }
  }
}

if (require.main === module) {
  runGroup();
}

module.exports = { runGroup };
