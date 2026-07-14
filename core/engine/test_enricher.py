"""Tests del enriquecedor (Fase C): clamp anti-alucinación y parseo de .env. Sin red."""

import os
import tempfile
import unittest

from enricher import clamp_enrichment, load_env, collect_snippets


def _model():
    return {
        "artifacts": [
            {"id": "dir:lib", "type": "area", "name": "Lib", "description": "lib"},
            {"id": "drizzle:table:sales", "type": "concept", "name": "Sales", "description": "tabla drizzle «sales» (sales) — lib/schema.ts"},
        ],
        "relationships": [
            {"sourceId": "dir:lib", "targetId": "drizzle:table:sales", "type": "contains"},
        ],
    }


class TestClamp(unittest.TestCase):
    def test_valid_update_and_relationship_pass(self):
        raw = {
            "updates": [{"id": "drizzle:table:sales", "name": "Ventas", "description": "Registra cada venta. — ref: tabla drizzle «sales» (sales) — lib/schema.ts", "type": "concept"}],
            "relationships": [{"sourceId": "drizzle:table:sales", "targetId": "dir:lib", "type": "supports"}],
        }
        out = clamp_enrichment(raw, _model())
        self.assertEqual(out["updates"][0]["name"], "Ventas")
        self.assertEqual(len(out["relationships"]), 1)
        self.assertEqual(out["skipped"], [])

    def test_unknown_id_is_skipped(self):
        raw = {"updates": [{"id": "ghost", "name": "X", "type": "concept"}],
               "relationships": [{"sourceId": "ghost", "targetId": "dir:lib", "type": "supports"}]}
        out = clamp_enrichment(raw, _model())
        self.assertEqual(out["updates"], [])
        self.assertEqual(out["relationships"], [])
        self.assertEqual(len(out["skipped"]), 2)  # el LLM no puede inventar nodos

    def test_spanish_diacritics_are_normalized_not_rejected(self):
        raw = {"updates": [{"id": "drizzle:table:sales", "name": "Reseñas", "description": "d", "type": "concept"}]}
        out = clamp_enrichment(raw, _model())
        self.assertEqual(out["updates"][0]["name"], "Resenas")  # ñ → n, no se descarta
        self.assertEqual(out["skipped"], [])

    def test_recoverable_name_is_normalized(self):
        raw = {"updates": [{"id": "drizzle:table:sales", "name": "ventas mal!", "description": "d", "type": "concept"}]}
        out = clamp_enrichment(raw, _model())
        self.assertEqual(out["updates"][0]["name"], "VentasMal")  # se normaliza, no se descarta

    def test_bad_name_and_type_fall_back_to_current(self):
        raw = {"updates": [{"id": "drizzle:table:sales", "name": "!!!", "description": "d", "type": "tabla"}]}
        out = clamp_enrichment(raw, _model())
        u = out["updates"][0]
        self.assertEqual(u["name"], "Sales")  # nombre irrecuperable → conserva el actual
        self.assertEqual(u["type"], "concept")  # tipo fuera de ontología → conserva el actual
        self.assertEqual(len(out["skipped"]), 2)

    def test_reference_is_preserved_in_description(self):
        raw = {"updates": [{"id": "drizzle:table:sales", "name": "Ventas", "description": "Registra ventas.", "type": "concept"}]}
        out = clamp_enrichment(raw, _model())
        self.assertIn("lib/schema.ts", out["updates"][0]["description"])  # la ref no se pierde

    def test_selfloop_duplicate_and_bad_type_relationships(self):
        raw = {"relationships": [
            {"sourceId": "dir:lib", "targetId": "dir:lib", "type": "supports"},          # self-loop
            {"sourceId": "dir:lib", "targetId": "drizzle:table:sales", "type": "contains"},  # ya declarada
            {"sourceId": "dir:lib", "targetId": "drizzle:table:sales", "type": "governs"},   # tipo inválido
            {"sourceId": "dir:lib", "targetId": "drizzle:table:sales", "type": "supports"},
            {"sourceId": "dir:lib", "targetId": "drizzle:table:sales", "type": "supports"},  # duplicada en propuesta
        ]}
        out = clamp_enrichment(raw, _model())
        self.assertEqual(out["relationships"], [{"sourceId": "dir:lib", "targetId": "drizzle:table:sales", "type": "supports"}])


class TestEnv(unittest.TestCase):
    def test_load_env_reads_dotenv_local(self):
        tmp = tempfile.mkdtemp()
        with open(os.path.join(tmp, ".env.local"), "w", encoding="utf-8") as f:
            f.write("# comentario\nGEMINI_API_KEY=\"abc123\"\nOTRA=x\n")
        env = load_env(tmp)
        self.assertEqual(env["GEMINI_API_KEY"], "abc123")


class TestSnippets(unittest.TestCase):
    def test_collects_file_excerpt_and_dir_listing(self):
        tmp = tempfile.mkdtemp()
        os.makedirs(os.path.join(tmp, "lib"))
        with open(os.path.join(tmp, "lib", "schema.ts"), "w", encoding="utf-8") as f:
            f.write("export const sales = pgTable('sales', {})\n")
        model = {"artifacts": [
            {"id": "dir:lib", "type": "area", "name": "Lib", "description": "lib"},
            {"id": "mod:lib/schema.ts", "type": "concept", "name": "Schema", "description": "lib/schema.ts"},
            {"id": "x", "type": "concept", "name": "X", "description": "../fuera"},  # path traversal → ignorado
        ]}
        snippets = collect_snippets(model, tmp)
        by_id = {s["id"]: s for s in snippets}
        self.assertIn("pgTable", by_id["mod:lib/schema.ts"]["excerpt"])
        self.assertIn("schema.ts", by_id["dir:lib"]["excerpt"])  # listado de carpeta
        self.assertNotIn("x", by_id)


if __name__ == "__main__":
    unittest.main()
