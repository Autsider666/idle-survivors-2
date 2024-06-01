/// <reference types="vite/client" />
interface ImportMetaEnv { // ENV variables are always parsed as string, even if number or bool, so keep it at a string here to prevent issues like the viewport....
    readonly VITE_SPAWN_MAX_MONSTERS: string,
    readonly VITE_SPAWN_BASE_RATE: string,
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}