### Configuration and Versioning in Hexy

Hexy provides a structured way to define service parameters and secrets. Adapters resolve values from environment or cloud sources.

---

### 🧩 Official Structure

Location: `/context/<context>/config/`

#### ✅ Preferred (separate files)
```
config/
├── parameters.ts  ← non-sensitive parameters
├── secrets.ts     ← sensitive values
```

#### ✅ Alternative (combined)
```
config/
├── config.ts      ← must export `parameters` and `secrets`
```

---

### 📁 Example - parameters.ts

```ts
export const parameters = {
  versioning: true,
  version: 'v2',
  enableFeatureX: true
}
```

---

### 📁 Example - secrets.ts

```ts
export const secrets = {
  jwtSecret: 'JWT_SECRET',
  dbPassword: 'DB_PASS'
}
```

---

### 🧪 Accessing Values

```ts
import { parameters } from './parameters'
import { secrets } from './secrets'

const version = parameters.version
const jwt = getSecret(secrets.jwtSecret)
```

---

### 🧩 Available Adapters

- `.env` (default for dev)
- AWS Parameter Store
- AWS Secrets Manager

---

### 🧠 Best Practices

- Never place secrets in `parameters.ts`
- Only use `getSecret()` with values from `secrets.ts`
- Use `getConfig()` or direct access for `parameters`
- Avoid hardcoded values in domain or application layers
