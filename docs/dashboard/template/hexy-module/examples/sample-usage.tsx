import React from 'react'
import { ModulePage } from '../generic-module'
import { ModuleConfig } from '../generic-module/types'

// Example 1: Basic Usage
export const BasicModuleExample: React.FC = () => {
    const config: ModuleConfig = {
        title: 'Project Management',
        subtitle: 'Manage your Hexy projects and workflows',
        version: '1.0.0',
        author: 'Hexy Team',
        description:
            'A comprehensive project management module for organizing and tracking Hexy framework implementations.',
        features: [
            'Project creation and management',
            'Workflow tracking',
            'Team collaboration',
            'Progress reporting',
            'Integration with artifacts',
        ],
        settings: {
            autoSave: true,
            validateOnChange: true,
            showFooter: true,
            showActions: true,
        },
    }

    return <ModulePage config={config} />
}

// Example 2: Custom Module with Extended Functionality
export const CustomModuleExample: React.FC = () => {
    const config: ModuleConfig = {
        title: 'Semantic Validator',
        subtitle: 'Validate and analyze semantic artifacts',
        version: '2.1.0',
        author: 'AI Team',
        description: 'Advanced validation module for ensuring semantic consistency across Hexy artifacts.',
        features: [
            'Real-time validation',
            'Semantic analysis',
            'Relationship mapping',
            'Compliance checking',
            'Export reports',
        ],
        settings: {
            autoSave: false, // Manual save for validation workflows
            validateOnChange: true,
            showFooter: true,
            showActions: true,
        },
    }

    return (
        <ModulePage
            config={config}
            className="semantic-validator-module"
        />
    )
}

// Example 3: Minimal Configuration
export const MinimalModuleExample: React.FC = () => {
    const config: ModuleConfig = {
        title: 'Quick Notes',
        version: '1.0.0',
        author: 'User',
        description: 'Simple note-taking module',
        settings: {
            autoSave: true,
            validateOnChange: false,
            showFooter: false,
            showActions: false,
        },
    }

    return <ModulePage config={config} />
}

// Example 4: Integration with Existing Components
import { useArtifacts } from '../../../hooks/useArtifacts'
import { ModuleContainer, ModuleProvider } from '../generic-module'

export const IntegratedModuleExample: React.FC = () => {
    const { artifacts } = useArtifacts()

    const config: ModuleConfig = {
        title: 'Artifact Dashboard',
        subtitle: `Managing ${artifacts.length} artifacts`,
        version: '1.0.0',
        author: 'Dashboard Team',
        description: 'Integrated artifact management with existing dashboard functionality',
        settings: {
            autoSave: true,
            validateOnChange: true,
            showFooter: true,
            showActions: true,
        },
    }

    return (
        <ModuleProvider config={config}>
            <ModuleContainer>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Artifact Summary</h3>
                        <div className="space-y-2">
                            {artifacts.slice(0, 5).map(artifact => (
                                <div
                                    key={artifact.id}
                                    className="flex justify-between items-center"
                                >
                                    <span className="text-gray-300">{artifact.name}</span>
                                    <span className="text-xs bg-blue-600 px-2 py-1 rounded">{artifact.type}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                                Create New Artifact
                            </button>
                            <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                                Validate All Artifacts
                            </button>
                            <button className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                                Export Dashboard Data
                            </button>
                        </div>
                    </div>
                </div>
            </ModuleContainer>
        </ModuleProvider>
    )
}
