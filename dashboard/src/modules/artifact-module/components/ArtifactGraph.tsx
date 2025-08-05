/**
 * Artifact Graph Visualization Component
 * Interactive D3.js-based graph for visualizing artifact relationships
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Artifact, Relationship } from '../types/artifact.types';
import { useArtifacts } from '../hooks/useArtifacts';
import { ArtifactService } from '../services/ArtifactService';
import { ValidationService } from '../services/ValidationService';

/**
 * Graph node interface
 */
interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  artifact: Artifact;
  type: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

/**
 * Graph link interface
 */
interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: GraphNode;
  target: GraphNode;
  type: string;
  relationship: Relationship;
}

/**
 * Graph configuration
 */
interface GraphConfig {
  width: number;
  height: number;
  nodeRadius: number;
  linkDistance: number;
  chargeStrength: number;
  gravity: number;
}

/**
 * Props for ArtifactGraph component
 */
export interface ArtifactGraphProps {
  artifacts: Artifact[];
  selectedId?: string;
  onNodeClick?: (artifact: Artifact) => void;
  onNodeHover?: (artifact: Artifact | null) => void;
  config?: Partial<GraphConfig>;
  className?: string;
}

/**
 * Color scheme for artifact types
 */
const ARTIFACT_COLORS: Record<string, string> = {
  purpose: '#3b82f6',
  vision: '#8b5cf6',
  policy: '#10b981',
  principle: '#f59e0b',
  guideline: '#f97316',
  context: '#6b7280',
  actor: '#6366f1',
  concept: '#ec4899',
  process: '#14b8a6',
  procedure: '#06b6d4',
  event: '#ef4444',
  result: '#10b981',
  observation: '#64748b',
  evaluation: '#8b5cf6',
  indicator: '#f43f5e',
  area: '#f59e0b',
  authority: '#84cc16',
  reference: '#a855f7'
};

/**
 * Artifact Graph component
 */
