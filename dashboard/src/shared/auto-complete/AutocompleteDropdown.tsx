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
                return (
                    typeof value === 'string' &&
                    value.toLowerCase().includes(query.toLowerCase())
                )
            })
        )
        .slice(0, maxItems)

    if (filteredItems.length === 0) {
        return (
            <div
                className="autocomplete-dropdown no-results"
                style={{
                    left: position.x,
                    top: position.y,
                    display: visible ? 'block' : 'none',
                }}
            >
                <div className="autocomplete-item disabled">
                    <span>{noResultsText}</span>
                </div>
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
        item.description.length > 50
            ? `${item.description.substring(0, 50)}...`
            : item.description

    return (
        <div
            className="autocomplete-dropdown"
            style={{
                left: position.x,
                top: position.y,
                display: visible ? 'block' : 'none',
            }}
        >
            {filteredItems.map(item => (
                <div
                    key={item.id}
                    className="autocomplete-item"
                    onClick={() => onSelect(item)}
                >
                    {renderItem ? renderItem(item) : defaultRenderItem(item)}
                    <div className="autocomplete-item-preview">
                        {getItemPreview
                            ? getItemPreview(item)
                            : defaultGetItemPreview(item)}
                    </div>
                </div>
            ))}
        </div>
    )
}
