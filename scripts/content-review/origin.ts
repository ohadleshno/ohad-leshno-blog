export function isLocalOrigin(origin: string | null | undefined): boolean {
  if (!origin) return true;

  try {
    const url = new URL(origin);
    const localHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const http = url.protocol === 'http:' || url.protocol === 'https:';
    return localHost && http;
  } catch {
    return false;
  }
}
