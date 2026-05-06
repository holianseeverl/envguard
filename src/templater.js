/**
 * templater.js
 * Generate .env files from a schema template with default values and comments.
 */

/**
 * Generate a .env template string from a normalized schema.
 * @param {Object} schema - normalized schema object
 * @param {Object} options
 * @param {boolean} options.includeComments - include field descriptions as comments
 * @param {boolean} options.includeDefaults - fill in default values
 * @param {boolean} options.includeMissing - include keys with no default as empty
 * @returns {string}
 */
function generateTemplate(schema, options = {}) {
  const { includeComments = true, includeDefaults = true, includeMissing = true } = options;
  const lines = [];

  for (const [key, rule] of Object.entries(schema)) {
    if (includeComments) {
      if (rule.description) {
        lines.push(`# ${rule.description}`);
      }
      const meta = [];
      if (rule.type) meta.push(`type: ${rule.type}`);
      if (rule.required) meta.push('required');
      if (rule.example !== undefined) meta.push(`example: ${rule.example}`);
      if (meta.length > 0) {
        lines.push(`# ${meta.join(' | ')}`);
      }
    }

    if (includeDefaults && rule.default !== undefined) {
      lines.push(`${key}=${rule.default}`);
    } else if (includeMissing) {
      lines.push(`${key}=`);
    }

    if (includeComments) {
      lines.push('');
    }
  }

  return lines.join('\n').trimEnd();
}

/**
 * Generate a template and write it to a file path.
 * @param {Object} schema
 * @param {string} filePath
 * @param {Object} options
 * @returns {string} the generated template content
 * @throws {Error} if filePath is not provided or writing fails
 */
function writeTemplate(schema, filePath, options = {}) {
  if (!filePath) {
    throw new Error('writeTemplate: filePath is required');
  }
  const fs = require('fs');
  const content = generateTemplate(schema, options);
  try {
    fs.writeFileSync(filePath, content + '\n', 'utf8');
  } catch (err) {
    throw new Error(`writeTemplate: failed to write file "${filePath}": ${err.message}`);
  }
  return content;
}

module.exports = { generateTemplate, writeTemplate };
