import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, '.'),
            '@dashboard': resolve(__dirname, '.'),
            '@shared': resolve(__dirname, '../shared/index.ts'),
            '@core': resolve(__dirname, '../core'),
        },
    },
})
