import type { AnyDeps } from "../types";

/** utils/formatting. Dependencies: . */
export function createUtilsFormatting(_dependencies: AnyDeps = {}) {
  const escMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  const esc = (s: unknown): string => String(s ?? "").replace(/[&<>"']/g, (c) => escMap[c] ?? c);
  const BND = "০১২৩৪৫৬৭৮৯";
  const bn = (s: unknown): string => String(s ?? "").replace(/\d/g, (d) => BND[Number(d)] ?? d);
  const toEn = (s: unknown): string =>
    String(s ?? "").replace(/[০-৯]/g, (d) => String(BND.indexOf(d)));
  const pad = (n: unknown, l = 4): string => String(n).padStart(l, "0");
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const toD = (s: string): Date => new Date(s.length === 10 ? s + "T00:00:00" : s);
  const fD = (s?: string | null): string => {
    if (!s) return "";
    const d = toD(s);
    return `${d.getDate()} ${MON[d.getMonth()] ?? ""} ${d.getFullYear()}`;
  };
  const fT = (s: string): string => {
    const d = toD(s);
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ap}`;
  };
  const fDT = (s?: string | null): string => (s ? `${fD(s)}, ${fT(s)}` : "");
  const bnDate = (s?: string | null): string => {
    if (!s) return "";
    const [y, m, d] = s.slice(0, 10).split("-");
    return bn(`${d}/${m}/${y}`);
  };
  const sigDate = (s: string): string => {
    const d = toD(s),
      z = (n: number) => String(n).padStart(2, "0");
    return `${z(d.getDate())}.${z(d.getMonth() + 1)}.${d.getFullYear()} ${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())} +0600`;
  };
  function lISO(d: Date): string {
    const z = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`;
  }
  const now = (): string => lISO(new Date());
  const today = (): string => now().slice(0, 10);
  const addDays = (iso: string, n: number): string => {
    const d = toD(iso);
    d.setDate(d.getDate() + n);
    return lISO(d).slice(0, 10);
  };
  function ageAt(dob?: string | null, at?: string | null): number | null {
    if (!dob) return null;
    const b = toD(dob),
      a = toD(at || today());
    let y = a.getFullYear() - b.getFullYear();
    const m = a.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && a.getDate() < b.getDate())) y--;
    return y;
  }
  const inr = (n: unknown): string => Number(n || 0).toLocaleString("en-IN");
  const tkBn = (n: unknown): string => "টাকা " + bn(inr(n));
  const serial = (): string =>
    Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 65536)
        .toString(16)
        .toUpperCase()
        .padStart(4, "0"),
    ).join("-");
  const otp = (): string => String(Math.floor(100000 + Math.random() * 900000));
  const ini = (n: unknown): string =>
    String(n || "?")
      .split(/\s+/)
      .filter((w) => w && !/^(md\.?|mst\.?)$/i.test(w))
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  const nidOk = (n: unknown): boolean => /^(\d{10}|\d{13}|\d{17})$/.test(toEn(n).trim());
  const mobOk = (m: unknown): boolean => /^01\d{9}$/.test(toEn(m).trim());
  const mailOk = (e: unknown): boolean => /^\S+@\S+\.\S+$/.test(String(e || "").trim());
  const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o)) as T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getP = (o: any, p: string): any => p.split(".").reduce((x, k) => (x == null ? x : x[k]), o);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setP = (o: any, p: string, v: unknown): void => {
    const ks = p.split(".");
    let x = o;
    ks.slice(0, -1).forEach((k) => {
      if (x[k] == null) x[k] = {};
      x = x[k];
    });
    const last = ks[ks.length - 1];
    if (last !== undefined) x[last] = v;
  };
  return {
    esc,
    BND,
    bn,
    toEn,
    pad,
    MON,
    toD,
    fD,
    fT,
    fDT,
    bnDate,
    sigDate,
    lISO,
    now,
    today,
    addDays,
    ageAt,
    inr,
    tkBn,
    serial,
    otp,
    ini,
    nidOk,
    mobOk,
    mailOk,
    clone,
    getP,
    setP,
  };
}
