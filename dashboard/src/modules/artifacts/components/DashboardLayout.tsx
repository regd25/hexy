import React from 'react'
import { NavbarContainer } from '../../../shared/navbar/NavbarContainer'

type DashboardLayoutProps = {
    children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
}) => {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="flex flex-col h-screen">
                <NavbarContainer />
                <div className="flex flex-1">{children}</div>
            </div>
        </div>
    )
}
