#!/usr/bin/env node
/**
 * cli-sort.js — CLI for sorting .env files
 */

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./parser');
const { sortEnv } = require('./sorter');
const { normalizeSchema } = require('./schema');
const { toDotenv } = require('./exporter');

function printHelp() {
  console.log(`
Usage: envguard-sort [options] <envfile>

Options:
  --strategy <alpha|prefix|schema>  Sort strategy (default: alpha)
  --schema   <schemafile>           Schema file for schema strategy
  --output   <file>                 Write sorted output to file (default: stdout)
  --help                            Show this help message
`.trim());
}

function runSort(argv = process.argv.slice(2)) {
  const args = argv.slice();

  if (args.includes('--help') || args.length === 0) {
    printHelp();
    return;
  }

  let strategy = 'alpha';
  let schemaFile = null;
  let outputFile = null;
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--strategy' && args[i + 1]) {
      strategy = args[++i];
    } else if (args[i] === '--schema' && args[i + 1]) {
      schemaFile = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      outputFile = args[++i];
    } else if (!args[i].startsWith('--')) {
      positional.push(args[i]);
    }
  }

  if (positional.length === 0) {
    console.error('Error: no env file specified.');
    process.exit(1);
  }

  const envPath = path.resolve(positional[0]);
  if (!fs.existsSync(envPath)) {
    console.error(`Error: file not found: ${envPath}`);
    process.exit(1);
  }

  let schema = {};
  if (strategy === 'schema') {
    if (!schemaFile) {
      console.error('Error: --schema is required when using schema strategy.');
      process.exit(1);
    }
    const rawSchema = JSON.parse(fs.readFileSync(path.resolve(schemaFile), 'utf8'));
    schema = normalizeSchema(rawSchema);
  }

  const env = parseEnvFile(envPath);
  const sorted = sortEnv(env, strategy, schema);
  const output = toDotenv(sorted);

  if (outputFile) {
    fs.writeFileSync(path.resolve(outputFile), output, 'utf8');
    console.log(`Sorted env written to ${outputFile}`);
  } else {
    process.stdout.write(output);
  }
}

module.exports = { printHelp, runSort };

if (require.main === module) {
  runSort();
}
