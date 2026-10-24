import type { AnyDeps, ApplicationRecord } from "../types";

/** constants/status. Dependencies: . */
export function createConstantsStatus(_dependencies: AnyDeps = {}) {
  const STATUS: Record<string, [string, string]> = {
    draft: ["Draft", "cx"],
    esign: ["Awaiting bride & groom eSign", "ct"],
    appraisal: ["Under registrar appraisal", "ca"],
    reverted: ["Reverted to applicant", "cr"],
    approval: ["Accepted, awaiting approval", "cb"],
    issued: ["Approved, ready to send", "cb"],
    sent: ["Sent to OneID Vault", "cg"],
  };
  const stKey = (a: ApplicationRecord): string =>
    a.status === "issued" && a.vault ? "sent" : a.status;
  const chip = (a: ApplicationRecord): string => {
    const entry = STATUS[stKey(a)] ?? ["Unknown", "cx"];
    return `<span class="chip ${entry[1]}">${entry[0]}</span>`;
  };
  const stepOf = (a: ApplicationRecord): number =>
    ({ draft: 0, reverted: 0, esign: 1, appraisal: 2, approval: 3, issued: 5 })[a.status] ?? 0;
  const coupleEn = (a: ApplicationRecord): string =>
    `${a.f.groom.nameEn || a.f.groom.nameBn || "—"} & ${a.f.bride.nameEn || a.f.bride.nameBn || "—"}`;
  return { STATUS, stKey, chip, stepOf, coupleEn };
}
