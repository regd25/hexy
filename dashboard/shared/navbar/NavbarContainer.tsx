import React from 'react'

export const NavbarContainer: React.FC = () => {
    return (
        <header className="bg-background-secondary border-b border-slate-600 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-blue-400">Hexy</h1>
                    <span className="text-slate-400 font-medium">Framework de contexto organizacional</span>
                </div>
            </div>
        </header>
    )
}
