import type { JurNode } from "../types";
import { CCA } from "../constants/jurisdiction";

export const kidsOf = (
  jur: Record<string, JurNode>,
  id: string | null | undefined,
  level: number,
): JurNode[] => Object.values(jur).filter((n) => n.level === level && n.parent === id);

export const roots = (jur: Record<string, JurNode>): JurNode[] =>
  Object.values(jur).filter((n) => n.level === 0);

export const pathOf = (jur: Record<string, JurNode>, id: string | null | undefined): JurNode[] => {
  const p: JurNode[] = [];
  let n = id ? jur[id] : undefined;
  while (n) {
    p.unshift(n);
    n = n.parent ? jur[n.parent] : undefined;
  }
  return p;
};

export const placeOf = (jur: Record<string, JurNode>, wardIds?: string[]): string => {
  if (!wardIds || !wardIds.length) return "—";
  const firstWard = wardIds[0] ? jur[wardIds[0]] : undefined;
  if (!firstWard) return "—";
  const p = pathOf(jur, firstWard.parent)
    .map((n) => n.name)
    .reverse();
  const unionName = p[0] === CCA ? p[1] : p[0];
  return `${wardIds.map((w) => jur[w]?.name ?? "").join(", ")} · ${unionName ?? ""}`;
};

export const under = (jur: Record<string, JurNode>, wardId: string, nodeId: string): boolean => {
  let n: JurNode | undefined = jur[wardId];
  while (n) {
    if (n.id === nodeId) return true;
    n = n.parent ? jur[n.parent] : undefined;
  }
  return false;
};

/**
 * Builds a nested dictionary mapping for the entire jurisdiction tree.
 */
export function buildTreeData(
  jur: Record<string, JurNode>,
): Record<string, Record<string, Record<string, Record<string, string[]>>>> {
  const t: Record<string, Record<string, Record<string, Record<string, string[]>>>> = {};
  Object.values(jur)
    .filter((n) => n.level === 4)
    .forEach((w) => {
      const p = pathOf(jur, w.id);
      const d0 = p[0]?.name ?? "";
      const d1 = p[1]?.name ?? "";
      const d2 = p[2]?.name ?? "";
      const d3 = p[3]?.name ?? "";
      const t0 = (t[d0] = t[d0] || {});
      const t1 = (t0[d1] = t0[d1] || {});
      const t2 = (t1[d2] = t1[d2] || {});
      const t3 = (t2[d3] = t2[d3] || []);
      t3.push(w.name);
    });
  return t;
}
