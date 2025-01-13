# Hexy 🔷

Hexy: A framework for event-driven architectures and Domain-Driven Design, built for simplicity, scalability, and empowering developers to focus on business value. 🚀

## 🏗️ Architecture Overview

This project follows a strict Hexagonal Architecture pattern, also known as Ports and Adapters, with the following key components:

```
src/
├── shared/           # Shared kernel with common domain components
│   └── domain/
│       └── value_object/  # Immutable value objects
├── context/          # Bounded contexts
│   └── [domain]/
│       ├── application/   # Use cases & application services
│       ├── domain/       # Domain model & business rules
│       └── infrastructure/ # External adapters & implementations
```

## 🎯 Key Features

- **Domain-Driven Design**: Strong focus on domain modeling and business rules
- **Value Objects**: Comprehensive suite of immutable value objects for type safety
- **Modern Python**: Type hints, dataclasses, and modern Python features
- **SOLID Principles**: Adherence to SOLID design principles
- **Clean Architecture**: Clear separation of concerns and dependencies

## 🧱 Value Objects

The project includes a rich set of value objects for common domain concepts:

- **Primitives**: `String`, `Integer`, `Float`, `Boolean`, `Enum`
- **Identity**: `Uuid`, `NumberId`, `RoutingKey`
- **DateTime**: `Date`, `Time`, `DateTime`
- **Contact**: `Email`, `PhoneNumber`, `Url`
- **Location**: `Address`, `ZipCode`, `City`, `State`
- **Monetary**: `Money`, `Currency`
- **Others**: `Temperature`, `Json`, `Hash`, `DocumentNumber`

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hexy.git
cd hexy
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## 📚 Documentation

Each module and value object is thoroughly documented with docstrings and type hints. For example:

```python
from src.shared.domain.value_object import EmailValueObject

email = EmailValueObject("user@example.com")
```

## 🧪 Testing

Run tests with:
```bash
pytest
```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ✨ Acknowledgments

- Inspired by DDD, Hexagonal Architecture, and SOLID principles
- Built with modern Python best practices
- Focused on maintainability and scalability
