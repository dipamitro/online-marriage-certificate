import type { EnlApplication, EnlState, EnlUIState, EnlUser, JurNode } from "../types";
import { buildJur, CCA } from "../constants/jurisdiction";
import { DOCS, PEOPLE } from "../constants/people";
import { addDays, now, pad, today } from "./applications";
import { kidsOf, pathOf, roots } from "./jurisdiction";

export const STORE = "omr-merged-enl-v3";

export const ls = {
  get(k: string): string | null {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string): void {
    try {
      localStorage.setItem(k, v);
    } catch {
      // Ignore storage write error
    }
  },
  del(k: string): void {
    try {
      localStorage.removeItem(k);
    } catch {
      // Ignore storage delete error
    }
  },
};

export function createDefaultEnlUI(): EnlUIState {
  return {
    role: "applicant",
    auth: { applicant: null, admin: null, super: null },
    page: { applicant: "dash", admin: "dash", super: "dash" },
    open: null,
    draft: null,
    dirNode: null,
    dirOpen: {},
    dirQ: "",
    dirSt: "ENLISTED",
    inboxSel: null,
    sb: false,
    login: { applicant: "1985123401" },
  };
}

export function nextLicence(state: EnlState, jur: Record<string, JurNode>, divId: string): string {
  const code = jur[divId]?.code ?? "DHK";
  state.seq.lic[code] = (state.seq.lic[code] || 0) + 1;
  return `MR-${code}-${today().slice(0, 4)}-${pad(state.seq.lic[code] ?? 1, 4)}`;
}

