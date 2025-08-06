/**
 * ArtifactsDashboard - Main dashboard component for artifacts module
 * Demonstrates how to use the simplified architecture with GraphContainer
 */

import React from 'react'
import { GraphContainer } from './GraphContainer'

interface ArtifactsDashboardProps {
    className?: string
}

export const ArtifactsDashboard: React.FC<ArtifactsDashboardProps> = ({
    className = ''
}) => {
    return (
        <div className={`artifacts-dashboard h-full flex flex-col ${className}`}>
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-white">
                            Semantic Artifacts
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Visualize and manage organizational knowledge artifacts
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="text-xs text-gray-400">
                            Simplified Architecture v2.0
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 p-4">
                <GraphContainer 
                    width={1200}
                    height={700}
                    className="w-full h-full"
                />
            </div>

            {/* Footer */}
            <div className="bg-gray-800 border-t border-gray-700 p-3">
                <div className="flex items-center justify-between text-xs text-gray-400">
                    <div>
                        Hexy Framework • Semantic Architecture • DRY Principles
                    </div>
                    <div>
                        Single Event System • Direct Integration
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ArtifactsDashboard