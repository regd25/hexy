/**
 * ArtifactsDashboard - Main dashboard component for artifacts module
 * Demonstrates how to use the simplified architecture with GraphContainer
 */

import React from 'react'
import { GraphContainer } from './GraphContainer'
import { ArtifactList } from './ArtifactList'

interface ArtifactsDashboardProps {
    className?: string
}

export const ArtifactsDashboard: React.FC<ArtifactsDashboardProps> = ({ className = '' }) => {
    return (
        <div className={`artifacts-dashboard flex flex-col ${className}`}>
            <div className="flex-1 p-4 grid grid-cols-12 gap-4">
                <div className="col-span-3">
                    <ArtifactList />
                </div>
                <div className="col-span-9">
                    <GraphContainer className="w-full h-full" />
                </div>
            </div>
        </div>
    )
}
