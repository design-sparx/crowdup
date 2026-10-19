import {fileURLToPath} from 'node:url'
import {defineConfig} from 'vite'
import {reactRouter} from '@react-router/dev/vite'
import netlifyReactRouter from '@netlify/vite-plugin-react-router'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [tailwindcss(), reactRouter(), netlifyReactRouter()],
    resolve: {
        alias: {'@': fileURLToPath(new URL('./src', import.meta.url))},
    },
})
