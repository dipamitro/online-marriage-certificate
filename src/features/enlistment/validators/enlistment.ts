import type { EnlApplication, EnlState, EnlUser, JurNode } from "../types";
import { DOCS } from "../constants/people";
import { ageOf } from "../services/applications";

/**
 * Returns a dictionary mapping ward IDs to the licence numbers of the registrars who occupy them.
 */
export function takenWards(
  apps: EnlApplication[],
  exceptId: string | null,
): Record<string, string> {
  const m: Record<string, string> = {};
  apps
    .filter((a) => a.id !== exceptId && a.status === "ENLISTED")
    .forEach((a) => {
      a.j.wards.forEach((w) => {
        m[w] = a.licenceNo ?? "Enlisted";
      });
    });
  return m;
}

/**
 * Returns compliance and audit checks for an application.
 */
export function checksFor(
  a: EnlApplication,
  apps: EnlApplication[],
  settings: EnlState["settings"],
  userBy: (id: string | null | undefined) => EnlUser | null,
): Array<[string, string, boolean]> {
  const out: Array<[string, string, boolean]> = [];
  const age = ageOf(a.p.dob);
  out.push([
    "Age eligibility",
    `${age} years (${a.p.dob || "—"}). Rules require ${settings.minAge}–${settings.maxAge}.`,
    age >= settings.minAge && age <= settings.maxAge,
  ]);
  const u = a.userId ? userBy(a.userId) : null;
  out.push([
    "OneID eKYC verification",
    u && u.ekycAt
      ? `Verified via OneID eKYC on ${u.ekycAt.slice(0, 10)}.`
      : "eKYC is completed at sign-up.",
    Boolean(u && u.ekycAt),
  ]);
  const miss = DOCS.filter((x) => settings.reqDocs.includes(x[0]) && !a.docs[x[0]]);
  out.push([
    "Required documents",
    miss.length
      ? `Missing: ${miss.map((m) => m[1]).join(", ")}`
      : `All ${settings.reqDocs.length} required documents uploaded.`,
    miss.length === 0,
  ]);
  const t = takenWards(apps, a.id);
  const clash = a.j.wards.filter((w) => t[w]);
  out.push([
    "Ward availability",
    clash.length
      ? `Clash with licence(s): ${clash.map((w) => t[w]).join(", ")}`
      : `${a.j.wards.length} ward(s) requested. None are currently held.`,
    clash.length === 0 || settings.multiPerWard,
  ]);
  const dup = apps.find(
    (x) =>
      x.id !== a.id &&
      String(x.p.nid) === String(a.p.nid) &&
      ["SUBMITTED", "ENLISTED"].includes(x.status),
  );
  out.push([
    "Duplicate application",
    dup
      ? `Applicant already has ${dup.status.toLowerCase()} application ${dup.appNo}.`
      : "No other active application for this NID.",
    !dup,
  ]);
  return out;
}

/**
 * Validates an applicant's draft application before submission.
 */
export function validateEnlistment(
  d: EnlApplication,
  apps: EnlApplication[],
  settings: EnlState["settings"],
): string[] {
  const e: string[] = [];
  const age = ageOf(d.p.dob);
  if (!d.p.nameBn.trim()) e.push("Name (Bangla) is required");
  if (!d.p.nameEn.trim()) e.push("Name (English) is required");
  if (!d.p.father.trim()) e.push("Father's name is required");
  if (!d.p.mother.trim()) e.push("Mother's name is required");
  if (!d.c.address.trim()) e.push("Present address is required");
  if (age < settings.minAge || age > settings.maxAge)
    e.push(`Age must be between ${settings.minAge} and ${settings.maxAge} (currently ${age})`);
  if (!d.q.degree.trim()) e.push("Educational degree is required");
  if (!d.q.institution.trim()) e.push("Institution is required");
  if (!d.q.year.trim()) e.push("Passing year is required");
  if (!d.j.uni) e.push("Union / Pourashava is required");
  if (!d.j.wards.length) e.push("Select at least one ward");
  const t = takenWards(apps, d.id);
  const clash = d.j.wards.filter((w) => t[w]);
  if (clash.length && !settings.multiPerWard) {
    e.push(`Selected ward(s) already held by ${clash.map((w) => t[w]).join(", ")}`);
  }
  if (!d.o.name.trim()) e.push("Office name is required");
  if (!d.o.address.trim()) e.push("Office address is required");
  const miss = DOCS.filter((x) => settings.reqDocs.includes(x[0]) && !d.docs[x[0]]);
  if (miss.length) e.push("Missing documents: " + miss.map((x) => x[1]).join(", "));
  if (!d.declare) e.push("You must confirm the truthfulness declaration");
  return e;
}
