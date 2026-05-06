/**
 * cli-transform.js
 * CLI sub-command: transform env values according to a schema.
 */

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./parser');
const { normalizeSchema } = require('./schema');
const { transformEnv } = require('./transformer');
const { toDotenv } = require('./exporter');

function printHelp() {
  console.log(`
Usage: envguard transform [options]

Options:
  --env <file>      Path to .env file (default: .env)
  --schema <file>   Path to schema JSON file (required)
  --out <file>      Write transformed output to file (default: stdout)
  --format <fmt>    Output format: dotenv | json | shell (default: dotenv)
  --help            Show this help message
`.trim());
}

function runTransform(argv = process.argv.slice(2)) {
  const args = argv.slice(1); // strip sub-command token
  if (args.includes('--help')) {
    printHelp();
    return;
  }

  const get = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : null;
  };

  const envFile = get('--env') || '.env';
  const schemaFile = get('--schema');
  const outFile = get('--out');
  const format = get('--format') || 'dotenv';

  if (!schemaFile) {
    console.error('Error: --schema is required');
    process.exit(1);
  }

  let env, rawSchema;
  try {
    env = parseEnvFile(path.resolve(envFile));
  } catch (e) {
    console.error(`Error reading env file: ${e.message}`);
    process.exit(1);
  }

  try {
    rawSchema = JSON.parse(fs.readFileSync(path.resolve(schemaFile), 'utf8'));
  } catch (e) {
    console.error(`Error reading schema file: ${e.message}`);
    process.exit(1);
  }

  const schema = normalizeSchema(rawSchema);
  const { result, errors } = transformEnv(env, schema);

  if (errors.length > 0) {
    console.error('Transform errors:');
    errors.forEach(({ key, message }) => console.error(`  ${key}: ${message}`));
    process.exit(1);
  }

  // Stringify all values for export
  const stringified = Object.fromEntries(
    Object.entries(result).map(([k, v]) =>
      [k, typeof v === 'object' ? JSON.stringify(v) : String(v)]
    )
  );

  let output;
  if (format === 'json') {
    output = JSON.stringify(stringified, null, 2);
  } else if (format === 'shell') {
    output = Object.entries(stringified).map(([k, v]) => `export ${k}=${v}`).join('\n');
  } else {
    output = toDotenv(stringified);
  }

  if (outFile) {
    fs.writeFileSync(path.resolve(outFile), output + '\n');
    console.log(`Transformed env written to ${outFile}`);
  } else {
    console.log(output);
  }
}

module.exports = { runTransform, printHelp };
