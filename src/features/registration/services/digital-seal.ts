import type { AnyDeps } from "../types";

/** services/digital-seal. Dependencies: KEYS, ls. */
export function createServicesDigitalSeal(dependencies: AnyDeps) {
  const b64u = (b: ArrayBuffer): string =>
    btoa(String.fromCharCode(...new Uint8Array(b)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  const unb = (s: string): Uint8Array<ArrayBuffer> => {
    let padded = s.replace(/-/g, "+").replace(/_/g, "/");
    while (padded.length % 4) padded += "=";
    return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  };
  async function initKeys(): Promise<void> {
    try {
      if (!crypto.subtle) throw new Error("WebCrypto unavailable");
      const alg = { name: "ECDSA", namedCurve: "P-256" };
      const st = dependencies.ls.get("omr-keys");
      if (st) {
        const j = JSON.parse(st) as { priv: JsonWebKey; pub: JsonWebKey };
        dependencies.KEYS = {
          priv: await crypto.subtle.importKey("jwk", j.priv, alg, true, ["sign"]),
          pub: await crypto.subtle.importKey("jwk", j.pub, alg, true, ["verify"]),
        };
      } else {
        const k = await crypto.subtle.generateKey(alg, true, ["sign", "verify"]);
        dependencies.KEYS = { priv: k.privateKey, pub: k.publicKey };
        dependencies.ls.set(
          "omr-keys",
          JSON.stringify({
            priv: await crypto.subtle.exportKey("jwk", k.privateKey),
            pub: await crypto.subtle.exportKey("jwk", k.publicKey),
          }),
        );
      }
    } catch {
      dependencies.KEYS = null;
    }
  }
  const signP = async (p: string): Promise<string> =>
    dependencies.KEYS
      ? b64u(
          await crypto.subtle.sign(
            { name: "ECDSA", hash: "SHA-256" },
            dependencies.KEYS.priv,
            new TextEncoder().encode(p),
          ),
        )
      : "UNSIGNED";
  const verP = async (p: string, s: string): Promise<boolean> => {
    if (!dependencies.KEYS || s === "UNSIGNED") return false;
    try {
      return await crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        dependencies.KEYS.pub,
        unb(s),
        new TextEncoder().encode(p),
      );
    } catch {
      return false;
    }
  };
  return { b64u, unb, initKeys, signP, verP };
}
