# Hexy

This repository contains the complete implementation of the **HEXY Semantic Runtime**, the system responsible for interpreting, validating, and executing artifacts defined in SOL (Semantic Context Language).

---

## 📋 Table of Contents

- [Hexy](#hexy)
  - [📋 Table of Contents](#-table-of-contents)
  - [🏗️ Project Modules](#️-project-modules)
  - [📦 Monorepo Structure](#-monorepo-structure)
  - [🛠️ Core Technologies](#️-core-technologies)
  - [🚀 Getting Started](#-getting-started)
  - [🔍 Project Objective](#-project-objective)
  - [🔐 Minimum Environment Requirements](#-minimum-environment-requirements)
  - [📄 License](#-license)
  - [👥 Contributors](#-contributors)

---

## 🏗️ Project Modules

| Module | Description |
|--------|-------------|
| **engine/** | Core semantic processing engine |
| └── **semantic-kernel/** | Core semantic validation engine that ensures all SOL artifacts comply with language conventions, maintain explicit narratives, grammatical alignment, axiom consistency, and traceability |
| **landing/** | Next.js web application providing the main user interface and landing page for the HEXY platform |
| **roadmap/** | Project roadmap documentation and planning artifacts in SOL format |
| **hexy_runtime.py** | Python runtime implementation for SOL artifact execution and validation |
| **hexy.sol.yaml** | Main SOL configuration file defining the HEXY organization structure and rules |
| **hexy-test.yaml** | Test scenarios and validation cases for SOL artifacts |

---

## 📦 Monorepo Structure

```
hexy-monorepo/
├── runtime-core/         # Core engine in Rust (parser, evaluator, governance, executor)
├── cli-agent/            # Command-line agent for human interaction and simulations
├── llm-evaluator/        # Python service for semantic evaluation using LLMs (optional)
├── web-ui/               # Web interface to visualize artifacts, flows, and logs
├── examples/             # Example SOL artifacts and test scenarios
├── test-suite/           # Automated tests for defined flows and rules
├── models/               # Local LLM models for offline environment evaluation
└── docs/                 # Language documentation and runtime structure
```

---

## 🛠️ Core Technologies

* **Rust** → runtime-core, CLI
* **Python** → optional LLM service (`llama-cpp`, `FastAPI`, `langchain`)
* **React + Tailwind** → administrative UI
* **SQLite / JSON Logs** → local storage for execution and state

---

## 🚀 Getting Started

1. Clone the repository
2. Make sure you have Rust and Python installed
3. Install LLM service dependencies if you use them

```bash
cargo build
python -m venv venv && source venv/bin/activate
pip install -r llm-evaluator/requirements.txt
```

4. Run a test scenario

```bash
cargo run --package cli-agent -- simulate examples/flujo_aprobacion.SOL.yaml
```

---

## 🔍 Project Objective

Transform the SOL language into a living and governed system that allows organizations to define their operational logic and execute it with traceability, validation, versioning, and human-in-the-loop control.

---

## 🔐 Minimum Environment Requirements

* CPU with AVX2 support for local models (optional)
* 1 GB RAM to run rules without model
* 8 GB RAM recommended if using local LLM

---

## 📄 License

MIT License

---

## 👥 Contributors

This repository is part of the HEXY project led by Randy Gala.
Contributions are made through PRs accompanied by SOL definitions.

> The future of living organizations is written in SOL ✨