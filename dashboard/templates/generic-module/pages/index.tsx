import React from 'react'
import { ModuleContainer } from '../components/ModuleContainer'
import { ModuleProvider } from '../contexts/ModuleContext'
import { ModuleConfig } from '../types/Module'

interface ModulePageProps {
  config?: Partial<ModuleConfig>
  className?: string
}

const defaultConfig: ModuleConfig = {
  title: 'Generic Module',
  subtitle: 'A reusable module template for Hexy Framework',
  version: '1.0.0',
  author: 'Hexy Framework',
  description: 'This is a generic module template that can be customized for specific use cases.',
  features: [
    'Semantic artifact support',
    'Event-driven architecture',
    'DDD patterns',
    'Validation system',
    'Export/Import functionality'
  ],
  settings: {
    autoSave: true,
    validateOnChange: true,
    showFooter: true,
    showActions: true
  }
}

export const ModulePage: React.FC<ModulePageProps> = ({ 
  config = {},
  className = ''
}) => {
  const moduleConfig = { ...defaultConfig, ...config }

  return (
    <div className={`module-page min-h-screen bg-gray-900 text-white ${className}`}>
      <ModuleProvider config={moduleConfig}>
        <ModuleContainer>
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Module Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-300 mb-2">Description</h3>
                  <p className="text-gray-400 text-sm">
                    {moduleConfig.description}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-300 mb-2">Features</h3>
                  <ul className="text-gray-400 text-sm space-y-1">
                    {moduleConfig.features?.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Module Content</h2>
              <div className="text-gray-400">
                <p className="mb-4">
                  This is where your module-specific content would go. 
                  Replace this section with your actual module implementation.
                </p>
                <div className="bg-gray-700 rounded p-4">
                  <code className="text-green-400">
                    // TODO: Implement your module logic here
                    <br />
                    // 1. Define your semantic artifacts
                    <br />
                    // 2. Implement business logic
                    <br />
                    // 3. Add event handlers
                    <br />
                    // 4. Configure validation rules
                  </code>
                </div>
              </div>
            </div>
          </div>
        </ModuleContainer>
      </ModuleProvider>
    </div>
  )
}

export default ModulePage