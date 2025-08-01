import React from 'react'
import { NavbarContainer } from '../navbar/NavbarContainer'
import { NavigatorContainer } from '../navigator/NavigatorContainer'
import { GraphContainer } from '../graph/GraphContainer'

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex flex-col h-screen">
        <NavbarContainer />
        <div className="flex flex-1">
          <NavigatorContainer />
          <GraphContainer />
        </div>
      </div>
    </div>
  )
}
