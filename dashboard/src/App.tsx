import { DashboardLayout } from './modules/artifacts/components/DashboardLayout'
import { ArtifactsDashboard } from './modules/artifacts/components/ArtifactsDashboard'
import { NavigatorContainer } from './modules/artifacts/components/NavigatorContainer'
import { EventBusProvider } from './shared/event-bus/EventBusContext'
import './App.css'

function App() {
  return (
    <EventBusProvider>
      <div className="w-full h-screen flex flex-col bg-slate-900">
        <DashboardLayout>
          <NavigatorContainer />
          <ArtifactsDashboard className="flex-1" />
        </DashboardLayout>
      </div>
    </EventBusProvider>
  )
}

export default App