export const ArtifactGraph: React.FC<ArtifactGraphProps> = ({
  artifacts,
  selectedId,
  onNodeClick,
  onNodeHover,
  config: customConfig = {},
  className = ''
}) => {
  // Services
  const artifactService = useRef(new ArtifactService());
  const validationService = useRef(new ValidationService());
  
  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  
  // State
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  // Default configuration
  const config: GraphConfig = {
    width: dimensions.width,
    height: dimensions.height,
    nodeRadius: 20,
    linkDistance: 100,
    chargeStrength: -300,
    gravity: 0.1,
    ...customConfig
  };

  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Prepare graph data
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = artifacts.map(artifact => ({
      id: artifact.id,
      artifact,
      type: artifact.type,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height
    }));

    const links: GraphLink[] = [];
    artifacts.forEach(artifact => {
      artifact.relationships.forEach(relationship => {
        const sourceNode = nodes.find(n => n.id === relationship.sourceId);
        const targetNode = nodes.find(n => n.id === relationship.targetId);
        
        if (sourceNode && targetNode) {
          links.push({
            source: sourceNode,
            target: targetNode,
            type: relationship.type,
            relationship
          });
        }
      });
    });

    return { nodes, links };
  }, [artifacts, dimensions]);

  // Initialize D3 graph
  useEffect(() => {
    if (!svgRef.current || graphData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content

    // Create main group
    const g = svg.append('g');

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // Create arrow markers
    const defs = g.append('defs');
    
    Object.entries(ARTIFACT_COLORS).forEach(([type, color]) => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);
    });

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(graphData.links)
      .enter()
      .append('line')
      .attr('stroke', d => ARTIFACT_COLORS[d.source.type] || '#999')
      .attr('stroke-width', 2)
      .attr('marker-end', d => `url(#arrow-${d.source.type})`)
      .attr('opacity', 0.6);

    // Create nodes
    const node = g.append('g')
      .selectAll('g')
      .data(graphData.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    // Add circles to nodes
    node.append('circle')
      .attr('r', config.nodeRadius)
      .attr('fill', d => ARTIFACT_COLORS[d.type] || '#999')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add labels to nodes
    node.append('text')
      .text(d => d.artifact.name)
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('font-size', '12px')
      .attr('font-family', 'Arial, sans-serif')
      .attr('fill', '#fff')
      .style('pointer-events', 'none');

    // Add type labels
    node.append('text')
      .text(d => d.type)
      .attr('text-anchor', 'middle')
      .attr('dy', config.nodeRadius + 15)
      .attr('font-size', '10px')
      .attr('font-family', 'Arial, sans-serif')
      .attr('fill', '#666')
      .style('pointer-events', 'none');

    // Handle node interactions
    node
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick?.(d.artifact);
      })
      .on('mouseover', (event, d) => {
        onNodeHover?.(d.artifact);
        
        // Highlight connected nodes
        const connectedNodes = new Set<string>();
        graphData.links.forEach(link => {
          if (link.source.id === d.id) connectedNodes.add(link.target.id);
          if (link.target.id === d.id) connectedNodes.add(link.source.id);
        });

        node.select('circle')
          .attr('opacity', (n: GraphNode) => 
            n.id === d.id || connectedNodes.has(n.id) ? 1 : 0.3
          );

        link.attr('opacity', (l: GraphLink) => 
          l.source.id === d.id || l.target.id === d.id ? 1 : 0.1
        );
      })
      .on('mouseout', () => {
        onNodeHover?.(null);
        node.select('circle').attr('opacity', 1);
        link.attr('opacity', 0.6);
      });

    // Create simulation
    const simulation = d3.forceSimulation<GraphNode>(graphData.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(graphData.links)
        .id(d => d.id)
        .distance(config.linkDistance)
      )
      .force('charge', d3.forceManyBody().strength(config.chargeStrength))
      .force('center', d3.forceCenter(config.width / 2, config.height / 2))
      .force('collision', d3.forceCollide(config.nodeRadius + 5))
      .force('gravity', d3.forceY(config.height / 2).strength(config.gravity));

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Highlight selected node
    if (selectedId) {
      node.select('circle')
        .attr('stroke', (d: GraphNode) => d.id === selectedId ? '#ff6b6b' : '#fff')
        .attr('stroke-width', (d: GraphNode) => d.id === selectedId ? 3 : 2);
    }

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      setIsDragging(true);
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      setIsDragging(false);
    }

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [graphData, config, selectedId, onNodeClick, onNodeHover, dimensions]);

  /**
   * Reset zoom
   */
  const resetZoom = useCallback(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(750).call(
        d3.zoom<SVGSVGElement, unknown>().transform,
        d3.zoomIdentity
      );
    }
  }, []);

  /**
   * Center graph
   */
  const centerGraph = useCallback(() => {
    if (svgRef.current && graphData.nodes.length > 0) {
      const svg = d3.select(svgRef.current);
      const bounds = (svg.node() as SVGSVGElement)?.getBBox() || { x: 0, y: 0, width: 0, height: 0 };
      
      const fullWidth = dimensions.width;
      const fullHeight = dimensions.height;
      const width = bounds.width;
      const height = bounds.height;
      
      const midX = bounds.x + width / 2;
      const midY = bounds.y + height / 2;
      
      const scale = Math.min(2, 0.8 / Math.max(width / fullWidth, height / fullHeight));
      const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];
      
      svg.transition().duration(750).call(
        d3.zoom<SVGSVGElement, unknown>().transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
    }
  }, [graphData.nodes.length, dimensions]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border border-gray-200 dark:border-gray-700 rounded-lg"
      />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={resetZoom}
          className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          title="Reset Zoom"
        >
          Reset
        </button>
        <button
          onClick={centerGraph}
          className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          title="Center Graph"
        >
          Center
        </button>
      </div>
      
      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
        Zoom: {Math.round(zoomLevel * 100)}%
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-3 max-w-xs">
        <h4 className="text-sm font-semibold mb-2">Artifact Types</h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {Object.entries(ARTIFACT_COLORS).slice(0, 8).map(([type, color]) => (
            <div key={type} className="flex items-center space-x-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span>{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtifactGraph;