/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_MAX_MAP_ACTORS_OUTSIDE_VIEWPORT: number
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}