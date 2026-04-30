function formatResult(result, options = {}) {
  const { verbose = false, color = true } = options;
  const lines = [];

  const c = {
    red: color ? '\x1b[31m' : '',
    yellow: color ? '\x1b[33m' : '',
    green: color ? '\x1b[32m' : '',
    reset: color ? '\x1b[0m' : '',
    bold: color ? '\x1b[1m' : '',
  };

  if (result.valid) {
    lines.push(`${c.green}${c.bold}✔ envguard: all checks passed${c.reset}`);
  } else {
    lines.push(`${c.red}${c.bold}✘ envguard: validation failed${c.reset}`);
  }

  if (result.errors.length > 0) {
    lines.push(`\n${c.red}Errors (${result.errors.length}):${c.reset}`);
    for (const err of result.errors) {
      lines.push(`  ${c.red}✘${c.reset} ${err.message}`);
    }
  }

  if (result.warnings.length > 0 && verbose) {
    lines.push(`\n${c.yellow}Warnings (${result.warnings.length}):${c.reset}`);
    for (const warn of result.warnings) {
      lines.push(`  ${c.yellow}⚠${c.reset} ${warn.message}`);
    }
  }

  return lines.join('\n');
}

function printResult(result, options = {}) {
  const output = formatResult(result, options);
  if (result.valid) {
    console.log(output);
  } else {
    console.error(output);
  }
}

module.exports = { formatResult, printResult };
