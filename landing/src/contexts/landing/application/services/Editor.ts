import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"

/**
 * DualEditor – SCL Narrative ↔ YAML synchronized editor.
 * Palette references (from landing):
 *  - bg-slate-900          (main background)
 *  - text-teal-400         (highlights)
 *  - text-purple-400/500   (call‑to‑action & primary)
 *  - card bg-slate-800
 */
export default function DualEditor() {
  const [narrative, setNarrative] = useState<string>(
    "Cuando un Producto tiene menos de 5 unidades, el sistema debe enviar una alerta de reabastecimiento."
  )
  const [yaml, setYaml] = useState<string>(
    `Policy:\n  id: StockBajo\n  premise: >\n    Si Concepto:Producto tiene unidades < 5, emitir alerta a equipo de compras.`
  )

  // --- naïve converters (placeholders) ---
  const narrativeToYaml = (text: string) => {
    // ¡Stub! Replace with real NLP + template logic
    return `# Generado automáticamente\nPolicy:\n  id: Auto\n  premise: >\n    ${text}`
  }

  const yamlToNarrative = (code: string) => {
    // ¡Stub! Simple extractor of YAML premise line
    const match = code.match(/premise:\s*>\s*([\s\S]*)/)
    return match ? match[1].trim() : ""
  }

  return (
    <main className="min-h-screen bg-slate-900 p-6 md:p-12 text-slate-100 space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-5xl font-semibold text-center text-teal-400"
      >
        Dual SCL Editor
      </motion.h1>

      <p className="max-w-3xl mx-auto text-center text-slate-300">
        Escribe en{" "}
        <span className="text-purple-400 font-medium">lenguaje natural</span> o
        edita el{" "}
        <span className="text-purple-400 font-medium">YAML estructurado</span>.
        El editor sincroniza ambos formatos para mantener la semántica intacta.
      </p>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Narrative Card */}
        <Card className="bg-slate-800/80 backdrop-blur-lg border-slate-700">
          <CardHeader>
            <CardTitle className="text-teal-400">Narrative</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              rows={10}
              className="bg-slate-900/60 text-white border-slate-700 focus:ring-purple-500/60"
            />
            <Button
              onClick={() => setYaml(narrativeToYaml(narrative))}
              className="bg-purple-500 hover:bg-purple-600 w-full"
            >
              Convertir a YAML
            </Button>
          </CardContent>
        </Card>

        {/* YAML Card */}
        <Card className="bg-slate-800/80 backdrop-blur-lg border-slate-700">
          <CardHeader>
            <CardTitle className="text-teal-400">YAML</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={yaml}
              onChange={(e) => setYaml(e.target.value)}
              rows={10}
              className="font-mono text-white bg-slate-900/60 border-slate-700 focus:ring-purple-500/60 text-sm"
            />
            <Button
              variant="outline"
              onClick={() => setNarrative(yamlToNarrative(yaml))}
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10 w-full"
            >
              Convertir a Narrative
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
