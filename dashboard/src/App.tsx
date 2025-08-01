import React from 'react'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { EventBusProvider } from './contexts/EventBusContext'
import './App.css'

function App() {
  return (
    <EventBusProvider>
      <div className="w-full h-screen flex flex-col bg-slate-900">
        <DashboardLayout />
      </div>
    </EventBusProvider>
  )
}

export default App
