/**
 * Verify Discord Interactions Endpoint signatures (Ed25519).
 * Uses Web Crypto so the same code works in Node 20+ and Workers.
 */

function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.trim();
  if (cleaned.length % 2 !== 0) throw new Error("Invalid hex length");
  const out = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function toBytes(value: string | Uint8Array | ArrayBuffer): Uint8Array {
  if (typeof value === "string") return new TextEncoder().encode(value);
  if (value instanceof Uint8Array) return value;
  return new Uint8Array(value);
}

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

/**
 * Validate `X-Signature-Ed25519` + `X-Signature-Timestamp` against the raw body.
 * Returns `false` on any crypto / parse failure (including Discord's invalid-signature probes).
 */
export async function verifyDiscordInteractionRequest(
  rawBody: string | Uint8Array | ArrayBuffer,
  signatureHex: string | null | undefined,
  timestamp: string | null | undefined,
  publicKeyHex: string,
): Promise<boolean> {
  if (!signatureHex || !timestamp || !publicKeyHex) return false;
  try {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) return false;

    const key = await subtle.importKey(
      "raw",
      hexToBytes(publicKeyHex),
      { name: "Ed25519" },
      false,
      ["verify"],
    );
    const message = concatBytes(toBytes(timestamp), toBytes(rawBody));
    return await subtle.verify("Ed25519", key, hexToBytes(signatureHex), message);
  } catch {
    return false;
  }
}
