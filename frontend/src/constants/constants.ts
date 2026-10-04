export const MAIN_PATH = import.meta.env.VITE_API_URL ?? '';
export const HOST_PATH = import.meta.env.VITE_API_HOST ?? '';

export const buildApiUrl = (path: string) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${MAIN_PATH}${normalizedPath}`;
};