### Configuración y Versionado en Hexy

Hexy permite definir parámetros de configuración y secretos sensibles de forma estructurada, permitiendo a los adaptadores cargar valores desde múltiples orígenes.

---

### 🧩 Estructura oficial

Ubicación: `/context/<context>/config/`

#### ✅ Forma preferida (archivos separados)
```
config/
├── parameters.ts  ← parámetros no sensibles
├── secrets.ts     ← claves sensibles
```

#### ✅ Alternativa (todo en uno)
```
config/
├── config.ts      ← debe exportar `parameters` y `secrets`
```

---

### 📁 Ejemplo - parameters.ts

```ts
export const parameters = {
  versioning: true,
  version: 'v2',
  enableFeatureX: true
}
```

---

### 📁 Ejemplo - secrets.ts

```ts
export const secrets = {
  jwtSecret: 'JWT_SECRET',
  dbPassword: 'DB_PASS'
}
```

---

### 🧪 Acceso a valores

```ts
import { parameters } from './parameters'
import { secrets } from './secrets'

const version = parameters.version
const jwt = getSecret(secrets.jwtSecret)
```

---

### 🧩 Adaptadores disponibles

- `.env` (default en desarrollo)
- AWS Parameter Store
- AWS Secrets Manager

---

### 🧠 Buenas prácticas

- Nunca mezcles secretos en `parameters.ts`
- Usa `getSecret()` solo con claves definidas en `secrets.ts`
- Usa `getConfig()` o accede directamente a `parameters` si es plano
- No hardcodees secretos en archivos de dominio o aplicación
