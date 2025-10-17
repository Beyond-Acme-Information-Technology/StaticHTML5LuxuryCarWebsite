interface ImportMetaEnv {
  readonly VITE_EMAIL_API_BASE?: string;
  readonly VITE_LOGIN_SAME_TAB?: string;
  // add other VITE_ env vars if you need them here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
