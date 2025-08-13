import React from 'react'

interface ContextMenuProps {
    x: number
    y: number
    onDelete: () => void
    onClose: () => void
    disabled?: boolean
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onDelete, onClose, disabled = false }) => {
    return (
        <div
            className="fixed z-50 bg-slate-800 border border-slate-600 rounded-md shadow-xl text-slate-100"
            style={{ left: x, top: y, minWidth: 200 }}
            onClick={e => e.stopPropagation()}
            onContextMenu={e => e.preventDefault()}
        >
            <button
                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                    if (disabled) return
                    onDelete()
                    onClose()
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-red-400">
                    <path fillRule="evenodd" d="M9 3a1 1 0 0 0-1 1v1H5.5a.75.75 0 0 0 0 1.5h13a.75.75 0 0 0 0-1.5H16V4a1 1 0 0 0-1-1H9zm-3 6.75c0-.414.336-.75.75-.75h10.5c.414 0 .75.336.75.75v9.5A2.75 2.75 0 0 1 15.25 22h-6.5A2.75 2.75 0 0 1 6 19.25v-9.5z" clipRule="evenodd" />
                </svg>
                <span>Eliminar seleccionados</span>
            </button>
        </div>
    )
}

export default ContextMenu
