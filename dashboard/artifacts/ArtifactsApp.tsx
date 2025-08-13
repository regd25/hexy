import { ArtifactsDashboard } from './components/ArtifactsDashboard'
import { EventBusProvider, NavbarContainer } from '../shared'

export function ArtifactsApp() {
    return (
        <EventBusProvider>
            <NavbarContainer />
            <ArtifactsDashboard className="flex-1" />
        </EventBusProvider>
    )
}
