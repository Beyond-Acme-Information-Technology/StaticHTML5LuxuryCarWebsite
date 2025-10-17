interface ImportMetaEnv {
  readonly VITE_EMAIL_API_BASE?: string;
  // add other VITE_ env vars if you need them here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
