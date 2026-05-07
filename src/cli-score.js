'use strict';

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./parser');
const { normalizeSchema } = require('./schema');
const { scoreEnv, gradeScore } = require('./scorer');

function printHelp() {
  console.log(`
Usage: envguard score <envFile> [schemaFile] [options]

Options:
  --format <text|json>   Output format (default: text)
  --fail-below <n>       Exit with code 1 if score is below n
  --help                 Show this help
`.trim());
}

function parseArgs(argv) {
  const args = { envFile: null, schemaFile: null, format: 'text', failBelow: null };
  const rest = [...argv];
  while (rest.length) {
    const arg = rest.shift();
    if (arg === '--help') { printHelp(); process.exit(0); }
    if (arg === '--format') { args.format = rest.shift(); }
    else if (arg === '--fail-below') { args.failBelow = parseInt(rest.shift(), 10); }
    else if (!args.envFile) args.envFile = arg;
    else if (!args.schemaFile) args.schemaFile = arg;
  }
  return args;
}

function runScore(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);

  if (!args.envFile) {
    console.error('Error: envFile is required.');
    printHelp();
    process.exit(1);
  }

  let env;
  try {
    env = parseEnvFile(path.resolve(args.envFile));
  } catch (e) {
    console.error(`Error reading env file: ${e.message}`);
    process.exit(1);
  }

  let schema = {};
  if (args.schemaFile) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.resolve(args.schemaFile), 'utf8'));
      schema = normalizeSchema(raw);
    } catch (e) {
      console.error(`Error reading schema file: ${e.message}`);
      process.exit(1);
    }
  }

  const result = scoreEnv(env, schema);
  const grade = gradeScore(result.total);

  if (args.format === 'json') {
    console.log(JSON.stringify({ ...result, grade }, null, 2));
  } else {
    console.log(`\nEnv Quality Score: ${result.total}/100  (${grade})\n`);
    console.log('Breakdown:');
    for (const [dim, score] of Object.entries(result.breakdown)) {
      console.log(`  ${dim.padEnd(20)} ${score}`);
    }
    console.log();
  }

  if (args.failBelow !== null && result.total < args.failBelow) {
    process.exit(1);
  }
}

module.exports = { runScore, parseArgs };
