/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BUILD_TARGET?: 'extension'
    readonly VITE_RANDOM_INPUT: number
    readonly VITE_GA4_MEASUREMENT_ID: string
    readonly VITE_LOCK_AFTER: number
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare const __APP_VERSION__: string
