/**
 * diff.js - Compare two .env files or an env against a schema
 * and produce a structured diff of added, removed, and changed keys.
 */

/**
 * Diff two plain key-value objects.
 * @param {Object} base  - The reference env (e.g. .env.example)
 * @param {Object} target - The env being evaluated (e.g. .env)
 * @returns {Object} diff result
 */
function diffEnvs(base, target) {
  const baseKeys = new Set(Object.keys(base));
  const targetKeys = new Set(Object.keys(target));

  const added = [];
  const removed = [];
  const changed = [];
  const unchanged = [];

  for (const key of targetKeys) {
    if (!baseKeys.has(key)) {
      added.push({ key, value: target[key] });
    }
  }

  for (const key of baseKeys) {
    if (!targetKeys.has(key)) {
      removed.push({ key, value: base[key] });
    } else if (base[key] !== target[key]) {
      changed.push({ key, from: base[key], to: target[key] });
    } else {
      unchanged.push({ key });
    }
  }

  return { added, removed, changed, unchanged };
}

/**
 * Diff a parsed env object against a normalized schema.
 * Returns keys that are present in schema but missing in env,
 * and keys present in env but not declared in schema.
 * @param {Object} schema  - Normalized schema (key -> rule)
 * @param {Object} env     - Parsed env key-value pairs
 * @returns {Object}
 */
function diffEnvAgainstSchema(schema, env) {
  const schemaKeys = new Set(Object.keys(schema));
  const envKeys = new Set(Object.keys(env));

  const missingInEnv = [];
  const undeclaredInSchema = [];

  for (const key of schemaKeys) {
    if (!envKeys.has(key)) {
      missingInEnv.push({ key, rule: schema[key] });
    }
  }

  for (const key of envKeys) {
    if (!schemaKeys.has(key)) {
      undeclaredInSchema.push({ key, value: env[key] });
    }
  }

  return { missingInEnv, undeclaredInSchema };
}

module.exports = { diffEnvs, diffEnvAgainstSchema };
