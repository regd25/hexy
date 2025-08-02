export type ModalProps = {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title: string
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    title,
}) => {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-600 rounded-xl w-11/12 max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-600 bg-slate-700">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button 
                        className="text-slate-400 hover:text-white hover:bg-slate-600 w-8 h-8 rounded-lg flex items-center justify-center text-xl font-bold transition-colors" 
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {children}
                </div>
            </div>
        </div>
    )
}
