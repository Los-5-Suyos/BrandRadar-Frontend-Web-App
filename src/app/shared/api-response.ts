export function asArray<T = any>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  if (!response || typeof response !== 'object') return [];

  const body = response as Record<string, unknown>;
  const candidates = [body['content'], body['data'], body['items'], body['results']];
  const match = candidates.find(Array.isArray);
  return match ? (match as T[]) : [];
}

export function asObject<T extends Record<string, any> = Record<string, any>>(response: unknown): T {
  if (!response || typeof response !== 'object') return {} as T;

  const body = response as Record<string, unknown>;
  const nested = body['data'];
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return nested as T;
  }

  return body as T;
}
