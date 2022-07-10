import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import ViteRustPlugin from 'vite-rust-plugin'
import path from "path";

const rust = new ViteRustPlugin({
    crateDir: './rust',
});

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            $wasm: path.resolve(__dirname, './rust/pkg/index.js')
        }
    },

    build: {
        outDir: 'docs'
    },

    plugins: [
        svelte({
            configFile: 'svelte.config.js'
        }),
        rust,
    ]
})