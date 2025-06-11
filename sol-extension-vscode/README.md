# SOL YAML Support

This extension provides syntax highlighting, schema validation, and language support for Semantic Operations Language (.sol.yaml) files.

## Features

- Syntax highlighting for SOL keywords and semantic roles
- YAML structure validation against SOL schema
- Language support for .sol.yaml and .sol.yml files
- IntelliSense support for SOL artifacts

## Supported File Extensions

- `.sol.yaml`
- `.sol.yml`

## Usage

1. Install the extension
2. Open any `.sol.yaml` or `.sol.yml` file
3. Enjoy syntax highlighting and validation

## Requirements

- VS Code 1.70.0 or higher

## License

MIT

---

## 📦 Included in this Package

- `schemas/sol-schema.json` → JSON Schema for validation of `.sol.yaml` files.
- `examples/hexy-engine.scl.yaml` → Full example using the Hexy Engine module.
- `diagrams/hexy-engine-process-flow.mmd` → Mermaid diagram for process flow.
- `syntaxes/sol.tmLanguage.json` → TextMate grammar for syntax highlighting.

---

## 🛠 Installation (Local Development)

1. Open VS Code or Cursor.
2. Clone or unzip this extension folder.
3. Run:
   ```bash
   npm install
   npm run compile
   ```
4. Press `F5` to launch a development version of VS Code with the extension loaded.
5. Open any `.sol.yaml` or `.sol.yml` file to see syntax support.

---

## 📁 Recommended File Structure

```
project/
├── operations/
│   ├── domain-model.sol.yaml
│   ├── onboarding-process.sol.yaml
│   └── observability.sol.yaml
```

---

## 📬 Feedback & Contributions

This is an early stage specification. For updates or contributions, join the HEXY community.
