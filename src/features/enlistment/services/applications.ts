import { ST } from "../constants/people";

export const BND = "০১২৩৪৫৬৭৮৯";
export const bn = (s: unknown): string =>
  String(s ?? "").replace(/\d/g, (d) => BND[Number(d)] ?? d);
export const pad = (n: number | string, l: number): string => String(n).padStart(l, "0");
export const MON = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function lISO(d: Date): string {
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`;
}

export const now = (): string => lISO(new Date());
export const today = (): string => now().slice(0, 10);
export const addDays = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return lISO(d);
};
export const toD = (s: string): Date => new Date(s.length === 10 ? s + "T00:00:00" : s);

export const fD = (s?: string | null): string => {
  if (!s) return "—";
  const d = toD(s);
  return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
};

export const fDT = (s?: string | null): string => {
  if (!s) return "—";
  const d = toD(s);
  let h = d.getHours();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${fD(s)}, ${h}:${String(d.getMinutes()).padStart(2, "0")} ${ap}`;
};

export const ageOf = (dob: string): number => {
  const b = toD(dob),
    a = new Date();
  let y = a.getFullYear() - b.getFullYear();
  const m = a.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && a.getDate() < b.getDate())) y--;
  return y;
};

export const ini = (n?: string | null): string =>
  String(n || "?")
    .split(/\s+/)
    .filter((w) => w && !/^md\.?$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export const otpCode = (): string => String(Math.floor(100000 + Math.random() * 900000));
export const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o)) as T;

export const esc = (s: unknown): string =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );

export const chip = (s: string): string => {
  const pair = ST[s] ?? [s, "c-dr"];
  return `<span class="chip ${pair[1]}">${pair[0]}</span>`;
};
