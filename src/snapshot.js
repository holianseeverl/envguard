/**
 * snapshot.js — Save and compare .env snapshots to detect drift over time
 */

const fs = require('fs');
const path = require('path');

/**
 * Save a snapshot of the current env to a JSON file
 * @param {Object} env - parsed env object
 * @param {string} snapshotPath - file path to write snapshot
 * @param {Object} [meta] - optional metadata (timestamp, label)
 */
function saveSnapshot(env, snapshotPath, meta = {}) {
  const snapshot = {
    timestamp: new Date().toISOString(),
    ...meta,
    keys: Object.keys(env).sort(),
    env,
  };
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf8');
  return snapshot;
}

/**
 * Load a snapshot from a JSON file
 * @param {string} snapshotPath
 */
function loadSnapshot(snapshotPath) {
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot not found: ${snapshotPath}`);
  }
  const raw = fs.readFileSync(snapshotPath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Compare current env against a saved snapshot
 * Returns added, removed, and changed keys
 * @param {Object} currentEnv
 * @param {Object} snapshot
 */
function compareSnapshot(currentEnv, snapshot) {
  const snapshotEnv = snapshot.env || {};
  const currentKeys = new Set(Object.keys(currentEnv));
  const snapshotKeys = new Set(Object.keys(snapshotEnv));

  const added = [...currentKeys].filter(k => !snapshotKeys.has(k));
  const removed = [...snapshotKeys].filter(k => !currentKeys.has(k));
  const changed = [...currentKeys].filter(
    k => snapshotKeys.has(k) && currentEnv[k] !== snapshotEnv[k]
  );

  return {
    added,
    removed,
    changed,
    hasDrift: added.length > 0 || removed.length > 0 || changed.length > 0,
  };
}

module.exports = { saveSnapshot, loadSnapshot, compareSnapshot };
