"""
Grafo dirigido mínimo + algoritmos (sin dependencias; sustituye a networkx).

Cubre exactamente lo que usa el proyector: DiGraph con grados, cierre transitivo
(BFS por nodo) y enumeración de ciclos elementales. Pensado para modelos pequeños
(decenas/cientos de nodos), no para grafos masivos.

Nota: se llama `graphs` y no `graphlib` para no hacer sombra al módulo homónimo
de la stdlib de Python (graphlib.TopologicalSorter).
"""

from __future__ import annotations

from collections import deque


class DiGraph:
    """Grafo dirigido con dict de adyacencia (sucesores) y su inverso (predecesores)."""

    def __init__(self):
        self._succ: dict = {}
        self._pred: dict = {}

    # --- construcción ---
    def add_node(self, n):
        self._succ.setdefault(n, set())
        self._pred.setdefault(n, set())

    def add_nodes_from(self, nodes):
        for n in nodes:
            self.add_node(n)

    def add_edge(self, u, v):
        self.add_node(u)
        self.add_node(v)
        self._succ[u].add(v)
        self._pred[v].add(u)

    def add_edges_from(self, edges):
        for u, v in edges:
            self.add_edge(u, v)

    # --- consultas ---
    @property
    def nodes(self):
        return list(self._succ)

    def successors(self, n):
        return self._succ.get(n, set())

    def edges(self):
        return [(u, v) for u, targets in self._succ.items() for v in targets]

    def number_of_edges(self):
        return sum(len(t) for t in self._succ.values())

    def in_degree(self, n):
        return len(self._pred.get(n, ()))

    def out_degree(self, n):
        return len(self._succ.get(n, ()))


def transitive_closure(g: DiGraph) -> DiGraph:
    """
    Cierre transitivo: (u, v) para todo v alcanzable desde u por un camino de largo >= 1.
    Igual que nx.transitive_closure(g, reflexive=False): (u, u) solo aparece si u está
    en un ciclo real.
    """
    closure = DiGraph()
    closure.add_nodes_from(g.nodes)
    for u in g.nodes:
        reachable = set()
        q = deque(g.successors(u))
        while q:
            v = q.popleft()
            if v in reachable:
                continue
            reachable.add(v)
            q.extend(g.successors(v))
        for v in reachable:
            closure.add_edge(u, v)
    return closure


def simple_cycles(g: DiGraph):
    """
    Ciclos elementales de un grafo dirigido, cada uno una sola vez (invariante a rotación).
    Estrategia: se fija un orden total de nodos y solo se enumeran ciclos cuyo nodo mínimo
    es el punto de partida, con DFS restringido a nodos >= ese mínimo. Suficiente y simple
    para el tamaño de nuestros modelos.
    """
    order = {n: i for i, n in enumerate(sorted(g.nodes, key=str))}
    cycles = []

    def dfs(start, node, path, on_path):
        for nxt in sorted(g.successors(node), key=str):
            if nxt == start:
                cycles.append(list(path))
            elif order[nxt] > order[start] and nxt not in on_path:
                path.append(nxt)
                on_path.add(nxt)
                dfs(start, nxt, path, on_path)
                on_path.discard(nxt)
                path.pop()

    for start in sorted(g.nodes, key=str):
        dfs(start, start, [start], {start})
    return cycles
