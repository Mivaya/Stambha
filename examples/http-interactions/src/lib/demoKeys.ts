import { generateKeyPairSync, sign } from "node:crypto";

/** Ed25519 helpers for local DEMO=1 — mirrors Discord's signature scheme. */
export function createDemoKeys() {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const publicKeyHex = Buffer.from(
    publicKey.export({ type: "spki", format: "der" }).subarray(-32),
  ).toString("hex");

  const signBody = (timestamp: string, body: string) => {
    const message = Buffer.from(timestamp + body);
    return sign(null, message, privateKey).toString("hex");
  };

  return { publicKeyHex, signBody };
}
