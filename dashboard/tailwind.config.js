/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                background: {
                    primary: '#0f172a',
                    secondary: '#1e293b',
                    tertiary: '#334155',
                    card: '#1e293b',
                },
            },
        },
    },
    plugins: [],
}
