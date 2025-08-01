import React from 'react'
import { NavbarContainer } from '../navbar/NavbarContainer'
import { NavigatorContainer } from '../navigator/NavigatorContainer'
import { GraphContainer } from '../graph/GraphContainer'

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <NavbarContainer />
      <div className="flex flex-1 overflow-hidden">
        <NavigatorContainer />
        <GraphContainer />
      </div>
    </div>
  )
}
