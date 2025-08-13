import React from 'react'
import ReactDOM from 'react-dom/client'
import { ArtifactsApp } from './artifacts/ArtifactsApp'
import './main.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('No root element found')
}

const root = ReactDOM.createRoot(rootElement)

root.render(
    <React.StrictMode>
        <div className="flex flex-col h-screen app bg-background-primary">
            <ArtifactsApp />
        </div>
    </React.StrictMode>
)
