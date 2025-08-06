import { Artifact } from '../shared/types/Artifact'

export interface GraphLink {
  source: string
  target: string
  type: string
  weight: number
  semantic: boolean
  justification?: string
}

export interface GraphNode extends Artifact {
  vx: number
  vy: number
  fx: number | null
  fy: number | null
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export class GraphService {
  private nodes: GraphNode[] = []
  private links: GraphLink[] = []
  private simulation: any = null
  private svg: any = null
  private g: any = null
  private linkGroup: any = null
  private nodeGroup: any = null
  private width: number = 800
  private height: number = 600
  private isCreatingLink: boolean = false
  private linkSource: GraphNode | null = null
  private tempLink: any = null

  constructor() {
    this.setupGraph()
  }

  private setupGraph() {
    // Esta función se implementará cuando integremos D3.js
    console.log('GraphService: setupGraph called')
  }

  public addNode(node: GraphNode) {
    const existingNode = this.nodes.find(n => n.id === node.id)
    if (existingNode) {
      this.updateNode(node)
    } else {
      this.nodes.push(node)
      this.refresh()
    }
  }

  public updateNode(node: GraphNode) {
    const index = this.nodes.findIndex(n => n.id === node.id)
    if (index !== -1) {
      this.nodes[index] = { ...this.nodes[index], ...node }
      this.refresh()
    }
  }

  public removeNode(nodeId: string) {
    this.nodes = this.nodes.filter(n => n.id !== nodeId)
    this.links = this.links.filter(l => l.source !== nodeId && l.target !== nodeId)
    this.refresh()
  }

  public addLink(link: GraphLink) {
    const existingLink = this.links.find(l => 
      l.source === link.source && l.target === link.target
    )
    if (!existingLink) {
      this.links.push(link)
      this.refresh()
    }
  }

  public removeLink(linkId: string) {
    this.links = this.links.filter(l => `${l.source}->${l.target}` !== linkId)
    this.refresh()
  }

  public refresh() {
    console.log('GraphService: refresh called with', this.nodes.length, 'nodes and', this.links.length, 'links')
    // Esta función se implementará cuando integremos D3.js
  }

  public getAllNodes(): GraphNode[] {
    return [...this.nodes]
  }

  public getAllLinks(): GraphLink[] {
    return [...this.links]
  }

  public getGraphData(): GraphData {
    return {
      nodes: this.getAllNodes(),
      links: this.getAllLinks()
    }
  }

  public updateGraph(nodes: GraphNode[], links: GraphLink[]) {
    this.nodes = [...nodes]
    this.links = [...links]
    this.refresh()
  }

  public highlightNodes(nodeIds: string[]) {
    // Esta función se implementará cuando integremos D3.js
    console.log('GraphService: highlightNodes called with', nodeIds)
  }

  public clearHighlights() {
    // Esta función se implementará cuando integremos D3.js
    console.log('GraphService: clearHighlights called')
  }

  public zoom(delta: number) {
    // Esta función se implementará cuando integremos D3.js
    console.log('GraphService: zoom called with delta', delta)
  }

  public pan(deltaX: number, deltaY: number) {
    // Esta función se implementará cuando integremos D3.js
    console.log('GraphService: pan called with', deltaX, deltaY)
  }

  public resize(width: number, height: number) {
    this.width = width
    this.height = height
    console.log('GraphService: resize called with', width, height)
  }

  public destroy() {
    if (this.simulation) {
      this.simulation.stop()
    }
    this.nodes = []
    this.links = []
  }
} 