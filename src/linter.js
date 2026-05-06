/**
 * linter.js — checks .env files for common style and hygiene issues
 */

const LINT_RULES = {
  NO_SPACES_AROUND_EQUALS: 'no-spaces-around-equals',
  NO_INLINE_COMMENTS: 'no-inline-comments',
  NO_DUPLICATE_KEYS: 'no-duplicate-keys',
  NO_EMPTY_VALUE_WITHOUT_QUOTES: 'no-empty-value-without-quotes',
  UPPERCASE_KEYS: 'uppercase-keys',
  NO_LEADING_TRAILING_WHITESPACE: 'no-leading-trailing-whitespace',
};

/**
 * @param {string} envString - raw .env file content
 * @returns {{ rule: string, line: number, message: string }[]}
 */
function lintEnvString(envString) {
  const issues = [];
  const lines = envString.split('\n');
  const seenKeys = new Set();

  lines.forEach((raw, idx) => {
    const lineNum = idx + 1;
    const line = raw;

    // skip blank lines and comments
    if (line.trim() === '' || line.trim().startsWith('#')) return;

    // no-leading-trailing-whitespace
    if (line !== line.trim()) {
      issues.push({ rule: LINT_RULES.NO_LEADING_TRAILING_WHITESPACE, line: lineNum, message: 'Line has leading or trailing whitespace' });
    }

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) return;

    const key = line.slice(0, eqIndex);
    const rest = line.slice(eqIndex + 1);

    // no-spaces-around-equals
    if (key.endsWith(' ') || rest.startsWith(' ')) {
      issues.push({ rule: LINT_RULES.NO_SPACES_AROUND_EQUALS, line: lineNum, message: `Spaces around '=' in key '${key.trim()}'` });
    }

    const trimmedKey = key.trim();

    // uppercase-keys
    if (trimmedKey !== trimmedKey.toUpperCase()) {
      issues.push({ rule: LINT_RULES.UPPERCASE_KEYS, line: lineNum, message: `Key '${trimmedKey}' should be uppercase` });
    }

    // no-duplicate-keys
    if (seenKeys.has(trimmedKey)) {
      issues.push({ rule: LINT_RULES.NO_DUPLICATE_KEYS, line: lineNum, message: `Duplicate key '${trimmedKey}'` });
    } else {
      seenKeys.add(trimmedKey);
    }

    // no-inline-comments
    const valueRaw = rest.trim();
    const unquoted = !valueRaw.startsWith('"') && !valueRaw.startsWith("'");
    if (unquoted && valueRaw.includes(' #')) {
      issues.push({ rule: LINT_RULES.NO_INLINE_COMMENTS, line: lineNum, message: `Inline comment detected on key '${trimmedKey}'` });
    }

    // no-empty-value-without-quotes
    if (valueRaw === '') {
      issues.push({ rule: LINT_RULES.NO_EMPTY_VALUE_WITHOUT_QUOTES, line: lineNum, message: `Empty value for key '${trimmedKey}' should use empty quotes` });
    }
  });

  return issues;
}

module.exports = { lintEnvString, LINT_RULES };
