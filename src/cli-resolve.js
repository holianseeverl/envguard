#!/usr/bin/env node
/**
 * cli-resolve.js — CLI for resolving layered .env files with priority ordering.
 * Usage: envguard-resolve [options] <file1> <file2> ... <fileN>
 *   Files are listed lowest-to-highest priority (later files override earlier).
 *   --format json|shell|dotenv   output format (default: dotenv)
 *   --provenance                 show which file each value came from
 */

const fs = require('fs');
const path = require('path');
const { parseEnvString } = require('./parser');
const { resolveEnv, resolveWithProvenance } = require('./resolver');
const { exportEnv } = require('./exporter');

function printHelp() {
  console.log([
    'Usage: envguard-resolve [--format json|shell|dotenv] [--provenance] <file1> <file2> ...',
    '',
    'Resolves multiple .env files in priority order (later files win).',
    '',
    'Options:',
    '  --format <fmt>   Output format: json, shell, dotenv (default: dotenv)',
    '  --provenance     Show which source file each key came from',
    '  --help           Show this help message',
  ].join('\n'));
}

function runResolve(argv = process.argv.slice(2)) {
  const args = [...argv];
  let format = 'dotenv';
  let provenance = false;
  const files = [];

  while (args.length) {
    const arg = args.shift();
    if (arg === '--help') { printHelp(); return; }
    else if (arg === '--format') { format = args.shift() || 'dotenv'; }
    else if (arg === '--provenance') { provenance = true; }
    else { files.push(arg); }
  }

  if (files.length === 0) {
    console.error('Error: at least one .env file is required.');
    printHelp();
    process.exitCode = 1;
    return;
  }

  const sources = [];
  const labels = [];
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.resolve(file), 'utf8');
      sources.push(parseEnvString(content));
      labels.push(file);
    } catch (err) {
      console.error(`Error reading file "${file}": ${err.message}`);
      process.exitCode = 1;
      return;
    }
  }

  if (provenance) {
    const result = resolveWithProvenance(sources, labels);
    for (const [key, info] of Object.entries(result)) {
      console.log(`${key}=${info.value}  # from ${info.label}`);
    }
    return;
  }

  const resolved = resolveEnv(sources);
  const output = exportEnv(resolved, format);
  console.log(output);
}

if (require.main === module) runResolve();

module.exports = { runResolve };
