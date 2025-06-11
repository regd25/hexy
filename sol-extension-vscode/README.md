
# SOL YAML Support for VS Code / Cursor

This extension provides syntax highlighting, schema validation, and structural support for `.sol.yaml` files written in **Semantic Orchestration Language (SOL)** —the operational language used by the HEXY Engine.

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

## 🔍 Features

- ✅ YAML/JSON structure validation against SOL schema.
- ✅ Syntax highlight for SOL keywords and semantic roles.
- ✅ Structured support for key SOL artefacts (`Vision`, `Process`, `Policy`, `Actor`, `Result`, etc.)
- ✅ Compatible with [Mermaid Live Editor](https://mermaid.live/) for graph rendering.

---

## 📁 Recommended File Structure

```
project/
├── sol/
│   ├── domain-model.sol.yaml
│   ├── onboarding-process.sol.yaml
│   └── observability.sol.yaml
```

---

## 📬 Feedback & Contributions

This is an early stage specification. For updates or contributions, join the HEXY community.
