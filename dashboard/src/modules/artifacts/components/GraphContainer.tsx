/**
 * GraphContainer - Semantic Artifact Graph Visualization
 * D3.js-based graph for visualizing artifacts and their relationships
 * Following simplified architecture with direct EventBus integration
 */

import React, { useRef, useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { useEventBus } from '../../../shared/event-bus'
import { ArtifactService } from '../services'
import {
    Artifact,
    TemporalArtifact,
    Relationship,
    ArtifactType,
    ARTIFACT_TYPES,
    CreateArtifactPayload
} from '../types'

interface GraphContainerProps {
    width?: number
    height?: number
    className?: string
}

interface D3Node extends d3.SimulationNodeDatum {
    id: string
    artifact: Artifact | TemporalArtifact
    type: ArtifactType
    isTemporary?: boolean
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
    id: string
    relationship: Relationship
}

/**
 * Semantic colors for different artifact types
 */
const ARTIFACT_COLORS = {
    [ARTIFACT_TYPES.PURPOSE]: '#3B82F6',      // Blue
    [ARTIFACT_TYPES.CONTEXT]: '#10B981',      // Green  
    [ARTIFACT_TYPES.AUTHORITY]: '#F59E0B',    // Amber
    [ARTIFACT_TYPES.EVALUATION]: '#EF4444',   // Red
    [ARTIFACT_TYPES.VISION]: '#8B5CF6',       // Purple
    [ARTIFACT_TYPES.POLICY]: '#EC4899',       // Pink
    [ARTIFACT_TYPES.PRINCIPLE]: '#06B6D4',    // Cyan
    [ARTIFACT_TYPES.GUIDELINE]: '#84CC16',    // Lime
    [ARTIFACT_TYPES.CONCEPT]: '#F97316',      // Orange
    [ARTIFACT_TYPES.INDICATOR]: '#6366F1',    // Indigo
    [ARTIFACT_TYPES.PROCESS]: '#14B8A6',      // Teal
    [ARTIFACT_TYPES.PROCEDURE]: '#A855F7',    // Violet
    [ARTIFACT_TYPES.EVENT]: '#F43F5E',        // Rose
    [ARTIFACT_TYPES.RESULT]: '#22C55E',       // Green
    [ARTIFACT_TYPES.OBSERVATION]: '#64748B',  // Slate
    [ARTIFACT_TYPES.ACTOR]: '#DC2626',        // Red
    [ARTIFACT_TYPES.AREA]: '#7C3AED',         // Purple
} as const

export const GraphContainer: React.FC<GraphContainerProps> = ({
    width = 800,
    height = 600,
    className = ''
}) => {
    const svgRef = useRef<SVGSVGElement>(null)
    const eventBus = useEventBus()
    const [artifacts, setArtifacts] = useState<Artifact[]>([])
    const [temporalArtifacts, setTemporalArtifacts] = useState<TemporalArtifact[]>([])
    const [relationships, setRelationships] = useState<Relationship[]>([])
    const [selectedNode, setSelectedNode] = useState<D3Node | null>(null)

    // ✅ Simplified service initialization
    const artifactService = useMemo(() => 
        new ArtifactService(eventBus), 
        [eventBus]
    )

    // ✅ Direct event subscriptions - no intermediate layers
    useEffect(() => {
        const unsubscribeArtifactCreated = eventBus.subscribe('artifact:created', ({ data }) => {
            if (data.source === 'artifacts-module') {
                setArtifacts(prev => [...prev, data.artifact])
            }
        })

        const unsubscribeArtifactUpdated = eventBus.subscribe('artifact:updated', ({ data }) => {
            if (data.source === 'artifacts-module') {
                setArtifacts(prev => 
                    prev.map(a => a.id === data.artifact.id ? data.artifact : a)
                )
            }
        })

        const unsubscribeArtifactDeleted = eventBus.subscribe('artifact:deleted', ({ data }) => {
            if (data.source === 'artifacts-module') {
                setArtifacts(prev => prev.filter(a => a.id !== data.id))
            }
        })

        const unsubscribeTemporalCreated = eventBus.subscribe('temporal:created', ({ data }) => {
            if (data.source === 'artifacts-module') {
                setTemporalArtifacts(prev => [...prev, data.temporal])
            }
        })

        const unsubscribeTemporalPromoted = eventBus.subscribe('temporal:promoted', ({ data }) => {
            if (data.source === 'artifacts-module') {
                setTemporalArtifacts(prev => 
                    prev.filter(t => t.temporaryId !== data.temporalId)
                )
            }
        })

        const unsubscribeRelationshipCreated = eventBus.subscribe('relationship:created', ({ data }) => {
            if (data.source === 'artifacts-module') {
                setRelationships(prev => [...prev, data.relationship])
            }
        })

        return () => {
            unsubscribeArtifactCreated()
            unsubscribeArtifactUpdated()
            unsubscribeArtifactDeleted()
            unsubscribeTemporalCreated()
            unsubscribeTemporalPromoted()
            unsubscribeRelationshipCreated()
        }
    }, [eventBus])

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const loadedArtifacts = await artifactService.getAllArtifacts()
                setArtifacts(loadedArtifacts)
            } catch (error) {
                console.error('Error loading artifacts:', error)
            }
        }
        loadData()
    }, [artifactService])

    // Prepare D3 data
    const { nodes, links } = useMemo(() => {
        const allNodes: D3Node[] = [
            // Permanent artifacts
            ...artifacts.map(artifact => ({
                id: artifact.id,
                artifact,
                type: artifact.type,
                x: artifact.visualProperties.x,
                y: artifact.visualProperties.y,
                isTemporary: false
            })),
            // Temporal artifacts
            ...temporalArtifacts.map(temporal => ({
                id: temporal.temporaryId,
                artifact: temporal,
                type: temporal.type,
                x: temporal.visualProperties.x,
                y: temporal.visualProperties.y,
                isTemporary: true
            }))
        ]

        const allLinks: D3Link[] = relationships.map(relationship => ({
            id: relationship.id,
            source: relationship.sourceId,
            target: relationship.targetId,
            relationship
        }))

        return { nodes: allNodes, links: allLinks }
    }, [artifacts, temporalArtifacts, relationships])

    // D3.js visualization
    useEffect(() => {
        if (!svgRef.current || nodes.length === 0) return

        const svg = d3.select(svgRef.current)
        svg.selectAll('*').remove() // Clear previous render

        // Create main group for zoom/pan
        const g = svg.append('g')

        // Setup zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform)
            })

        svg.call(zoom)

        // Create simulation
        const simulation = d3.forceSimulation<D3Node>(nodes)
            .force('link', d3.forceLink<D3Node, D3Link>(links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(30))

        // Create links
        const link = g.append('g')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('stroke', '#64748B')
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0.6)

        // Create nodes
        const node = g.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('r', d => d.isTemporary ? 15 : 20)
            .attr('fill', d => ARTIFACT_COLORS[d.type] || '#64748B')
            .attr('stroke', d => d.isTemporary ? '#94A3B8' : '#1F2937')
            .attr('stroke-width', d => d.isTemporary ? 2 : 3)
            .attr('stroke-dasharray', d => d.isTemporary ? '5,5' : 'none')
            .attr('opacity', d => d.isTemporary ? 0.7 : 1)
            .style('cursor', 'pointer')
            .call(d3.drag<SVGCircleElement, D3Node>()
                .on('start', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart()
                    d.fx = d.x
                    d.fy = d.y
                })
                .on('drag', (event, d) => {
                    d.fx = event.x
                    d.fy = event.y
                })
                .on('end', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0)
                    d.fx = null
                    d.fy = null
                })
            )

        // Add labels
        const labels = g.append('g')
            .selectAll('text')
            .data(nodes)
            .enter()
            .append('text')
            .text(d => d.artifact.name.substring(0, 20) + (d.artifact.name.length > 20 ? '...' : ''))
            .attr('font-size', '12px')
            .attr('font-family', 'system-ui, sans-serif')
            .attr('fill', '#F8FAFC')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .style('pointer-events', 'none')
            .style('user-select', 'none')

        // Node click handler
        node.on('click', (event, d) => {
            event.stopPropagation()
            setSelectedNode(d)
        })

        // Canvas click handler for creating new artifacts
        svg.on('click', async (event) => {
            if (event.target === svgRef.current) {
                const [x, y] = d3.pointer(event, g.node())
                await handleCreateArtifact(x, y)
            }
        })

        // Update positions on simulation tick
        simulation.on('tick', () => {
            link
                .attr('x1', d => (d.source as D3Node).x!)
                .attr('y1', d => (d.source as D3Node).y!)
                .attr('x2', d => (d.target as D3Node).x!)
                .attr('y2', d => (d.target as D3Node).y!)

            node
                .attr('cx', d => d.x!)
                .attr('cy', d => d.y!)

            labels
                .attr('x', d => d.x!)
                .attr('y', d => d.y!)
        })

        return () => {
            simulation.stop()
        }
    }, [nodes, links, width, height])

    // Handle artifact creation
    const handleCreateArtifact = async (x: number, y: number) => {
        try {
            const payload: CreateArtifactPayload = {
                name: 'New Artifact',
                type: ARTIFACT_TYPES.PURPOSE,
                description: 'Click to edit this artifact',
                coordinates: { x, y }
            }

            // Create temporal artifact first
            await artifactService.createTemporalArtifact(payload)
        } catch (error) {
            console.error('Error creating artifact:', error)
        }
    }

    return (
        <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
            <svg
                ref={svgRef}
                width={width}
                height={height}
                className="w-full h-full"
                style={{ background: 'radial-gradient(circle, #1F2937 0%, #111827 100%)' }}
            />
            
            {/* Instructions overlay */}
            <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-90 rounded-lg p-3 text-sm text-gray-300">
                <div className="font-medium text-white mb-1">Graph Controls</div>
                <div>• Click empty space to create artifact</div>
                <div>• Click node to select/edit</div>
                <div>• Drag nodes to reposition</div>
                <div>• Scroll to zoom, drag to pan</div>
            </div>

            {/* Node info panel */}
            {selectedNode && (
                <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-95 rounded-lg p-4 max-w-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white">
                            {selectedNode.artifact.name}
                        </h3>
                        <button
                            onClick={() => setSelectedNode(null)}
                            className="text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="text-sm text-gray-300 space-y-1">
                        <div>Type: <span className="text-white">{selectedNode.type}</span></div>
                        <div>Status: <span className="text-white">
                            {selectedNode.isTemporary ? 'Draft' : 'Published'}
                        </span></div>
                        <div className="mt-2 text-xs text-gray-400">
                            {selectedNode.artifact.description}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default GraphContainer