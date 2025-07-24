// Ask: Can you confirm the intended behavior when resizing the window or initial viewport size? Should the graph always center?

// ---- Helpers ----
function getId(n) {
  return typeof n === "object" ? n.id : n
}
function parseArtifacts(text) {
  const lines = text.split("\n")
  const nodes = [],
    links = []
  let currentType = null
  const typeMap = {
    Contextos: "context",
    Actores: "actor",
    Conceptos: "concept",
    Procesos: "process",
  }
  const nodeMap = {} // Para mapear IDs a objetos de nodo
  const referencedNodes = new Set() // Para rastrear nodos referenciados pero no definidos

  // Primera pasada: crear todos los nodos explícitamente definidos
  lines.forEach((line) => {
    const catMatch = line.trim().match(/^([A-Za-zÁÉÍÓÚÑáéíóú]+)$/)
    if (catMatch && typeMap[catMatch[1]]) {
      currentType = typeMap[catMatch[1]]
      return
    }
    const itemMatch = line.match(/^\s*-\s*([^:]+):\s*(.*)$/)
    if (itemMatch && currentType) {
      const name = itemMatch[1].trim()
      const rawId = name.replace(/\s+/g, "")
      const info = itemMatch[2].trim()
      const node = { id: rawId, name: name, type: currentType, info }
      nodes.push(node)
      nodeMap[rawId] = node // Guardar referencia al objeto nodo
      
      // Buscar todas las referencias en la descripción
      const refs = [...info.matchAll(/@([A-Za-zÁÉÍÓÚÑáéíóú0-9-]+)/g)].map((m) => m[1])
      refs.forEach((ref) => {
        // Normalizar el ID de referencia (eliminar espacios)
        const refId = ref.replace(/\s+/g, "")
        referencedNodes.add(refId) // Añadir a la lista de nodos referenciados
      })
    }
  })

  // Crear nodos para referencias que no existen explícitamente
  referencedNodes.forEach((refId) => {
    if (!nodeMap[refId]) {
      // Si el nodo no existe, crearlo como un nodo de tipo "referencia"
      const node = {
        id: refId,
        name: refId, // Usar el ID como nombre
        type: "reference", // Tipo especial para nodos referenciados pero no definidos
        info: `Artefacto referenciado pero no definido explícitamente. Para definirlo, añádelo en la sección correspondiente con el formato: "- ${refId}: Descripción del artefacto"`
      }
      nodes.push(node)
      nodeMap[refId] = node
    }
  })

  // Segunda pasada: crear enlaces entre todos los nodos
  lines.forEach((line) => {
    const itemMatch = line.match(/^\s*-\s*([^:]+):\s*(.*)$/)
    if (itemMatch) {
      const name = itemMatch[1].trim()
      const rawId = name.replace(/\s+/g, "")
      const info = itemMatch[2].trim()
      const refs = [...info.matchAll(/@([A-Za-zÁÉÍÓÚÑáéíóú0-9-]+)/g)].map((m) => m[1])
      
      refs.forEach((ref) => {
        // Normalizar el ID de referencia
        const refId = ref.replace(/\s+/g, "")
        // Crear enlace (ahora todos los nodos deberían existir)
        if (nodeMap[rawId] && nodeMap[refId]) {
          links.push({
            source: nodeMap[rawId],
            target: nodeMap[refId],
            weight: 1,
          })
        }
      })
    }
  })

  return { nodes, links }
}

// ---- D3 & Zoom Setup ----
const svg = d3.select("#graph")
const svgEl = document.getElementById("graph")
const width = svgEl.clientWidth
const height = svgEl.clientHeight

const g = svg.append("g")
const linkGroup = g.append("g")
const nodeGroup = g.append("g")

svg.call(
  d3
    .zoom()
    .scaleExtent([0.2, 5])
    .on("zoom", ({ transform }) => g.attr("transform", transform))
)

// Arrow marker
svg
  .append("defs")
  .append("marker")
  .attr("id", "arrow")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 22)
  .attr("refY", 0)
  .attr("markerWidth", 6)
  .attr("markerHeight", 6)
  .attr("orient", "auto")
  .append("path")
  .attr("d", "M0,-5L10,0L0,5")
  .attr("fill", "#90a4ae")
  .attr("opacity", 0.9)

let nodes = [],
  links = []
const COLORS = {
  context: "#3949ab",
  actor: "#43a047",
  concept: "#ff7043",
  process: "#26c6da",
  reference: "#9e9e9e" // Color gris para nodos referenciados pero no definidos
}

