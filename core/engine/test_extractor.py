"""Tests del extractor (Fase B): núcleo genérico JS/TS + Python y el adaptador drizzle."""

import os
import tempfile
import unittest

from extractor import extract_repo


def _write(root, rel, content):
    path = os.path.join(root, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(content)


class TestCoreJsTs(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        _write(self.tmp, "src/a.ts", "import { b } from './b'\nimport React from 'react'\n")
        _write(self.tmp, "src/b.ts", "export const b = 1\nimport { c } from './sub/c'\n")
        _write(self.tmp, "src/sub/c.ts", "export const c = 2\n")

    def _ids(self, g):
        return {a["id"] for a in g["artifacts"]}

    def _edges(self, g, rtype):
        return {(r["sourceId"], r["targetId"]) for r in g["relationships"] if r["type"] == rtype}

    def test_file_granularity_module_edges(self):
        g = extract_repo(self.tmp, {"granularity": "file"})
        ids = self._ids(g)
        self.assertIn("mod:src/a.ts", ids)
        self.assertIn("mod:src/sub/c.ts", ids)
        deps = self._edges(g, "depends_on")
        self.assertIn(("mod:src/a.ts", "mod:src/b.ts"), deps)   # ./b resuelto
        self.assertIn(("mod:src/b.ts", "mod:src/sub/c.ts"), deps)  # ./sub/c resuelto
        # El import externo 'react' NO produce arista interna.
        self.assertFalse(any(t == "mod:react" for _s, t in deps))

    def test_folder_granularity_aggregates(self):
        g = extract_repo(self.tmp, {"granularity": "folder"})
        ids = self._ids(g)
        # En modo folder no hay nodos de archivo, solo áreas.
        self.assertFalse(any(i.startswith("mod:") for i in ids))
        self.assertIn("dir:src", ids)
        self.assertIn("dir:src/sub", ids)
        deps = self._edges(g, "depends_on")
        # a.ts→b.ts es intra-carpeta (src→src): se ignora. b.ts→sub/c.ts cruza carpeta: src→src/sub.
        self.assertIn(("dir:src", "dir:src/sub"), deps)
        contains = self._edges(g, "contains")
        self.assertIn(("dir:src", "dir:src/sub"), contains)


class TestSolNaming(unittest.TestCase):
    def test_sol_name_convention(self):
        from extractor.core import sol_name

        # Convención SOL: ^[A-Z][a-zA-Z0-9]*$ (idFromName de serializeYaml.js)
        self.assertEqual(sol_name("sale_items"), "SaleItems")
        self.assertEqual(sol_name("[id]"), "Id")
        self.assertEqual(sol_name("foo.service"), "FooService")
        self.assertEqual(sol_name("región-ventas"), "RegionVentas")
        self.assertEqual(sol_name("123abc"), "A123abc")
        self.assertEqual(sol_name(""), "Unnamed")

    def test_extracted_names_follow_convention(self):
        import re as _re

        tmp = tempfile.mkdtemp()
        _write(tmp, "my-app/user_hooks/use-data.ts", "export const x = 1\n")
        g = extract_repo(tmp, {"granularity": "file"})
        pattern = _re.compile(r"^[A-Z][a-zA-Z0-9]*$")
        for a in g["artifacts"]:
            self.assertRegex(a["name"], pattern, f"nombre fuera de convención: {a['name']!r} ({a['id']})")
        # La referencia cruda se conserva en description.
        by_id = {a["id"]: a for a in g["artifacts"]}
        self.assertEqual(by_id["mod:my-app/user_hooks/use-data.ts"]["name"], "UseData")
        self.assertEqual(by_id["mod:my-app/user_hooks/use-data.ts"]["description"], "my-app/user_hooks/use-data.ts")


class TestMaxDepth(unittest.TestCase):
    def test_deep_folders_aggregate_to_ancestor(self):
        tmp = tempfile.mkdtemp()
        _write(tmp, "src/deep/nested/far/a.ts", "import { b } from '../../../top/b'\n")
        _write(tmp, "src/top/b.ts", "export const b = 1\n")
        g = extract_repo(tmp, {"granularity": "folder", "maxDepth": 2})
        ids = {a["id"] for a in g["artifacts"]}
        # Las carpetas profundas colapsan en su ancestro de nivel 2.
        self.assertIn("dir:src/deep", ids)
        self.assertIn("dir:src/top", ids)
        self.assertNotIn("dir:src/deep/nested", ids)
        self.assertNotIn("dir:src/deep/nested/far", ids)
        # La arista se re-ancla a los ancestros (no se pierde).
        deps = {(r["sourceId"], r["targetId"]) for r in g["relationships"] if r["type"] == "depends_on"}
        self.assertIn(("dir:src/deep", "dir:src/top"), deps)


class TestCorePythonDogfood(unittest.TestCase):
    def test_engine_self_import_graph(self):
        # Corre sobre el propio core/engine: prueba resolución de imports Python planos.
        here = os.path.dirname(os.path.abspath(__file__))
        g = extract_repo(here, {"granularity": "file", "languages": ["python"], "adapters": "off"})
        deps = {(r["sourceId"], r["targetId"]) for r in g["relationships"] if r["type"] == "depends_on"}
        self.assertIn(("mod:app.py", "mod:projector.py"), deps)
        self.assertIn(("mod:app.py", "mod:runtime.py"), deps)


class TestDrizzleAdapter(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        _write(
            self.tmp,
            "lib/schema.ts",
            """
            export const users = pgTable('users', {
              id: text('id').primaryKey(),
            })
            export const orders = pgTable('orders', {
              id: text('id').primaryKey(),
              userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
              refId: text('ref').references((): any => users.id),
            })
            """,
        )

    def test_tables_become_concepts_and_fks_become_depends_on(self):
        g = extract_repo(self.tmp)
        self.assertIn("drizzle", g["stats"]["adapters"])
        concepts = {a["name"] for a in g["artifacts"] if a["id"].startswith("drizzle:table:")}
        self.assertEqual(concepts, {"Users", "Orders"})  # convención SOL: PascalCase
        deps = {(r["sourceId"], r["targetId"]) for r in g["relationships"] if r["type"] == "depends_on"}
        self.assertIn(("drizzle:table:orders", "drizzle:table:users"), deps)  # ambas formas de references()

    def test_adapter_absent_without_signal(self):
        tmp = tempfile.mkdtemp()
        _write(tmp, "app.py", "x = 1\n")
        g = extract_repo(tmp)
        self.assertEqual(g["stats"]["adapters"], [])  # sin schema drizzle → adaptador no dispara
        self.assertGreaterEqual(g["stats"]["nodes"], 1)  # el núcleo igual devuelve el grafo


class TestRealGatonica(unittest.TestCase):
    def test_gatonica_frontend_schema(self):
        root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "gatonica", "frontend")
        if not os.path.isdir(root):
            self.skipTest("gatonica/frontend no disponible")
        g = extract_repo(root)
        concepts = [a for a in g["artifacts"] if a["id"].startswith("drizzle:table:")]
        fks = [r for r in g["relationships"] if r["sourceId"].startswith("drizzle:") and r["type"] == "depends_on"]
        self.assertGreaterEqual(len(concepts), 25)
        self.assertGreaterEqual(len(fks), 60)


if __name__ == "__main__":
    unittest.main()
