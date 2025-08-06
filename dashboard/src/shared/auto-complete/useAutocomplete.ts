import React, { useState, useCallback, useRef } from 'react'

interface AutocompleteConfig<T> {
    items: T[]
    filterKeys: (keyof T)[]
    trigger?: string
    maxResults?: number
    getDisplayValue: (item: T) => string
    onSelect?: (item: T) => void
}

interface Position {
    x: number
    y: number
}

export const useAutocomplete = <T>({
    items,
    filterKeys,
    trigger = '@',
    maxResults = 8,
    getDisplayValue,
    onSelect,
}: AutocompleteConfig<T>) => {
    const [showAutocomplete, setShowAutocomplete] = useState(false)
    const [query, setQuery] = useState('')
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
    const [selectedIndex, setSelectedIndex] = useState(0)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const getFilteredItems = useCallback(() => {
        return items
            .filter(item => {
                return filterKeys.some(key => {
                    const value = item[key]
                    return (
                        value &&
                        String(value)
                            .toLowerCase()
                            .includes(query.toLowerCase())
                    )
                })
            })
            .slice(0, maxResults)
    }, [items, filterKeys, query, maxResults])

    const calculatePosition = useCallback(
        (textarea: HTMLTextAreaElement, beforeCursor: string) => {
            const rect = textarea.getBoundingClientRect()
            const lineHeight =
                parseInt(getComputedStyle(textarea).lineHeight) || 20
            const lines = beforeCursor.split('\n').length
            const charWidth = 8 // Approximate character width
            const triggerPosition = beforeCursor.lastIndexOf(trigger)
            const charsAfterTrigger = beforeCursor.length - triggerPosition

            return {
                x: rect.left + charsAfterTrigger * charWidth,
                y: rect.top + lines * lineHeight + 20,
            }
        },
        [trigger]
    )

    const handleInput = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value
            const cursorPos = e.target.selectionStart

            const beforeCursor = value.slice(0, cursorPos)
            const triggerRegex = new RegExp(`\\${trigger}(\\w*)$`)
            const match = beforeCursor.match(triggerRegex)

            if (match) {
                setQuery(match[1])
                setShowAutocomplete(true)
                setSelectedIndex(0)
                setPosition(calculatePosition(e.target, beforeCursor))
            } else {
                setShowAutocomplete(false)
                setQuery('')
            }
        },
        [trigger, calculatePosition]
    )

    const insertReference = useCallback(
        (item: T) => {
            if (!textareaRef.current) return

            const textarea = textareaRef.current
            const value = textarea.value
            const cursorPos = textarea.selectionStart

            const beforeCursor = value.slice(0, cursorPos)
            const triggerIndex = beforeCursor.lastIndexOf(trigger)

            if (triggerIndex === -1) return

            const beforeTrigger = value.slice(0, triggerIndex)
            const afterCursor = value.slice(cursorPos)
            const displayValue = getDisplayValue(item)

            const newValue = `${beforeTrigger}${trigger}${displayValue} ${afterCursor}`
            const newCursorPos =
                triggerIndex + trigger.length + displayValue.length + 1

            textarea.value = newValue
            textarea.setSelectionRange(newCursorPos, newCursorPos)

            const event = new Event('input', { bubbles: true })
            textarea.dispatchEvent(event)

            setShowAutocomplete(false)
            setQuery('')
            onSelect?.(item)
        },
        [trigger, getDisplayValue, onSelect]
    )

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!showAutocomplete) return

            const filteredItems = getFilteredItems()

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault()
                    setSelectedIndex(prev =>
                        prev < filteredItems.length - 1 ? prev + 1 : 0
                    )
                    break

                case 'ArrowUp':
                    e.preventDefault()
                    setSelectedIndex(prev =>
                        prev > 0 ? prev - 1 : filteredItems.length - 1
                    )
                    break

                case 'Enter':
                case 'Tab':
                    e.preventDefault()
                    if (filteredItems[selectedIndex]) {
                        insertReference(filteredItems[selectedIndex])
                    }
                    break

                case 'Escape':
                    e.preventDefault()
                    setShowAutocomplete(false)
                    setQuery('')
                    break
            }
        },
        [showAutocomplete, getFilteredItems, selectedIndex, insertReference]
    )

    const hideAutocomplete = useCallback(() => {
        setShowAutocomplete(false)
        setQuery('')
        setSelectedIndex(0)
    }, [])

    return {
        showAutocomplete,
        query,
        position,
        selectedIndex,
        textareaRef,
        filteredItems: getFilteredItems(),
        handleInput,
        handleKeyDown,
        insertReference,
        hideAutocomplete,
    }
}
