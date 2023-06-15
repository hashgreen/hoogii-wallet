import { crx, defineManifest } from '@crxjs/vite-plugin'
import inject from '@rollup/plugin-inject'
import react from '@vitejs/plugin-react'
import path, { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import Icons from 'unplugin-icons/vite'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import commonjsExternals from 'vite-plugin-commonjs-externals'

import pkg from './package.json'
import _manifest from './public/manifest.json'
import { ModeEnum } from './src/types'

function renderChunks(deps: Record<string, string>) {
    const chunks = {
        chia: [
            '@rigidity/bls-signatures',
            '@rigidity/chia',
            '@rigidity/clvm',
            'bip39-web',
            'buffer',
            'decimal.js-light',
        ],
        ui: [
            '@emotion/react',
            '@emotion/styled',
            '@headlessui/react',
            'classnames',
        ],
        form: ['@hookform/resolvers', 'joi', 'react-hook-form'],
        'state-management': ['mobx', 'mobx-react-lite'],
        i18n: [
            'i18next',
            'i18next-browser-languagedetector',
            'i18next-http-backend',
        ],
        storage: ['@extend-chrome/storage', 'dexie', 'dexie-react-hooks'],
    }
    Object.keys(deps).forEach((key) => {
        if (
            [
                'react',
                'react-router-dom',
                'react-dom',
                ...chunks.chia,
                ...chunks.ui,
                ...chunks.form,
                ...chunks['state-management'],
                ...chunks.i18n,
                ...chunks.storage,
            ].includes(key)
        ) {
            return
        }
        chunks[key] = [key]
    })
    return chunks
}

const manifest = (mode) =>
    defineManifest({
        ..._manifest,
        name: `${_manifest.name}${mode === ModeEnum.production ? '' : '(Dev)'}`,
        version: pkg.version.split('-')[0],
        content_scripts: [
            {
                js: ['src/content-scripts/index.ts'],
                matches: ['*://*/*'],
                run_at: 'document_start',
            },
        ],
        background: {
            service_worker: 'src/background/index.ts',
            type: 'module',
        },
        action: {
            default_popup:
                mode === ModeEnum.production ? 'index.html' : 'index-dev.html',
        },
    })

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
        // ...(mode !== ModeEnum.production &&
        //     mode !== ModeEnum.report && {
        //         global: {},
        //     }),
    },
    plugins: [
        Icons({
            compiler: 'jsx',
            jsx: 'react',
            customCollections: {
                hoogii: FileSystemIconLoader('./public/images/icons', (svg) =>
                    svg
                        .replace(/width="([^"]*)"/, '')
                        .replace(/height="([^"]*)"/, '')
                        .replace(/fill="([^"]*)"/g, '')
                        .replace(/stroke="([^"]*)"/g, '')
                        .replace(/^<svg /, '<svg fill="currentColor" ')
                ),
            },
        }),
        commonjsExternals({
            externals: ['path', 'fs'],
        }),
        react(),
        crx({ manifest: manifest(mode) }),
        mode === ModeEnum.report &&
            (visualizer({
                filename: `reports/stats-${new Date().toISOString()}.html`,
            }) as Plugin),
        mode === ModeEnum.development &&
            inject({
                Buffer: ['buffer', 'Buffer'],
            }),
    ]
        .filter(Boolean)
        .map((item) => item as Plugin),
    optimizeDeps: {
        exclude: ['Buffer'], // <= The libraries that need shimming should be excluded from dependency optimization.
        esbuildOptions: { target: 'esnext', supported: { bigint: true } },
    },
    resolve: {
        alias: {
            '~': path.resolve(__dirname, './src'),
            '~config': path.resolve(__dirname, './config'),
            '~tabs': path.resolve(__dirname, './src/tabs'),
        },
    },
    build: {
        target: ['esnext'],
        sourcemap: false,
        rollupOptions: {
            // reference: https://vitejs.dev/guide/build.html#multi-page-app
            input: {
                extension: resolve(__dirname, 'index.html'),
                popup: resolve(__dirname, 'popup.html'),
                tabs: resolve(__dirname, 'tabs.html'),
                dev: resolve(__dirname, 'index-dev.html'),
                'dev-tools': resolve(__dirname, 'tools/index.html'),
            },
            output: {
                manualChunks: {
                    vendor: ['react', 'react-router-dom', 'react-dom'],
                    ...renderChunks(pkg.dependencies),
                },
            },
            plugins: [
                inject({
                    Buffer: ['buffer', 'Buffer'],
                }) as Plugin,
            ],
        },
    },
}))
