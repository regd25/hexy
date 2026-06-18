import React from 'react'

interface DropdownItem {
    id: string
    name: string
    type: string
    description: string
}

interface AutocompleteDropdownProps<T extends DropdownItem> {
    query: string
    items: T[]
    onSelect: (item: T) => void
    position: { x: number; y: number }
    visible: boolean
    searchFields?: (keyof T)[]
    maxItems?: number
    noResultsText?: string
    renderItem?: (item: T) => React.ReactNode
    getItemPreview?: (item: T) => string
}
export const AutocompleteDropdown = <T extends DropdownItem>({
    query,
    items,
    onSelect,
    position,
    visible,
    searchFields = ['name', 'id', 'type'],
    maxItems = 8,
    noResultsText = 'No se encontraron resultados',
    renderItem,
    getItemPreview,
}: AutocompleteDropdownProps<T>) => {
    if (!visible || items.length === 0) return null

    const filteredItems = items
        .filter(item =>
            searchFields.some(field => {
                const value = item[field]
                return typeof value === 'string' && value.toLowerCase().includes(query.toLowerCase())
            })
        )
        .slice(0, maxItems)

    if (filteredItems.length === 0) {
        return (
            <div
                className="autocomplete-dropdown fixed z-[100] bg-slate-800/95 border border-slate-600 rounded-md shadow-xl text-white text-sm"
                style={{ left: position.x, top: position.y, display: visible ? 'block' : 'none' }}
            >
                <div className="px-3 py-2 text-slate-300">{noResultsText}</div>
            </div>
        )
    }

    const defaultRenderItem = (item: T) => (
        <div className="autocomplete-item-content">
            <span className="artifact-name">{item.name}</span>
            <span className="artifact-type">{item.type}</span>
        </div>
    )

    const defaultGetItemPreview = (item: T) =>
        item.description.length > 50 ? `${item.description.substring(0, 50)}...` : item.description

    return (
        <div
            className="autocomplete-dropdown fixed z-[100] bg-slate-800/95 border border-slate-600 rounded-md shadow-xl text-white text-sm max-w-[360px]"
            style={{ left: position.x, top: position.y, display: visible ? 'block' : 'none' }}
        >
            {filteredItems.map(item => (
                <div
                    key={item.id}
                    className="px-3 py-2 hover:bg-slate-700/70 cursor-pointer border-b border-slate-700/40 last:border-0"
                    onClick={() => onSelect(item)}
                >
                    {renderItem ? (
                        renderItem(item)
                    ) : (
                        <div className="flex items-center justify-between gap-4">
                            {defaultRenderItem(item)}
                            <div className="text-[11px] text-slate-400 truncate">
                                {getItemPreview ? getItemPreview(item) : defaultGetItemPreview(item)}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
