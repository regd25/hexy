import { defineConfig } from 'vite'

const API_TARGET = process.env.HEXY_API_TARGET ?? 'http://localhost:4000'

// Frontend vanilla (sin React). Vite solo bundlea/sirve JS+CSS y hace proxy de /api al
// backend node:http (server/). En producción el dashboard se sirve estático y /api apunta
// al backend desplegado.
export default defineConfig({
    server: {
        port: Number(process.env.PORT ?? 3000),
        open: true,
        proxy: {
            '/api': { target: API_TARGET, changeOrigin: true },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
})
