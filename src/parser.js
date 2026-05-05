const fs = require('fs');
const { interpolateEnv } = require('./interpolator');

/**
 * Parse a .env formatted string into a key/value object.
 * Supports quoted values, inline comments, and blank lines.
 * @param {string} content
 * @param {{ interpolate?: boolean }} [options]
 * @returns {Record<string, string>}
 */
function parseEnvString(content, options = {}) {
  const result = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    // Skip blank lines and comments
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    // Strip inline comment (only outside quotes)
    if (!value.startsWith('"') && !value.startsWith("'")) {
      const commentIdx = value.indexOf(' #');
      if (commentIdx !== -1) value = value.slice(0, commentIdx).trim();
    }

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) result[key] = value;
  }

  return options.interpolate ? interpolateEnv(result) : result;
}

/**
 * Read and parse a .env file from disk.
 * @param {string} filePath
 * @param {{ interpolate?: boolean }} [options]
 * @returns {Record<string, string>}
 */
function parseEnvFile(filePath, options = {}) {
  const content = fs.readFileSync(filePath, 'utf8');
  return parseEnvString(content, options);
}

module.exports = { parseEnvString, parseEnvFile };
