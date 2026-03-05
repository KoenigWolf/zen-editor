export const isBrowser = typeof window !== 'undefined';
export const browserDocument = typeof document === 'undefined' ? undefined : document;
export const browserWindow = typeof window === 'undefined' ? undefined : window;
