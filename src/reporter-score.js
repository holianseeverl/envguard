'use strict';

/**
 * reporter-score.js — Formatting helpers for scorer output.
 */

const GRADE_COLORS = {
  A: '\x1b[32m', // green
  B: '\x1b[36m', // cyan
  C: '\x1b[33m', // yellow
  D: '\x1b[35m', // magenta
  F: '\x1b[31m', // red
};
const RESET = '\x1b[0m';

/**
 * Render a horizontal bar representing a score out of 100.
 * @param {number} score
 * @param {number} width total bar width characters
 * @returns {string}
 */
function renderBar(score, width = 20) {
  const filled = Math.round((score / 100) * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

/**
 * Format a full score result as a human-readable string.
 * @param {{ total: number, breakdown: object }} result
 * @param {string} grade
 * @param {{ color?: boolean }} opts
 * @returns {string}
 */
function formatScoreReport(result, grade, opts = {}) {
  const useColor = opts.color !== false && process.stdout.isTTY;
  const gradeColor = useColor ? (GRADE_COLORS[grade] || '') : '';
  const reset = useColor ? RESET : '';

  const lines = [];
  lines.push(`Env Quality Score: ${gradeColor}${result.total}/100  Grade: ${grade}${reset}`);
  lines.push('');
  lines.push('Dimension             Score  Bar');
  lines.push('─'.repeat(44));

  for (const [dim, score] of Object.entries(result.breakdown)) {
    const label = dim.padEnd(22);
    const scoreStr = String(score).padStart(3);
    const bar = renderBar(score);
    lines.push(`${label}${scoreStr}  ${bar}`);
  }

  lines.push('─'.repeat(44));
  return lines.join('\n');
}

/**
 * Print a score report to stdout.
 * @param {{ total: number, breakdown: object }} result
 * @param {string} grade
 * @param {{ color?: boolean }} opts
 */
function printScoreReport(result, grade, opts = {}) {
  console.log('\n' + formatScoreReport(result, grade, opts) + '\n');
}

module.exports = { formatScoreReport, printScoreReport, renderBar };
