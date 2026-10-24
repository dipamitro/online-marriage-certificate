import type { AnyDeps } from "../types";

/** services/fees. Dependencies: toEn. */
export function createServicesFees(dependencies: AnyDeps) {
  function fee(m: unknown): number {
    const amount = Number(dependencies.toEn(m)) || 0;
    if (amount <= 400000) return Math.round(amount * 0.0125);
    return 5000 + Math.ceil((amount - 400000) / 100000) * 100;
  }
  return { fee };
}
