/**
 * reporter.js - Format and print validation/audit/diff results.
 */

/**
 * Format a validation result into a human-readable string.
 * @param {Object} result - { valid, errors }
 * @returns {string}
 */
function formatResult(result) {
  if (result.valid) {
    return '✅  All environment variables are valid.';
  }
  const lines = ['❌  Validation failed:'];
  for (const err of result.errors) {
    lines.push(`  • ${err}`);
  }
  return lines.join('\n');
}

/**
 * Print a validation result to stdout.
 * @param {Object} result
 */
function printResult(result) {
  console.log(formatResult(result));
}

/**
 * Format a diff result into a human-readable string.
 * @param {Object} diff - output of diffEnvs or diffEnvAgainstSchema
 * @returns {string}
 */
function formatDiff(diff) {
  const lines = [];

  if (diff.added && diff.added.length > 0) {
    lines.push('➕  Added:');
    for (const { key, value } of diff.added) {
      lines.push(`  + ${key}=${value}`);
    }
  }

  if (diff.removed && diff.removed.length > 0) {
    lines.push('➖  Removed:');
    for (const { key, value } of diff.removed) {
      lines.push(`  - ${key}=${value}`);
    }
  }

  if (diff.changed && diff.changed.length > 0) {
    lines.push('✏️   Changed:');
    for (const { key, from, to } of diff.changed) {
      lines.push(`  ~ ${key}: ${from} → ${to}`);
    }
  }

  if (diff.missingInEnv && diff.missingInEnv.length > 0) {
    lines.push('⚠️   Missing in env (declared in schema):');
    for (const { key } of diff.missingInEnv) {
      lines.push(`  ? ${key}`);
    }
  }

  if (diff.undeclaredInSchema && diff.undeclaredInSchema.length > 0) {
    lines.push('🔍  Undeclared in schema:');
    for (const { key, value } of diff.undeclaredInSchema) {
      lines.push(`  ! ${key}=${value}`);
    }
  }

  return lines.length > 0 ? lines.join('\n') : '✅  No differences found.';
}

/**
 * Print a diff result to stdout.
 * @param {Object} diff
 */
function printDiff(diff) {
  console.log(formatDiff(diff));
}

module.exports = { formatResult, printResult, formatDiff, printDiff };
