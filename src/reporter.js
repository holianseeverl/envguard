/**
 * reporter.js
 * Formats and prints audit results to the console.
 */

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';

/**
 * Format an audit result into a human-readable string.
 *
 * @param {import('./auditor').AuditResult} result
 * @returns {string}
 */
function formatResult(result) {
  const lines = [];

  if (result.missing.length === 0 && result.invalid.length === 0) {
    lines.push(`${GREEN}${BOLD}✔ All required variables are present and valid.${RESET}`);
  }

  if (result.missing.length > 0) {
    lines.push(`\n${RED}${BOLD}✖ Missing required variables (${result.missing.length}):${RESET}`);
    for (const key of result.missing) {
      lines.push(`  ${RED}• ${key}${RESET} — ${result.errors[key]}`);
    }
  }

  if (result.invalid.length > 0) {
    lines.push(`\n${RED}${BOLD}✖ Invalid variables (${result.invalid.length}):${RESET}`);
    for (const key of result.invalid) {
      lines.push(`  ${RED}• ${key}${RESET} — ${result.errors[key]}`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push(`\n${YELLOW}${BOLD}⚠ Optional variables not set (${result.warnings.length}):${RESET}`);
    for (const key of result.warnings) {
      lines.push(`  ${YELLOW}• ${key}${RESET}`);
    }
  }

  if (result.extra.length > 0) {
    lines.push(`\n${CYAN}${BOLD}ℹ Extra variables not in schema (${result.extra.length}):${RESET}`);
    for (const key of result.extra) {
      lines.push(`  ${CYAN}• ${key}${RESET}`);
    }
  }

  return lines.join('\n');
}

/**
 * Print audit result to stdout.
 *
 * @param {import('./auditor').AuditResult} result
 */
function printResult(result) {
  console.log(formatResult(result));
}

module.exports = { formatResult, printResult };
