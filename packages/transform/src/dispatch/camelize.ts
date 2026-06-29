/** Convert a snake_case key to camelCase. */
function snakeKeyToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

/**
 * Deep-camelCase Discord gateway dispatch payload keys.
 * Values are preserved; arrays are mapped element-wise.
 *
 * Not applied at the hub boundary in v1.1 — exported for G3-p1 migration prep.
 */
export function camelizeDispatch(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) return data.map((item) => camelizeDispatch(item));
  if (typeof data !== "object") return data;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    out[snakeKeyToCamel(key)] = camelizeDispatch(value);
  }
  return out;
}
