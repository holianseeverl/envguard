#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./parser');
const { validateEnv } = require('./validator');
const { auditEnv } = require('./auditor');
const { diffEnvAgainstSchema } = require('./diff');
const { printResult, printDiff } = require('./reporter');
const { normalizeSchema } = require('./schema');

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    envFile: '.env',
    schemaFile: '.env.schema.json',
    command: 'validate',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--env' && args[i + 1]) opts.envFile = args[++i];
    else if (args[i] === '--schema' && args[i + 1]) opts.schemaFile = args[++i];
    else if (args[i] === 'audit') opts.command = 'audit';
    else if (args[i] === 'diff') opts.command = 'diff';
    else if (args[i] === 'validate') opts.command = 'validate';
    else if (args[i] === '--help' || args[i] === '-h') opts.command = 'help';
  }

  return opts;
}

function printHelp() {
  console.log(`
envguard — .env validation and auditing tool

Usage:
  envguard [command] [options]

Commands:
  validate   Validate .env against schema (default)
  audit      Audit .env for type and format issues
  diff       Show diff between .env and schema

Options:
  --env <file>      Path to .env file (default: .env)
  --schema <file>   Path to schema JSON file (default: .env.schema.json)
  --help, -h        Show this help message
`);
}

function loadFiles(opts) {
  const envPath = path.resolve(process.cwd(), opts.envFile);
  const schemaPath = path.resolve(process.cwd(), opts.schemaFile);

  if (!fs.existsSync(envPath)) {
    console.error(`Error: env file not found: ${envPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(schemaPath)) {
    console.error(`Error: schema file not found: ${schemaPath}`);
    process.exit(1);
  }

  const env = parseEnvFile(envPath);
  const schema = normalizeSchema(JSON.parse(fs.readFileSync(schemaPath, 'utf8')));
  return { env, schema };
}

function run(argv) {
  const opts = parseArgs(argv);

  if (opts.command === 'help') {
    printHelp();
    return;
  }

  const { env, schema } = loadFiles(opts);

  if (opts.command === 'validate') {
    const result = validateEnv(env, schema);
    printResult(result);
    if (!result.valid) process.exit(1);
  } else if (opts.command === 'audit') {
    const result = auditEnv(env, schema);
    printResult(result);
    if (result.warnings && result.warnings.length > 0) process.exit(1);
  } else if (opts.command === 'diff') {
    const delta = diffEnvAgainstSchema(env, schema);
    printDiff(delta);
    if (delta.missing && delta.missing.length > 0) process.exit(1);
  }
}

run(process.argv);
