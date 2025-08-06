import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { useEventBus } from '../../../shared/event-bus/useEventBus'
import { ArtifactService } from '../services'
import { Artifact, CreateArtifactPayload } from '../types'
import * as d3 from 'd3'

export const useGraphCanvas = () => {
    const eventBus = useEventBus()
    const svgRef = useRef<SVGSVGElement>(null)

    const artifactService = useMemo(
        () => new ArtifactService(eventBus),
        [eventBus]
    )

    const [artifacts, setArtifacts] = useState<Artifact[]>([])

    useEffect(() => {
        const unsubscribeCreated = eventBus.subscribe(
            'artifact:created',
            ({ data }) => {
                if (data.source === 'artifacts-module') {
                    setArtifacts(prev => [...prev, data.artifact])
                }
            }
        )

        const unsubscribeUpdated = eventBus.subscribe(
            'artifact:updated',
            ({ data }) => {
                if (data.source === 'artifacts-module') {
                    setArtifacts(prev =>
                        prev.map(artifact =>
                            artifact.id === data.artifact.id
                                ? data.artifact
                                : artifact
                        )
                    )
                }
            }
        )

        const unsubscribeDeleted = eventBus.subscribe(
            'artifact:deleted',
            ({ data }) => {
                if (data.source === 'artifacts-module') {
                    setArtifacts(prev =>
                        prev.filter(artifact => artifact.id !== data.id)
                    )
                }
            }
        )

        const loadArtifacts = async () => {
            try {
                const allArtifacts = await artifactService.getAllArtifacts()
                setArtifacts(allArtifacts)
            } catch (error) {
                // Silent error handling for artifact loading
            }
        }

        loadArtifacts()

        return () => {
            unsubscribeCreated()
            unsubscribeUpdated()
            unsubscribeDeleted()
        }
    }, [eventBus, artifactService])

    const updateArtifact = useCallback(async (
        id: string,
        updates: Partial<Artifact>
    ): Promise<void> => {
        try {
            await artifactService.updateArtifact(id, { id, ...updates })
        } catch (error) {
            // Silent error handling for artifact update
        }
    }, [artifactService])

    const createArtifact = useCallback(async (
        payload: CreateArtifactPayload
    ): Promise<Artifact | null> => {
        try {
            return await artifactService.createArtifact(payload)
        } catch (error) {
            // Silent error handling for artifact creation
            return null
        }
    }, [artifactService])

    const deleteArtifact = useCallback(async (id: string): Promise<boolean> => {
        try {
            return await artifactService.deleteArtifact(id)
        } catch (error) {
            // Silent error handling for artifact deletion
            return false
        }
    }, [artifactService])

    const initializeCanvas = useCallback(() => {
        if (!svgRef.current) return

        const svg = d3.select(svgRef.current)
        const width = 800
        const height = 600

        svg.attr('width', width).attr('height', height)

        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 10])
            .on('zoom', event => {
                svg.select('.canvas-group').attr('transform', event.transform)
            })

        svg.call(zoom)

        if (svg.select('.canvas-group').empty()) {
            svg.append('g').attr('class', 'canvas-group')
        }
    }, [])

    const renderArtifacts = useCallback(() => {
        if (!svgRef.current) return

        const svg = d3.select(svgRef.current)
        const canvasGroup = svg.select('.canvas-group')

        const nodes = canvasGroup
            .selectAll<SVGGElement, Artifact>('.artifact-node')
            .data(artifacts, (d: Artifact) => d.id)

        nodes.exit().remove()

        const nodeEnter = nodes
            .enter()
            .append('g')
            .attr('class', 'artifact-node')
            .attr(
                'transform',
                (d: Artifact) =>
                    `translate(${d.coordinates.x}, ${d.coordinates.y})`
            )

        nodeEnter
            .append('circle')
            .attr('r', (d: Artifact) => d.visualProperties.radius || 20)
            .attr('fill', (d: Artifact) => d.visualProperties.color)
            .attr(
                'stroke',
                (d: Artifact) => d.visualProperties.strokeColor || '#374151'
            )
            .attr(
                'stroke-width',
                (d: Artifact) => d.visualProperties.strokeWidth || 2
            )

        nodeEnter
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .style('font-size', '12px')
            .style('fill', 'white')
            .text((d: Artifact) => d.name.substring(0, 15))

        nodes
            .merge(nodeEnter)
            .attr(
                'transform',
                (d: Artifact) =>
                    `translate(${d.coordinates.x}, ${d.coordinates.y})`
            )

        const dragHandler = d3
            .drag<SVGGElement, Artifact>()
            .on('start', function () {
                d3.select(this).raise()
            })
            .on('drag', function (event, d) {
                d.coordinates.x = event.x
                d.coordinates.y = event.y
                d3.select(this).attr(
                    'transform',
                    `translate(${event.x}, ${event.y})`
                )
            })
            .on('end', async function (event, d) {
                await updateArtifact(d.id, {
                    coordinates: { x: event.x, y: event.y },
                })
            })

        nodeEnter.call(dragHandler)
    }, [artifacts, updateArtifact])

    const resetCanvas = useCallback(() => {
        if (!svgRef.current) return

        const svg = d3.select(svgRef.current)
        svg.select('.canvas-group').selectAll('*').remove()
    }, [])

    const fitToViewport = useCallback(() => {
        if (!svgRef.current || artifacts.length === 0) return

        const svg = d3.select(svgRef.current)

        const bounds = {
            x: d3.min(artifacts, d => d.coordinates.x) || 0,
            y: d3.min(artifacts, d => d.coordinates.y) || 0,
            maxX: d3.max(artifacts, d => d.coordinates.x) || 0,
            maxY: d3.max(artifacts, d => d.coordinates.y) || 0,
        }

        const width = bounds.maxX - bounds.x + 100
        const height = bounds.maxY - bounds.y + 100
        const centerX = bounds.x + width / 2
        const centerY = bounds.y + height / 2

        const svgWidth = parseInt(svg.attr('width'))
        const svgHeight = parseInt(svg.attr('height'))

        const scale = Math.min(svgWidth / width, svgHeight / height, 1)
        const translateX = svgWidth / 2 - centerX * scale
        const translateY = svgHeight / 2 - centerY * scale

        svg.transition()
            .duration(750)
            .call(
                d3.zoom<SVGSVGElement, unknown>().transform,
                d3.zoomIdentity.translate(translateX, translateY).scale(scale)
            )
    }, [artifacts])

    useEffect(() => {
        initializeCanvas()
    }, [initializeCanvas])

    useEffect(() => {
        renderArtifacts()
    }, [renderArtifacts])

    return {
        svgRef,
        artifacts,
        updateArtifact,
        createArtifact,
        deleteArtifact,
        initializeCanvas,
        renderArtifacts,
        resetCanvas,
        fitToViewport,
    }
}
