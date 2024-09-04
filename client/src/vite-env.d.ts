/// <reference types="vite/client" />

interface Window {
    ethereum: import("ethers").Eip1193Provider;
}

interface ImportMetaEnv {
    readonly VITE_SERVER_URL: string;
    readonly VITE_SERVER_API_VERSION: string;
    readonly VITE_SIGNATURE_MESSAGE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
