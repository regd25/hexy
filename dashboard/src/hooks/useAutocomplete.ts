import { useState, useCallback, useRef } from 'react'
import { Artifact } from '../types/Artifact'

export const useAutocomplete = (artifacts: Artifact[]) => {
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart
    
    // Detectar @ para autocompletado
    const beforeCursor = value.slice(0, cursorPos)
    const match = beforeCursor.match(/@(\w*)$/)
    
    if (match) {
      setQuery(match[1])
      setShowAutocomplete(true)
      setSelectedIndex(0)
      
      // Calcular posición del dropdown
      const rect = e.target.getBoundingClientRect()
      const lineHeight = 20
      const lines = beforeCursor.split('\n').length
      const charWidth = 8
      const atPosition = beforeCursor.lastIndexOf('@')
      const charsAfterAt = beforeCursor.length - atPosition
      
      setPosition({
        x: rect.left + (charsAfterAt * charWidth),
        y: rect.top + (lines * lineHeight) + 20
      })
    } else {
      setShowAutocomplete(false)
      setQuery('')
    }
  }, [])
  
  const insertReference = useCallback((artifact: Artifact) => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const value = textarea.value
    const cursorPos = textarea.selectionStart
    
    // Encontrar la posición del @ más reciente
    const beforeCursor = value.slice(0, cursorPos)
    const atIndex = beforeCursor.lastIndexOf('@')
    
    if (atIndex === -1) return
    
    const beforeAt = value.slice(0, atIndex)
    const afterAt = value.slice(cursorPos)
    
    const newValue = beforeAt + `@${artifact.name} ` + afterAt
    const newCursorPos = atIndex + artifact.name.length + 2 // +2 por el @ y el espacio
    
    // Actualizar el valor del textarea
    textarea.value = newValue
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    
    // Disparar evento de cambio
    const event = new Event('input', { bubbles: true })
    textarea.dispatchEvent(event)
    
    // Ocultar autocompletado
    setShowAutocomplete(false)
    setQuery('')
  }, [])
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showAutocomplete) return
    
    const filteredArtifacts = artifacts.filter(artifact =>
      artifact.name.toLowerCase().includes(query.toLowerCase()) ||
      artifact.id.toLowerCase().includes(query.toLowerCase()) ||
      artifact.type.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8)
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredArtifacts.length - 1 ? prev + 1 : 0
        )
        break
        
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredArtifacts.length - 1
        )
        break
        
      case 'Enter':
        e.preventDefault()
        if (filteredArtifacts[selectedIndex]) {
          insertReference(filteredArtifacts[selectedIndex])
        }
        break
        
      case 'Escape':
        e.preventDefault()
        setShowAutocomplete(false)
        setQuery('')
        break
        
      case 'Tab':
        e.preventDefault()
        if (filteredArtifacts[selectedIndex]) {
          insertReference(filteredArtifacts[selectedIndex])
        }
        break
    }
  }, [showAutocomplete, query, artifacts, selectedIndex, insertReference])
  
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
    handleInput,
    handleKeyDown,
    insertReference,
    hideAutocomplete
  }
} 