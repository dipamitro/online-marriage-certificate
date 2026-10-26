import type { EnlApplication, JurNode } from "../types";
import { placeOf } from "./jurisdiction";

let KEYS: { priv: CryptoKey; pub: CryptoKey } | null = null;

export const b64u = (b: ArrayBuffer): string =>
  btoa(String.fromCharCode(...new Uint8Array(b)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

export async function initKeys(storage: {
  get: (k: string) => string | null;
  set: (k: string, v: string) => void;
}): Promise<{ priv: CryptoKey; pub: CryptoKey } | null> {
  try {
    const alg = { name: "ECDSA", namedCurve: "P-256" };
    const st = storage.get("mrep-keys");
    if (st) {
      const j = JSON.parse(st) as { priv: JsonWebKey; pub: JsonWebKey };
      KEYS = {
        priv: await crypto.subtle.importKey("jwk", j.priv, alg, true, ["sign"]),
        pub: await crypto.subtle.importKey("jwk", j.pub, alg, true, ["verify"]),
      };
    } else {
      const k = await crypto.subtle.generateKey(alg, true, ["sign", "verify"]);
      KEYS = { priv: k.privateKey, pub: k.publicKey };
      storage.set(
        "mrep-keys",
        JSON.stringify({
          priv: await crypto.subtle.exportKey("jwk", k.privateKey),
          pub: await crypto.subtle.exportKey("jwk", k.publicKey),
        }),
      );
    }
  } catch {
    KEYS = null;
  }
  return KEYS;
}

export async function sealFor(a: EnlApplication, jur: Record<string, JurNode>): Promise<string> {
  const pl = [
    "BDMR1",
    a.licenceNo ?? "",
    (a.approvedAt ?? "").slice(0, 10),
    a.p.nameEn,
    String(a.p.nid).slice(-4),
    placeOf(jur, a.j.wards).replace(/\|/g, "/"),
    a.validTo ?? "",
  ].join("|");
  if (!KEYS) return pl + "|S:UNSIGNED";
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    KEYS.priv,
    new TextEncoder().encode(pl),
  );
  return pl + "|S:" + b64u(sig);
}
