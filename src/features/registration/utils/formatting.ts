import type { AnyDeps } from "../types";

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";
const MONTH_NAMES = [
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

/**
 * Pure formatting, date calculation, validation, and deep-property access utilities
 * shared across the Marriage Registration Portal.
 */
export function createUtilsFormatting(_dependencies: AnyDeps = {}) {
  /** Escapes HTML special characters (`&`, `<`, `>`, `"`, `'`) to prevent XSS in templates. */
  const esc = (value: unknown): string =>
    String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char);

  /** Converts ASCII digits (`0-9`) in a string/number into Bangla digits (`০-৯`). */
  const bn = (value: unknown): string =>
    String(value ?? "").replace(/\d/g, (digit) => BANGLA_DIGITS[Number(digit)] ?? digit);

  /** Converts Bangla digits (`০-৯`) into standard ASCII digits (`0-9`). */
  const toEn = (value: unknown): string =>
    String(value ?? "").replace(/[০-৯]/g, (digit) => String(BANGLA_DIGITS.indexOf(digit)));

  /** Left-pads a number or string with leading zeros up to `length`. */
  const pad = (value: unknown, length = 4): string => String(value).padStart(length, "0");

  /** Parses an ISO date (`YYYY-MM-DD`) or datetime string into a `Date` object. */
  const toD = (isoString: string): Date =>
    new Date(isoString.length === 10 ? isoString + "T00:00:00" : isoString);

  /** Formats an ISO date string into `"14 Mar 2026"`. */
  const fD = (isoString?: string | null): string => {
    if (!isoString) return "";
    const date = toD(isoString);
    return `${date.getDate()} ${MONTH_NAMES[date.getMonth()] ?? ""} ${date.getFullYear()}`;
  };

  /** Formats the time portion of an ISO datetime string into `"2:30 PM"`. */
  const fT = (isoString: string): string => {
    const date = toD(isoString);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
  };

  /** Formats an ISO datetime string into `"14 Mar 2026, 2:30 PM"`. */
  const fDT = (isoString?: string | null): string =>
    isoString ? `${fD(isoString)}, ${fT(isoString)}` : "";

  /** Formats an ISO date (`YYYY-MM-DD`) into Bangla `DD/MM/YYYY` format. */
  const bnDate = (isoString?: string | null): string => {
    if (!isoString) return "";
    const [year, month, day] = isoString.slice(0, 10).split("-");
    return bn(`${day}/${month}/${year}`);
  };

  /** Formats a timestamp for PKI digital signature blocks (`"DD.MM.YYYY HH:mm:ss +0600"`). */
  const sigDate = (isoString: string): string => {
    const date = toD(isoString);
    const twoDigits = (num: number) => String(num).padStart(2, "0");
    return `${twoDigits(date.getDate())}.${twoDigits(date.getMonth() + 1)}.${date.getFullYear()} ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}:${twoDigits(date.getSeconds())} +0600`;
  };

  /** Formats a `Date` object as a local ISO timestamp (`YYYY-MM-DDTHH:mm:ss`). */
  function lISO(date: Date): string {
    const twoDigits = (num: number) => String(num).padStart(2, "0");
    return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}T${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}:${twoDigits(date.getSeconds())}`;
  }

  /** Returns the current local ISO datetime string (`YYYY-MM-DDTHH:mm:ss`). */
  const now = (): string => lISO(new Date());

  /** Returns today's date in `YYYY-MM-DD` format. */
  const today = (): string => now().slice(0, 10);

  /** Adds `days` to an ISO date string and returns the resulting `YYYY-MM-DD` string. */
  const addDays = (isoString: string, days: number): string => {
    const date = toD(isoString);
    date.setDate(date.getDate() + days);
    return lISO(date).slice(0, 10);
  };

  /** Calculates a person's age in completed years as of `atDate` (defaults to today). */
  function ageAt(dob?: string | null, atDate?: string | null): number | null {
    if (!dob) return null;
    const birthDate = toD(dob);
    const referenceDate = toD(atDate || today());
    let years = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
      years--;
    }
    return years;
  }

  /** Formats a number using South Asian (lakh/crore) digit grouping (e.g., `"1,00,000"`). */
  const inr = (amount: unknown): string => Number(amount || 0).toLocaleString("en-IN");

  /** Formats a monetary amount in Bangla Taka (e.g., `"টাকা ১,০০,০০০"`). */
  const tkBn = (amount: unknown): string => "টাকা " + bn(inr(amount));

  /** Generates a random 16-hex-character PKI certificate serial number (`XXXX-XXXX-XXXX-XXXX`). */
  const serial = (): string =>
    Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 65536)
        .toString(16)
        .toUpperCase()
        .padStart(4, "0"),
    ).join("-");

  /** Generates a random 6-digit numeric OTP code. */
  const otp = (): string => String(Math.floor(100000 + Math.random() * 900000));

  /** Extracts 1–2 uppercase initials from a person's full name (ignoring honorifics like Md./Mst.). */
  const ini = (fullName: unknown): string =>
    String(fullName || "?")
      .split(/\s+/)
      .filter((word) => word && !/^(md\.?|mst\.?)$/i.test(word))
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();

  /** Validates a 10, 13, or 17-digit Bangladesh National ID (NID) number. */
  const nidOk = (nid: unknown): boolean => /^(\d{10}|\d{13}|\d{17})$/.test(toEn(nid).trim());

  /** Validates an 11-digit Bangladesh mobile phone number starting with `01`. */
  const mobOk = (mobile: unknown): boolean => /^01\d{9}$/.test(toEn(mobile).trim());

  /** Validates a basic email address format. */
  const mailOk = (email: unknown): boolean => /^\S+@\S+\.\S+$/.test(String(email || "").trim());

  /** Deep-clones a JSON-serializable object. */
  const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj)) as T;

  /** Reads a dot-separated nested property path (e.g., `"groom.addr.dist"`) from an object. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getP = (target: any, path: string): any =>
    path.split(".").reduce((current, key) => (current == null ? current : current[key]), target);

  /** Writes a value to a dot-separated nested property path (e.g., `"groom.addr.dist"`) on an object. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setP = (target: any, path: string, value: unknown): void => {
    const keys = path.split(".");
    let current = target;
    keys.slice(0, -1).forEach((key) => {
      if (current[key] == null) current[key] = {};
      current = current[key];
    });
    const lastKey = keys[keys.length - 1];
    if (lastKey !== undefined) current[lastKey] = value;
  };

  return {
    esc,
    BND: BANGLA_DIGITS,
    bn,
    toEn,
    pad,
    MON: MONTH_NAMES,
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
