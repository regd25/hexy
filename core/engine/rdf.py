"""
Mini triple-store RDF (sin dependencias; sustituye a rdflib para lo que usa el proyector):
construir triples en memoria, contar y serializar a Turtle con prefijos. Sin SPARQL ni
parsing de RDF externo.
"""

from __future__ import annotations


class URIRef(str):
    """Un IRI. Subclase de str para poder usarse como clave/valor sin fricción."""

    __slots__ = ()


class Literal(str):
    """Un literal (string). El escapado ocurre al serializar."""

    __slots__ = ()


class Namespace(str):
    """Base de IRIs: HEXY['abc'] → URIRef('https://hexy.dev/onto#abc')."""

    __slots__ = ()

    def __getitem__(self, key):
        return URIRef(self + str(key))

    def __getattr__(self, key):
        if key.startswith("__"):
            raise AttributeError(key)
        return URIRef(self + key)


class _RDFNS:
    type = URIRef("http://www.w3.org/1999/02/22-rdf-syntax-ns#type")


class _RDFSNS:
    label = URIRef("http://www.w3.org/2000/01/rdf-schema#label")


RDF = _RDFNS()
RDFS = _RDFSNS()

_BASE_PREFIXES = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
}


def _escape_literal(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n").replace("\t", "\\t")


class Graph:
    """Conjunto ordenado de triples (s, p, o) con serialización Turtle."""

    def __init__(self):
        self._triples: list = []
        self._seen: set = set()
        self._prefixes: dict = dict(_BASE_PREFIXES)

    def bind(self, prefix: str, namespace: str):
        self._prefixes[prefix] = str(namespace)

    def add(self, triple):
        if triple in self._seen:
            return
        self._seen.add(triple)
        self._triples.append(triple)

    def __len__(self):
        return len(self._triples)

    def _term(self, term) -> str:
        if isinstance(term, Literal) or not isinstance(term, URIRef):
            return f'"{_escape_literal(str(term))}"'
        s = str(term)
        if s == str(RDF.type):
            return "a"  # azúcar estándar de Turtle
        for prefix, base in self._prefixes.items():
            if s.startswith(base):
                local = s[len(base):]
                if local and all(c.isalnum() or c in "-_" for c in local):
                    return f"{prefix}:{local}"
        return f"<{s}>"

    def serialize(self, format: str = "turtle") -> str:
        if format != "turtle":
            raise ValueError(f"formato no soportado: {format}")
        lines = [f"@prefix {p}: <{ns}> ." for p, ns in sorted(self._prefixes.items())]
        lines.append("")
        for s, p, o in self._triples:
            lines.append(f"{self._term(s)} {self._term(p)} {self._term(o)} .")
        return "\n".join(lines) + "\n"
