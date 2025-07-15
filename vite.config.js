import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path";
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: true, // Allow external connections
        port: 5173,
        proxy: {
            '/api': {
                target: process.env.DOCKER ? 'http://localhost:3002' : 'http://localhost:3002',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
