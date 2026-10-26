import type { JurNode } from "../types";

export const LEVELS = ["বিভাগ", "জেলা", "উপজেলা / সিটি কর্পোরেশন", "ইউনিয়ন / পৌরসভা", "ওয়ার্ড"];
export const LEVEL_EN = [
  "Division",
  "District",
  "Upazila / City Corporation",
  "Union / Pourashava",
  "Ward",
];
export const CCA = "সিটি কর্পোরেশন এলাকা";

const BND = "০১২৩৪৫৬৭৮৯";
const bn = (s: unknown): string => String(s ?? "").replace(/\d/g, (d) => BND[Number(d)] ?? d);
const pad = (n: number | string, l: number): string => String(n).padStart(l, "0");

export const TREE: Record<
  string,
  { code: string; d: Record<string, Record<string, Record<string, number>>> }
> = {
  ঢাকা: {
    code: "DHK",
    d: {
      ঢাকা: {
        "ঢাকা উত্তর সিটি কর্পোরেশন": { [CCA]: 7 },
        "ঢাকা দক্ষিণ সিটি কর্পোরেশন": { [CCA]: 6 },
        সাভার: { "সাভার পৌরসভা": 9, "আশুলিয়া ইউনিয়ন": 9, "তেঁতুলঝোড়া ইউনিয়ন": 9 },
        কেরানীগঞ্জ: { "শুভাড্যা ইউনিয়ন": 9, "জিনজিরা ইউনিয়ন": 9 },
      },
      গাজীপুর: {
        "গাজীপুর সিটি কর্পোরেশন": { [CCA]: 8 },
        কালিয়াকৈর: { "কালিয়াকৈর পৌরসভা": 9, "মৌচাক ইউনিয়ন": 9 },
      },
      নারায়ণগঞ্জ: {
        "নারায়ণগঞ্জ সিটি কর্পোরেশন": { [CCA]: 6 },
        রূপগঞ্জ: { "রূপগঞ্জ ইউনিয়ন": 9, "তারাব পৌরসভা": 9 },
      },
    },
  },
  চট্টগ্রাম: {
    code: "CTG",
    d: {
      চট্টগ্রাম: {
        "চট্টগ্রাম সিটি কর্পোরেশন": { [CCA]: 8 },
        হাটহাজারী: { "হাটহাজারী পৌরসভা": 9, "ফতেপুর ইউনিয়ন": 9 },
      },
      কুমিল্লা: {
        "কুমিল্লা সিটি কর্পোরেশন": { [CCA]: 6 },
        "কুমিল্লা আদর্শ সদর": { "আমড়াতলী ইউনিয়ন": 9 },
      },
    },
  },
  রাজশাহী: {
    code: "RAJ",
    d: {
      রাজশাহী: {
        "রাজশাহী সিটি কর্পোরেশন": { [CCA]: 6 },
        পবা: { "নওহাটা পৌরসভা": 9, "হরিপুর ইউনিয়ন": 9 },
      },
      বগুড়া: {
        "বগুড়া সদর": { "বগুড়া পৌরসভা": 9, "শাখারিয়া ইউনিয়ন": 9 },
      },
    },
  },
};

/**
 * Builds the hierarchical jurisdiction tree from the seed configuration.
 */
export function buildJur(): Record<string, JurNode> {
  const nodes: Record<string, JurNode> = {};
  let k = 0;
  const add = (name: string, level: number, parent: string | null): string => {
    const id = "j" + ++k;
    nodes[id] = { id, name, level, parent, kids: [] };
    if (parent && nodes[parent]) nodes[parent].kids.push(id);
    return id;
  };
  for (const [dv, dvv] of Object.entries(TREE)) {
    const a = add(dv, 0, null);
    if (nodes[a]) nodes[a].code = dvv.code;
    for (const [ds, dsv] of Object.entries(dvv.d)) {
      const b = add(ds, 1, a);
      for (const [up, upv] of Object.entries(dsv)) {
        const c = add(up, 2, b);
        for (const [un, wn] of Object.entries(upv)) {
          const d = add(un, 3, c);
          for (let w = 1; w <= wn; w++) add("ওয়ার্ড " + bn(pad(w, 2)), 4, d);
        }
      }
    }
  }
  return nodes;
}