export function seedData(J: Record<string, JurNode> = buildJur()): EnlState {
  const B = () => (typeof window !== "undefined" ? window.OMRBridge : undefined);
  const S: EnlState = {
    users: [],
    apps: [],
    audit: [],
    seq: { app: 1040, lic: {} },
    settings: { minAge: 21, maxAge: 50, reqDocs: DOCS.map((d) => d[0]), multiPerWard: false },
  };
  S.users.push({
    id: "u-super",
    role: "super",
    nid: "1979000001",
    name: "Md. Rafiqul Islam",
    designation: "Joint Secretary (Registration), Law and Justice Division",
    email: "rafiqul.islam@lawjustice.gov.bd",
    mobile: "01711000001",
    active: true,
  });
  S.users.push({
    id: "u-admin",
    role: "admin",
    nid: "1986000002",
    name: "Farhana Akter",
    designation: "System Administrator",
    email: "farhana.akter@lawjustice.gov.bd",
    mobile: "01711000002",
    active: true,
  });
  const findWard = (div: string, dist: string, upz: string, uni: string, w: number[]): string[] => {
    const d0 = roots(J).find((n) => n.name === div);
    if (!d0) return [];
    const d1 = kidsOf(J, d0.id, 1).find((n) => n.name === dist);
    if (!d1) return [];
    const d2 = kidsOf(J, d1.id, 2).find((n) => n.name === upz);
    if (!d2) return [];
    const d3 = kidsOf(J, d2.id, 3).find((n) => n.name === uni);
    if (!d3) return [];
    const wNodes = kidsOf(J, d3.id, 4);
    return w.map((x) => wNodes[x - 1]?.id ?? "").filter(Boolean);
  };
  const enl: Array<
    [
      string,
      string,
      string,
      string,
      string,
      string,
      number[],
      string,
      string,
      string?,
      string?,
      string?,
      string?,
    ]
  > = [
    [
      "মোঃ কামাল উদ্দিন",
      "Md. Kamal Uddin",
      "ঢাকা",
      "ঢাকা",
      "ঢাকা উত্তর সিটি কর্পোরেশন",
      CCA,
      [6, 7],
      "মিরপুর কাজী অফিস, সেকশন ৭, মিরপুর, ঢাকা",
      "01711000412",
      "6012345678",
      "NR-DHK-0412",
      "kamal.kazi@mail.com",
      "1975-06-14",
    ],
    [
      "মোঃ শহিদুল ইসলাম",
      "Md. Shahidul Islam",
      "ঢাকা",
      "ঢাকা",
      "সাভার",
      "সাভার পৌরসভা",
      [1, 2, 3],
      "গেন্ডা কাজী অফিস, গেন্ডা, সাভার, ঢাকা",
      "01914811118",
      "6111111111",
      "NR-DHK-0377",
      "shahidul.kazi@mail.com",
      "1972-04-02",
    ],
    [
      "মোঃ গোলাম মোস্তফা",
      "Md. Golam Mostofa",
      "ঢাকা",
      "ঢাকা",
      "সাভার",
      "সাভার পৌরসভা",
      [4, 5],
      "আনন্দপুর কাজী অফিস, সাভার, ঢাকা",
      "01714822228",
      "6222222222",
      "NR-DHK-0455",
      "golam.kazi@mail.com",
      "1969-09-19",
    ],
    [
      "মোঃ আব্দুল কাদের",
      "Md. Abdul Kader",
      "ঢাকা",
      "গাজীপুর",
      "গাজীপুর সিটি কর্পোরেশন",
      CCA,
      [1, 2],
      "টঙ্গী কাজী অফিস, টঙ্গী, গাজীপুর",
      "01715833338",
      "6333333333",
      "NR-GZP-0120",
      "kader.kazi@mail.com",
      "1977-12-08",
    ],
    [
      "মোঃ আনোয়ার হোসেন",
      "Md. Anwar Hossain",
      "ঢাকা",
      "ঢাকা",
      "সাভার",
      "আশুলিয়া ইউনিয়ন",
      [1, 2, 3, 4],
      "আশুলিয়া কাজী অফিস, জামগড়া, আশুলিয়া",
      "01715000221",
    ],
    [
      "মোঃ সিরাজুল হক",
      "Md. Sirajul Haque",
      "ঢাকা",
      "নারায়ণগঞ্জ",
      "রূপগঞ্জ",
      "তারাব পৌরসভা",
      [1, 2, 3],
      "তারাব কাজী অফিস, রূপগঞ্জ",
      "01716000331",
    ],
    [
      "মোঃ ইউসুফ আলী",
      "Md. Yusuf Ali",
      "চট্টগ্রাম",
      "চট্টগ্রাম",
      "চট্টগ্রাম সিটি কর্পোরেশন",
      CCA,
      [1, 2, 3],
      "আগ্রাবাদ কাজী অফিস, চট্টগ্রাম",
      "01817000441",
    ],
    [
      "মোঃ শফিকুর রহমান",
      "Md. Shafiqur Rahman",
      "চট্টগ্রাম",
      "কুমিল্লা",
      "কুমিল্লা আদর্শ সদর",
      "আমড়াতলী ইউনিয়ন",
      [1, 2, 3, 4, 5],
      "আমড়াতলী কাজী অফিস, কুমিল্লা",
      "01818000551",
    ],
    [
      "মোঃ রুহুল আমিন",
      "Md. Ruhul Amin",
      "রাজশাহী",
      "রাজশাহী",
      "রাজশাহী সিটি কর্পোরেশন",
      CCA,
      [1, 2, 3],
      "সাহেব বাজার কাজী অফিস, রাজশাহী",
      "01719000661",
    ],
    [
      "মোঃ হারুনুর রশিদ",
      "Md. Harunur Rashid",
      "রাজশাহী",
      "বগুড়া",
      "বগুড়া সদর",
      "বগুড়া পৌরসভা",
      [1, 2],
      "সাতমাথা কাজী অফিস, বগুড়া",
      "01720000771",
    ],
  ];
  enl.forEach((r, i) => {
    const wards = findWard(r[2], r[3], r[4], r[5], r[6]),
      path = pathOf(J, wards[0]);
    const nid = r[9] || "17" + pad(80001 + i, 8);
    S.seq.app++;
    const code = J[path[0]?.id ?? "j1"]?.code ?? "DHK";
    S.seq.lic[code] = (S.seq.lic[code] || 0) + 1;
    const lic =
      r[10] || "MR-" + code + "-" + today().slice(0, 4) + "-" + pad(S.seq.lic[code] ?? 1, 4);
    const at = addDays(-200 + i * 11);
    S.apps.push({
      id: "seed" + i,
      approverTitle: "Super Admin",
      appNo: "ENL-2026-" + S.seq.app,
      userId: nid,
      status: "ENLISTED",
      createdAt: at,
      submittedAt: at,
      p: {
        nameBn: r[0],
        nameEn: r[1],
        father: "",
        mother: "",
        dob: r[12] || 1970 + i + "-0" + (1 + (i % 9)) + "-1" + (i % 9),
        nid,
        gender: "Male",
      },
      c: {
        mobile: r[8],
        email:
          r[11] ||
          r[1]
            .toLowerCase()
            .replace(/[^a-z]+/g, ".")
            .replace(/^\.|\.$/g, "") + "@kazi.gov.bd",
        address: r[7],
      },
      q: {
        degree: "Kamil",
        institution: "Government Madrasah-e-Alia",
        year: String(1995 + i),
        result: "First class",
      },
      j: {
        div: path[0]?.id ?? "",
        dist: path[1]?.id ?? "",
        upz: path[2]?.id ?? "",
        uni: path[3]?.id ?? "",
        wards,
      },
      o: { name: r[7].split(",")[0] ?? r[7], address: r[7], phone: r[8] },
      docs: Object.fromEntries(DOCS.map((d) => [d[0], d[0] + ".pdf"])),
      declare: true,
      licenceNo: lic,
      approvedAt: at,
      approvedBy: "Md. Rafiqul Islam",
      validTo: addDays(-200 + i * 11 + 365 * 5).slice(0, 10),
      history: [{ at, by: "System", text: "Migrated from the existing licence register" }],
    });
  });
  const mkApp = (
    nid: string,
    status: string,
    div: string,
    dist: string,
    upz: string,
    uni: string,
    w: number[],
  ): EnlApplication => {
    const P = PEOPLE[nid] ?? { en: nid, bn: nid, dob: "1985-01-01", g: "M" };
    const bridge = B();
    const dc = bridge && bridge.demoContact ? bridge.demoContact(nid) : null;
    const email = dc
      ? dc.email
      : P.en
          .toLowerCase()
          .replace(/[^a-z]+/g, ".")
          .replace(/^\.|\.$/g, "") + "@mail.com";
    const mobile = dc ? dc.mobile : "017" + nid.slice(-8);
    const a: EnlApplication = {
      id: null,
      appNo: "",
      userId: nid,
      status,
      createdAt: addDays(-4),
      p: {
        nameBn: P.bn,
        nameEn: P.en,
        father: P.father || "",
        mother: P.mother || "",
        dob: P.dob,
        nid,
        gender: "Male",
      },
      c: { mobile, email, address: "" },
      q: { degree: "", institution: "", year: "", result: "" },
      j: { div: "", dist: "", upz: "", uni: "", wards: [] },
      o: { name: "", address: "", phone: "" },
      docs: {},
      declare: true,
      history: [],
    };
    S.seq.app++;
    a.id = "a" + S.seq.app;
    a.appNo = "ENL-2026-" + S.seq.app;
    a.submittedAt = addDays(-3);
    const wards = findWard(div, dist, upz, uni, w),
      path = pathOf(J, wards[0]);
    a.j = {
      div: path[0]?.id ?? "",
      dist: path[1]?.id ?? "",
      upz: path[2]?.id ?? "",
      uni: path[3]?.id ?? "",
      wards,
    };
    a.q = {
      degree: "Kamil",
      institution: "Dhaka Alia Madrasah",
      year: "2008",
      result: "First class",
    };
    a.c.address = "বাড়ি ১২, রোড ৪, " + uni + ", " + upz;
    a.o = {
      name: uni + " কাজী অফিস",
      address: "প্রধান সড়ক, " + uni + ", " + upz + ", " + dist,
      phone: mobile,
    };
    a.docs = Object.fromEntries(DOCS.map((d) => [d[0], d[0] + ".pdf"]));
    a.history.push({ at: a.submittedAt || now(), by: P.en, text: "Application submitted" });
    S.apps.push(a);
    return a;
  };
  mkApp("1985123401", "SUBMITTED", "ঢাকা", "ঢাকা", "সাভার", "তেঁতুলঝোড়া ইউনিয়ন", [1, 2, 3]);
  mkApp("1988123402", "SUBMITTED", "ঢাকা", "গাজীপুর", "কালিয়াকৈর", "মৌচাক ইউনিয়ন", [1, 2, 3, 4]);
  const a3 = mkApp(
    "1984123404",
    "RETURNED",
    "চট্টগ্রাম",
    "চট্টগ্রাম",
    "হাটহাজারী",
    "ফতেপুর ইউনিয়ন",
    [1, 2],
  );
  a3.docs["residence"] = "";
  a3.returnNote =
    "Proof of residence in the requested area is missing. Please upload it and resubmit.";
  a3.history.push({ at: now(), by: "Farhana Akter", text: "Returned: " + a3.returnNote });
  return S;
}

export function ensureEnlistmentData(lsStorage = ls): {
  state: EnlState;
  jur: Record<string, JurNode>;
} {
  let L: EnlState | null = null;
  try {
    L = JSON.parse(lsStorage.get(STORE) || "null") as EnlState | null;
  } catch {
    L = null;
  }
  const jur = buildJur();
  let state: EnlState;
  if (L && L.apps) {
    state = L;
    (state.extraWards || []).forEach((w) => {
      if (jur[w.parent]) {
        jur[w.id] = { id: w.id, name: w.name, level: 4, parent: w.parent, kids: [] };
        jur[w.parent]?.kids.push(w.id);
      }
    });
    (state.users || []).forEach((u) => {
      if (u.nid && !PEOPLE[u.nid]) {
        PEOPLE[u.nid] = {
          en: u.name,
          bn: u.nameBn || u.name,
          dob: u.dob || "1996-05-15",
          g: "M",
        };
      }
    });
  } else {
    state = seedData(jur);
    lsStorage.set(STORE, JSON.stringify(state));
  }
  return { state, jur };
}

export function saveEnlistmentState(state: EnlState, lsStorage = ls): void {
  lsStorage.set(STORE, JSON.stringify(state));
}