const simulation = d3
  .forceSimulation(nodes)
  .force(
    "link",
    d3
      .forceLink(links)
      .id((d) => d.id)
      .distance(120)
      .strength(0.7)
  )
  .force("charge", d3.forceManyBody().strength(-400))
  .force("center", d3.forceCenter(width / 2, height / 2))

function refresh(restart = true) {
  // Links - asegurarse de que todos los enlaces tienen nodos válidos
  const validLinks = links.filter(
    (link) =>
      typeof link.source === "object" &&
      link.source !== null &&
      typeof link.target === "object" &&
      link.target !== null
  )

  const lk = linkGroup
    .selectAll("line")
    .data(validLinks, (d) => `${getId(d.source)}->${getId(d.target)}`)
  lk.exit().remove()
  lk.enter()
    .append("line")
    .attr("class", "link")
    .attr("marker-end", "url(#arrow)")
    .attr("stroke-width", (d) => d.weight)

  // Nodes
  const nd = nodeGroup.selectAll("g").data(nodes, (d) => d.id)
  nd.exit().remove()
  const ne = nd
    .enter()
    .append("g")
    .attr("class", "node")
    .call(
      d3.drag().on("start", dragStart).on("drag", dragging).on("end", dragEnd)
    )
    .on("contextmenu", showContextMenu)
    .on("mouseover", (e, d) => {
      tooltip.style.display = "block"
      tooltip.textContent = d.info
    })
    .on("mousemove", (e) => {
      tooltip.style.left = `${e.pageX + 10}px`
      tooltip.style.top = `${e.pageY + 10}px`
    })
    .on("mouseout", () => {
      tooltip.style.display = "none"
    })

  ne.append("circle")
    .attr("r", d => d.type === 'reference' ? 20 : 28) // Nodos de referencia más pequeños
    .attr("fill", (d) => COLORS[d.type] || "#ccc")
    .attr("stroke", d => d.type === 'reference' ? '#616161' : 'none') // Borde para nodos de referencia
    .attr("stroke-width", d => d.type === 'reference' ? 2 : 0)
    .attr("stroke-dasharray", d => d.type === 'reference' ? '3,3' : 'none') // Borde punteado para referencias
  ne.append("text")
    .attr("y", 4)
    .attr("text-anchor", "middle")
    .text((d) => d.id)

  simulation.nodes(nodes)
  simulation.force("link").links(links)
  if (restart) {
    simulation.alpha(0.3).restart()
  }
}

simulation.on("tick", () => {
  linkGroup
    .selectAll("line")
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y)
  nodeGroup.selectAll("g").attr("transform", (d) => `translate(${d.x},${d.y})`)
})

function dragStart(e, d) {
  if (!e.active) simulation.alphaTarget(0.3).restart()
  d.fx = d.x
  d.fy = d.y
}
function dragging(e, d) {
  d.fx = e.x
  d.fy = e.y
}
function dragEnd(e, d) {
  if (!e.active) simulation.alphaTarget(0)
  d.fx = null
  d.fy = null
}

// ---- Editor Integration ----
const editor = document.getElementById("editor")

const defaultText = `Contextos
  - Hexy: Hexy es un framework de contexto organizacional, ayuda a los LLMs a apegarse fuertemente a la lógica de operación del negocio de manera optimizado, escalable y ejecutable
Actores
  - Operador: Todo humano que interactúa con alguna interfaz de @Hexy, tiene un rol
  - OperadorBasico: Operador con hasta 3 meses de experiencia en Hexy
  - AgenteDeOnboarding: Agente encargado de realizar el onboarding a la ontología organizacional
Conceptos
  - Concepto: Representación semántica de una entidad dentro de la ontología
  - Proceso: Secuencia de pasos estructurados que definen actividades en la organización
  - Protocolo: Conjunto de reglas para comunicación
  - Artefacto: Objetos semánticos en la ontología
  - Propósito: Motivo u objetivo que guía un artefacto
  - Guideline: Recomendaciones para acciones específicas
  - Política: Reglas obligatorias de cumplimiento
  - ArtefactoFundacional: Contextos, Propósitos, Autoridad o Evaluación base
  - ArtefactoEstrategico: Políticas, Conceptos, Principios, Guidelines, Indicadores
  - ArtefactoOperativo: Procesos, Procedimientos, Eventos, Observaciones, Resultados
  - ArtefactoOrganizacional: Actores, Áreas
`

editor.value = defaultText

