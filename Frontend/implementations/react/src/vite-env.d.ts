/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SIGNALLING_SERVER_URL?: string
  readonly VITE_SIGNALLING_SERVER_HTTP?: string
  readonly VITE_SIGNALLING_HOST?: string
  readonly VITE_SIGNALLING_WS_PORT?: string
  readonly VITE_SIGNALLING_HTTP_PORT?: string
  readonly VITE_DEBUG?: string
  readonly VITE_VERBOSE_LOGGING?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 