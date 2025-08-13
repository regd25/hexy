import { Artifact } from '../shared/types/Artifact'
import { REVERSE_TYPE_MAP, COLORS } from '../modules/artifacts/constants/colors'

export interface EditorContent {
    text: string
    artifacts: Artifact[]
}

export class EditorService {
    private content: string = ''
    private artifacts: Artifact[] = []
    private onContentChange?: (content: EditorContent) => void

    constructor(onContentChange?: (content: EditorContent) => void) {
        this.onContentChange = onContentChange
    }

    public setContent(text: string) {
        this.content = text
        this.parseContent()
    }

    public getContent(): string {
        return this.content
    }

    public getArtifacts(): Artifact[] {
        return [...this.artifacts]
    }

    private parseContent() {
        try {
            const lines = this.content.split('\n')
            const artifacts: Artifact[] = []
            let currentCategory = ''

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim()

                if (line.startsWith('##')) {
                    currentCategory = line.substring(2).trim()
                } else if (line.startsWith('-') && line.includes(':')) {
                    const match = line.match(/^\s*-\s*([^:]+):\s*(.+)$/)
                    if (match) {
                        const name = match[1].trim()
                        const description = match[2].trim()
                        const type = this.getTypeFromCategory(currentCategory)

                        const artifact: Artifact = {
                            id: name.replace(/\s+/g, ''),
                            name,
                            type,
                            description,
                            info: description,
                            x: 100 + Math.random() * 400,
                            y: 100 + Math.random() * 300,
                            vx: 0,
                            vy: 0,
                            fx: null,
                            fy: null,
                        }

                        artifacts.push(artifact)
                    }
                }
            }

            this.artifacts = artifacts

            if (this.onContentChange) {
                this.onContentChange({
                    text: this.content,
                    artifacts: this.artifacts,
                })
            }
        } catch (error) {
            console.error('Error parsing content:', error)
        }
    }

    private getTypeFromCategory(category: string): string {
        for (const [type, cat] of Object.entries(REVERSE_TYPE_MAP)) {
            if (cat === category) {
                return type
            }
        }
        return 'concept'
    }

    public updateNodeType(node: Artifact, oldType: string, newType: string) {
        if (oldType === newType) return

        const lines = this.content.split('\n')
        const oldCategory = REVERSE_TYPE_MAP[oldType]
        const newCategory = REVERSE_TYPE_MAP[newType]
        const artifactLineRegex = new RegExp(`^\\s*-\\s*${node.name}\\s*:.*$`)

        let artifactLineIndex = -1
        for (let i = 0; i < lines.length; i++) {
            if (artifactLineRegex.test(lines[i])) {
                artifactLineIndex = i
                break
            }
        }

        if (artifactLineIndex === -1) return

        const artifactLine = lines[artifactLineIndex]
        const match = artifactLine.match(/^(\s*-\s*[^:]+:)(.*)$/)
        if (!match) return

        const description = match[2]

        // Buscar o crear la nueva categoría
        let newCategoryIndex = -1
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === newCategory) {
                newCategoryIndex = i
                break
            }
        }

        if (newCategoryIndex === -1) {
            // Crear nueva categoría
            let oldCategoryIndex = -1
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim() === oldCategory) {
                    oldCategoryIndex = i
                    break
                }
            }

            if (oldCategoryIndex !== -1) {
                lines.splice(oldCategoryIndex + 1, 0, newCategory)
                newCategoryIndex = oldCategoryIndex + 1
            } else {
                lines.push('')
                lines.push(newCategory)
                newCategoryIndex = lines.length - 1
            }
        }

        // Remover línea del artefacto
        lines.splice(artifactLineIndex, 1)

        // Insertar en nueva categoría
        const newArtifactLine = `  - ${node.name}:${description}`
        let insertIndex = newCategoryIndex + 1
        while (
            insertIndex < lines.length &&
            lines[insertIndex].trim() !== '' &&
            !lines[insertIndex].trim().startsWith('##') &&
            lines[insertIndex].trim() !== newCategory
        ) {
            insertIndex++
        }

        lines.splice(insertIndex, 0, newArtifactLine)
        this.content = lines.join('\n')
        this.parseContent()
    }

    public updateNodeName(node: Artifact, oldName: string, newName: string) {
        if (oldName === newName) return

        const lines = this.content.split('\n')
        const oldArtifactLineRegex = new RegExp(`^\\s*-\\s*${oldName}\\s*:.*$`)

        let lineToUpdate = -1
        for (let i = 0; i < lines.length; i++) {
            if (oldArtifactLineRegex.test(lines[i])) {
                lineToUpdate = i
                break
            }
        }

        if (lineToUpdate !== -1) {
            const match = lines[lineToUpdate].match(/^(\s*-\s*)[^:]+:(.*$)/)
            if (match) {
                const indent = match[1]
                const description = match[2]
                const newLine = `${indent}${newName}:${description}`

                if (lines[lineToUpdate] !== newLine) {
                    lines[lineToUpdate] = newLine
                    this.content = lines.join('\n')
                    this.parseContent()
                }
            }
        }
    }

    public updateNodeDescription(node: Artifact, oldDescription: string, newDescription: string) {
        if (oldDescription === newDescription) return

        const lines = this.content.split('\n')
        const artifactLineRegex = new RegExp(`^\\s*-\\s*${node.name}\\s*:.*$`)

        let lineToUpdate = -1
        for (let i = 0; i < lines.length; i++) {
            if (artifactLineRegex.test(lines[i])) {
                lineToUpdate = i
                break
            }
        }

        if (lineToUpdate !== -1) {
            const match = lines[lineToUpdate].match(/^(\s*-\s*[^:]+:).*$/)
            if (match) {
                const prefix = match[1]
                const newLine = `${prefix} ${newDescription}`

                if (lines[lineToUpdate] !== newLine) {
                    lines[lineToUpdate] = newLine
                    this.content = lines.join('\n')
                    this.parseContent()
                }
            }
        }
    }

    public getNodeColor(type: string): string {
        return COLORS[type] || '#6b7280'
    }

    public insertReference(id: string, text: string, cursorPosition: number): string {
        const textBefore = text.substring(0, cursorPosition)
        const textAfter = text.substring(cursorPosition)

        // Buscar la posición del @ más cercana al cursor
        const lastAtIndex = textBefore.lastIndexOf('@')
        if (lastAtIndex === -1) return text

        const newText = `${textBefore.substring(0, lastAtIndex)}@${id} ${textAfter}`
        return newText
    }

    public findReferences(text: string): string[] {
        const references: string[] = []
        const regex = /@([A-Za-zÁÉÍÓÚÑáéíóú0-9-]+)/g
        let match

        while ((match = regex.exec(text)) !== null) {
            references.push(match[1])
        }

        return references
    }
}