let debounceTimer
editor.addEventListener("input", () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    const { nodes: nds, links: lks } = parseArtifacts(editor.value)
    nodes = nds
    links = lks
    // Asegurarse de que todos los enlaces tienen nodos válidos
    links = links.filter(
      (link) =>
        typeof link.source === "object" &&
        link.source !== null &&
        typeof link.target === "object" &&
        link.target !== null
    )
    refresh()
  }, 300)
})

// ---- Context Menu & Modal ----
const menu = document.getElementById("menu")
const tooltip = document.getElementById("tooltip")

const reverseTypeMap = {
  context: "Contextos",
  actor: "Actores",
  concept: "Conceptos",
  process: "Procesos",
  reference: "Referencias" // Categoría para nodos referenciados pero no definidos
}

function updateEditorText(node, oldType, newType) {
  const lines = editor.value.split("\n")
  const oldCategory = reverseTypeMap[oldType]
  const newCategory = reverseTypeMap[newType]
  const artifactLineRegex = new RegExp(`^\\s*-\s*${node.name}\\s*:.*$`)

  let lineToRemove = -1

  for (let i = 0; i < lines.length; i++) {
    if (artifactLineRegex.test(lines[i])) {
      lineToRemove = i
      break
    }
  }

  if (lineToRemove !== -1) {
    lines.splice(lineToRemove, 1)
  }

  let newCategoryLine = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === newCategory) {
      newCategoryLine = i
      break
    }
  }

  const artifactLineContent = `  - ${node.name}: ${node.info}`

  if (newCategoryLine !== -1) {
    lines.splice(newCategoryLine + 1, 0, artifactLineContent)
  } else {
    lines.push("")
    lines.push(newCategory)
    lines.push(artifactLineContent)
  }

  editor.value = lines.join("\n")
  editor.dispatchEvent(new Event("input"))
}

function showContextMenu(event, d) {
  const nodeElement = this
  event.preventDefault()
  menu.innerHTML = ""
  menu.style.display = "block"
  menu.style.left = `${event.pageX}px`
  menu.style.top = `${event.pageY}px`

  Object.keys(COLORS).forEach((type) => {
    const item = document.createElement("div")
    item.textContent = type
    item.className = "menu-item"
    item.onclick = () => {
      const oldType = d.type
      d.type = type
      d3.select(nodeElement)
        .select("circle")
        .transition()
        .duration(500)
        .style("fill", COLORS[type])
      menu.style.display = "none"
      updateEditorText(d, oldType, type)
    }
    menu.appendChild(item)
  })

  document.addEventListener("click", () => (menu.style.display = "none"), {
    once: true,
  })
}

function setupConfigModal() {
  const configBtn = document.createElement("button")
  configBtn.id = "config-btn"
  configBtn.textContent = "⚙️"
  document.getElementById("graph-container").appendChild(configBtn)

  const modal = document.createElement("div")
  modal.id = "config-modal"
  modal.className = "modal"
  modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2>Configuración de Colores</h2>
            <div id="color-config-inputs"></div>
            <button id="save-colors">Guardar</button>
        </div>
    `
  document.body.appendChild(modal)

  const colorConfigInputs = document.getElementById("color-config-inputs")
  Object.keys(COLORS).forEach((type) => {
    const label = document.createElement("label")
    label.textContent = type
    const input = document.createElement("input")
    input.type = "color"
    input.id = `color-${type}`
    input.value = COLORS[type]
    label.appendChild(input)
    colorConfigInputs.appendChild(label)
  })

  configBtn.onclick = () => (modal.style.display = "block")
  document.querySelector(".close-button").onclick = () =>
    (modal.style.display = "none")
  document.getElementById("save-colors").onclick = () => {
    Object.keys(COLORS).forEach((type) => {
      COLORS[type] = document.getElementById(`color-${type}`).value
    })
    modal.style.display = "none"
    refresh()
  }

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none"
    }
  }
}

// Initial load
;(() => {
  const { nodes: nd0, links: lk0 } = parseArtifacts(defaultText)
  nodes = nd0
  links = lk0

  // Asegurarse de que todos los enlaces tienen nodos válidos
  const validLinks = links.filter(
    (link) =>
      typeof link.source === "object" &&
      link.source !== null &&
      typeof link.target === "object" &&
      link.target !== null
  )

  simulation.nodes(nodes).force("link").links(validLinks)
  for (var i = 0; i < 300; ++i) simulation.tick()

  refresh(false)
  setupConfigModal()
})()
