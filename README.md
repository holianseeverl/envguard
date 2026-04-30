# envguard

> Lightweight utility that validates and audits `.env` files against a schema definition to catch missing or misconfigured variables before deployment.

---

## Installation

```bash
npm install envguard
# or
yarn add envguard
```

---

## Usage

Define a schema for your environment variables, then run `envguard` to validate your `.env` file before your app starts.

```js
import { validate } from 'envguard';

const schema = {
  DATABASE_URL: { type: 'string', required: true },
  PORT: { type: 'number', default: 3000 },
  NODE_ENV: { type: 'string', allowed: ['development', 'production', 'test'] },
  API_KEY: { type: 'string', required: true, minLength: 32 },
};

const result = validate('.env', schema);

if (!result.valid) {
  console.error('Environment validation failed:');
  result.errors.forEach(err => console.error(` - ${err}`));
  process.exit(1);
}

console.log('Environment is valid ✓');
```

You can also run it directly from the CLI:

```bash
npx envguard --env .env --schema env.schema.json
```

---

## Features

- ✅ Validates required variables
- ✅ Type checking (`string`, `number`, `boolean`)
- ✅ Allowed value lists and length constraints
- ✅ Default value support
- ✅ CLI and programmatic API

---

## License

[MIT](./LICENSE) © envguard contributors