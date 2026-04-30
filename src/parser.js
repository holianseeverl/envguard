/**
 * parser.js
 * Parses .env files into key-value objects
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse a raw .env string into a key-value map.
 * Handles comments, blank lines, quoted values, and inline comments.
 *
 * @param {string} content - Raw .env file content
 * @returns {Record<string, string>}
 */
function parseEnvString(content) {
  const result = {};

  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip blank lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (!key) continue;

    // Strip inline comments (only when value is not quoted)
    if (!value.startsWith('"') && !value.startsWith("'")) {
      const commentIdx = value.indexOf(' #');
      if (commentIdx !== -1) {
        value = value.slice(0, commentIdx).trim();
      }
    }

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

/**
 * Read and parse a .env file from disk.
 *
 * @param {string} filePath - Absolute or relative path to the .env file
 * @returns {Record<string, string>}
 */
function parseEnvFile(filePath) {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`envguard: file not found: ${resolved}`);
  }

  const content = fs.readFileSync(resolved, 'utf8');
  return parseEnvString(content);
}

module.exports = { parseEnvString, parseEnvFile };
