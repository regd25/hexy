import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./', import.meta.url)),
            '@dashboard': fileURLToPath(new URL('./', import.meta.url)),
            '@shared': fileURLToPath(new URL('../shared/index.ts', import.meta.url)),
            '@core': fileURLToPath(new URL('../core', import.meta.url)),
        },
    },
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
})
