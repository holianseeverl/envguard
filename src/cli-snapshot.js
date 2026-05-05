/**
 * cli-snapshot.js — CLI command for saving and comparing env snapshots
 */

const path = require('path');
const { parseEnvFile } = require('./parser');
const { saveSnapshot, loadSnapshot, compareSnapshot } = require('./snapshot');

function printHelp() {
  console.log(`
Usage: envguard snapshot <command> [options]

Commands:
  save    Save current .env as a snapshot
  compare Compare current .env against a snapshot

Options:
  --env <file>       Path to .env file (default: .env)
  --snapshot <file>  Path to snapshot file (default: .env.snapshot.json)
  --label <text>     Label to store with snapshot (save only)
`);
}

function runSnapshot(argv) {
  const args = argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  const envIndex = args.indexOf('--env');
  const snapIndex = args.indexOf('--snapshot');
  const labelIndex = args.indexOf('--label');

  const envFile = envIndex !== -1 ? args[envIndex + 1] : '.env';
  const snapshotFile = snapIndex !== -1 ? args[snapIndex + 1] : '.env.snapshot.json';
  const label = labelIndex !== -1 ? args[labelIndex + 1] : undefined;

  if (command === 'save') {
    const env = parseEnvFile(envFile);
    const meta = label ? { label } : {};
    saveSnapshot(env, snapshotFile, meta);
    console.log(`Snapshot saved to ${snapshotFile} (${Object.keys(env).length} keys)`);
    return;
  }

  if (command === 'compare') {
    const env = parseEnvFile(envFile);
    const snapshot = loadSnapshot(snapshotFile);
    const result = compareSnapshot(env, snapshot);

    if (!result.hasDrift) {
      console.log('No drift detected. Environment matches snapshot.');
      return;
    }

    console.log(`Drift detected against snapshot from ${snapshot.timestamp}\n`);
    if (result.added.length) console.log('  Added:  ', result.added.join(', '));
    if (result.removed.length) console.log('  Removed:', result.removed.join(', '));
    if (result.changed.length) console.log('  Changed:', result.changed.join(', '));
    process.exitCode = 1;
    return;
  }

  console.error(`Unknown snapshot command: ${command}`);
  printHelp();
  process.exitCode = 1;
}

module.exports = { runSnapshot };
