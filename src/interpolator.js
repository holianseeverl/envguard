/**
 * Resolves variable references within .env values.
 * Supports ${VAR} and $VAR syntax.
 */

/**
 * Interpolate a single value string against a map of known variables.
 * @param {string} value
 * @param {Record<string, string>} vars
 * @returns {string}
 */
function interpolateValue(value, vars) {
  if (typeof value !== 'string') return value;

  // Replace ${VAR_NAME} style
  let result = value.replace(/\$\{([A-Z_][A-Z0-9_]*)\}/g, (match, name) => {
    return Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : match;
  });

  // Replace $VAR_NAME style (not followed by { )
  result = result.replace(/\$([A-Z_][A-Z0-9_]*)(?![{A-Z0-9_])/g, (match, name) => {
    return Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : match;
  });

  return result;
}

/**
 * Interpolate all values in an env object, resolving cross-references.
 * Performs a single pass — circular refs are left unresolved.
 * @param {Record<string, string>} env
 * @returns {Record<string, string>}
 */
function interpolateEnv(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = interpolateValue(value, env);
  }
  return result;
}

module.exports = { interpolateValue, interpolateEnv };
