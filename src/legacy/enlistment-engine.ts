import type { ENLBridgeContract } from "../features/registration/types";

interface JurNode {
  id: string;
  name: string;
  level: number;
  parent: string | null;
  kids: string[];
  code?: string;
}

interface EnlUser {
  id: string;
  role: string;
  nid: string;
  name: string;
  nameBn?: string;
  dob?: string;
  designation?: string;
  email: string;
  mobile: string;
  active: boolean;
  ekycAt?: string;
  ekycMethod?: unknown;
}

interface EnlHistoryItem {
  at: string;
  by: string;
  text: string;
}

interface EnlApplication {
  id: string | null;
  appNo: string;
  userId: string;
  status: string;
  createdAt: string;
  submittedAt?: string;
  approverTitle?: string;
  licenceNo?: string;
  approvedAt?: string;
  approvedBy?: string;
  validTo?: string;
  seal?: string;
  returnNote?: string;
  rejectNote?: string;
  p: {
    nameBn: string;
    nameEn: string;
    father: string;
    mother: string;
    dob: string;
    nid: string;
    gender: string;
  };
  c: {
    mobile: string;
    email: string;
    address: string;
  };
  q: {
    degree: string;
    institution: string;
    year: string;
    result: string;
  };
  j: {
    div: string;
    dist: string;
    upz: string;
    uni: string;
    wards: string[];
  };
  o: {
    name: string;
    address: string;
    phone: string;
  };
  docs: Record<string, string>;
  declare: boolean;
  history: EnlHistoryItem[];
}

interface EnlAuditItem {
  at: string;
  by: string;
  text: string;
  appId: string | null;
}

interface EnlEmailItem {
  id: string;
  to: string;
  toName: string;
  subject: string;
  body: string[];
  at: string;
  read: boolean;
}

interface EnlExtraWard {
  id: string;
  name: string;
  parent: string;
}

interface EnlState {
  users: EnlUser[];
  apps: EnlApplication[];
  audit: EnlAuditItem[];
  emails?: EnlEmailItem[];
  extraWards?: EnlExtraWard[];
  seq: {
    app: number;
    lic: Record<string, number>;
  };
  settings: {
    minAge: number;
    maxAge: number;
    reqDocs: string[];
    multiPerWard: boolean;
  };
}

interface EnlUIState {
  role: string;
  auth: Record<string, string | boolean | null>;
  page: Record<string, string>;
  open: string | null;
  draft: EnlApplication | null;
  dirNode: string | null;
  dirOpen: Record<string, boolean>;
  dirQ: string;
  dirSt: string;
  inboxSel: string | null;
  sb: boolean;
  errs?: string[] | null;
  onb?: Record<string, unknown> | null;
  login: Record<string, string>;
}

function createDefaultEnlUI(): EnlUIState {
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

let sharedEnlUI: EnlUIState = createDefaultEnlUI();
let cleanupPreviousEnlistmentListeners: (() => void) | null = null;

// Enlistment engine (registrar enlistment & jurisdiction). Exposes window.ENLBridge.
export function bootEnlistment(): void {
  if (cleanupPreviousEnlistmentListeners) {
    cleanupPreviousEnlistmentListeners();
    cleanupPreviousEnlistmentListeners = null;
  }

  const $ = (s: string): HTMLElement | null => document.querySelector<HTMLElement>(s);
  const esc = (s: unknown): string =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
    );
  const BND = "০১২৩৪৫৬৭৮৯",
    bn = (s: unknown): string => String(s ?? "").replace(/\d/g, (d) => BND[Number(d)] ?? d);
  const pad = (n: number | string, l: number): string => String(n).padStart(l, "0");
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function lISO(d: Date): string {
    const z = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`;
  }
  const now = (): string => lISO(new Date()),
    today = (): string => now().slice(0, 10);
  const addDays = (n: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return lISO(d);
  };
  const toD = (s: string): Date => new Date(s.length === 10 ? s + "T00:00:00" : s);
  const fD = (s?: string | null): string => {
    if (!s) return "—";
    const d = toD(s);
    return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
  };
  const fDT = (s?: string | null): string => {
    if (!s) return "—";
    const d = toD(s);
    let h = d.getHours();
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${fD(s)}, ${h}:${String(d.getMinutes()).padStart(2, "0")} ${ap}`;
  };
  const ageOf = (dob: string): number => {
    const b = toD(dob),
      a = new Date();
    let y = a.getFullYear() - b.getFullYear();
    const m = a.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && a.getDate() < b.getDate())) y--;
    return y;
  };
  const ini = (n?: string | null): string =>
    String(n || "?")
      .split(/\s+/)
      .filter((w) => w && !/^md\.?$/i.test(w))
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  const otpCode = (): string => String(Math.floor(100000 + Math.random() * 900000));
  const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o)) as T;
  const ls = {
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

  /* ---------- jurisdiction hierarchy ---------- */
  const LEVELS = ["বিভাগ", "জেলা", "উপজেলা / সিটি কর্পোরেশন", "ইউনিয়ন / পৌরসভা", "ওয়ার্ড"];
  const LEVEL_EN = [
    "Division",
    "District",
    "Upazila / City Corporation",
    "Union / Pourashava",
    "Ward",
  ];
  const CCA = "সিটি কর্পোরেশন এলাকা";
  const TREE: Record<
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
  function buildJur(): Record<string, JurNode> {
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
  const kidsOf = (
    jur: Record<string, JurNode>,
    id: string | null | undefined,
    level: number,
  ): JurNode[] => Object.values(jur).filter((n) => n.level === level && n.parent === id);
  const roots = (jur: Record<string, JurNode>): JurNode[] =>
    Object.values(jur).filter((n) => n.level === 0);
  const pathOf = (jur: Record<string, JurNode>, id: string | null | undefined): JurNode[] => {
    const p: JurNode[] = [];
    let n = id ? jur[id] : undefined;
    while (n) {
      p.unshift(n);
      n = n.parent ? jur[n.parent] : undefined;
    }
    return p;
  };
  const placeOf = (jur: Record<string, JurNode>, wardIds?: string[]): string => {
    if (!wardIds || !wardIds.length) return "—";
    const firstWard = wardIds[0] ? jur[wardIds[0]] : undefined;
    if (!firstWard) return "—";
    const p = pathOf(jur, firstWard.parent)
      .map((n) => n.name)
      .reverse();
    const unionName = p[0] === CCA ? p[1] : p[0];
    return `${wardIds.map((w) => jur[w]?.name ?? "").join(", ")} · ${unionName ?? ""}`;
  };
  const under = (jur: Record<string, JurNode>, wardId: string, nodeId: string): boolean => {
    let n: JurNode | undefined = jur[wardId];
    while (n) {
      if (n.id === nodeId) return true;
      n = n.parent ? jur[n.parent] : undefined;
    }
    return false;
  };

  /* ---------- people (simulated NID / OneID) ---------- */
  const PEOPLE: Record<
    string,
    { en: string; bn: string; dob: string; g: string; father?: string; mother?: string }
  > = {
    "1985123401": {
      en: "Md. Abdur Rahim",
      bn: "মোঃ আব্দুর রহিম",
      dob: "1985-03-14",
      g: "M",
      father: "Md. Abdul Karim",
      mother: "Rahima Khatun",
    },
    "1988123402": {
      en: "Md. Nurul Amin",
      bn: "মোঃ নুরুল আমিন",
      dob: "1988-07-22",
      g: "M",
      father: "Md. Shafiqul Amin",
      mother: "Nurjahan Begum",
    },
    "1990123403": {
      en: "Md. Habibur Rahman",
      bn: "মোঃ হাবিবুর রহমান",
      dob: "1990-11-02",
      g: "M",
      father: "Md. Lutfur Rahman",
      mother: "Hosne Ara",
    },
    "1984123404": {
      en: "Md. Zakir Hossain",
      bn: "মোঃ জাকির হোসেন",
      dob: "1984-01-30",
      g: "M",
      father: "Md. Idris Ali",
      mother: "Saleha Begum",
    },
    "1992123405": {
      en: "Md. Mizanur Rahman",
      bn: "মোঃ মিজানুর রহমান",
      dob: "1992-05-09",
      g: "M",
      father: "Md. Ataur Rahman",
      mother: "Rokeya Begum",
    },
    "1979000001": { en: "Md. Rafiqul Islam", bn: "মোঃ রফিকুল ইসলাম", dob: "1979-06-01", g: "M" },
    "1986000002": { en: "Farhana Akter", bn: "ফারহানা আক্তার", dob: "1986-09-12", g: "F" },
  };
  const SIGNUP_DEMOS = ["1990123403", "1992123405"];

  /* ---------- state ---------- */
  const STORE = "omr-merged-enl-v3";
  let VIS = false;
  const B = () => window.OMRBridge;
  const bUser = (nid: string | null | undefined): EnlUser | null => {
    const bridge = B();
    if (!bridge || !nid) return null;
    const u = bridge.user(nid);
    if (!u) return null;
    return {
      id: u.id,
      role: "applicant",
      nid: u.nid,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      active: true,
      ...(u.ekycAt !== undefined ? { ekycAt: u.ekycAt } : {}),
      ...(u.ekycMethod !== undefined ? { ekycMethod: u.ekycMethod } : {}),
    };
  };
  let S!: EnlState;
  let J!: Record<string, JurNode>;
  if (!ls.get(STORE)) {
    sharedEnlUI = createDefaultEnlUI();
  }
  const UI: EnlUIState = sharedEnlUI;
  const save = (): void => ls.set(STORE, JSON.stringify(S));
  const appById = (id: string | null | undefined): EnlApplication | undefined =>
    S.apps.find((a) => a.id === id);
  const userBy = (id: string | null | undefined): EnlUser | null =>
    S.users.find((u) => u.id === id || u.nid === id) || bUser(id);
  function log(by: string, text: string, appId?: string | null): void {
    S.audit.unshift({ at: now(), by, text, appId: appId || null });
  }
  function mail(to: string, toName: string, subject: string, body: string[]): void {
    const bridge = B();
    if (bridge) bridge.mail(to, toName, subject, body);
  }
  function hist(a: EnlApplication, by: string, text: string): void {
    (a.history = a.history || []).push({ at: now(), by, text });
  }

  const ST: Record<string, [string, string]> = {
    DRAFT: ["Draft", "c-dr"],
    SUBMITTED: ["Awaiting review and approval", "c-sub"],
    RETURNED: ["Returned for correction", "c-ret"],
    FORWARDED: ["Awaiting Super Admin approval", "c-fwd"],
    ENLISTED: ["Enlisted", "c-ok"],
    REJECTED: ["Rejected", "c-rej"],
    SUSPENDED: ["Suspended", "c-sus"],
    CANCELLED: ["Cancelled", "c-rej"],
  };
  const chip = (s: string): string => {
    const pair = ST[s] ?? [s, "c-dr"];
    return `<span class="chip ${pair[1]}">${pair[0]}</span>`;
  };
  const DOCS: Array<[string, string]> = [
    ["photo", "Passport-size photograph"],
    ["degree", "Kamil / Fazil (or equivalent) certificate"],
    ["character", "Character certificate (UP Chairman / Councillor)"],
    ["residence", "Proof of residence in the requested area"],
  ];

  function blankApp(user: EnlUser): EnlApplication {
    const bridge = B();
    const P: {
      en?: string;
      bn?: string;
      dob?: string;
      g?: string;
      father?: string;
      mother?: string;
    } = Object.assign({}, PEOPLE[user.nid] || {}, (bridge && bridge.person(user.nid)) || {});
    return {
      id: null,
      appNo: "",
      userId: user.nid,
      status: "DRAFT",
      createdAt: now(),
      p: {
        nameBn: P.bn || user.nameBn || user.name,
        nameEn: P.en || user.name,
        father: P.father || "",
        mother: P.mother || "",
        dob: P.dob || user.dob || "",
        nid: user.nid,
        gender: P.g === "F" ? "Female" : "Male",
      },
      c: { mobile: user.mobile, email: user.email, address: "" },
      q: { degree: "", institution: "", year: "", result: "" },
      j: { div: "", dist: "", upz: "", uni: "", wards: [] },
      o: { name: "", address: "", phone: "" },
      docs: {},
      declare: false,
      history: [],
    };
  }

  function nextLicence(divId: string): string {
    const code = J[divId]?.code ?? "DHK";
    S.seq.lic[code] = (S.seq.lic[code] || 0) + 1;
    return `MR-${code}-${today().slice(0, 4)}-${pad(S.seq.lic[code] ?? 1, 4)}`;
  }

  function seed(): void {
    J = buildJur();
    S = {
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
    const findWard = (
      div: string,
      dist: string,
      upz: string,
      uni: string,
      w: number[],
    ): string[] => {
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
      const lic = r[10] || nextLicence(path[0]?.id ?? "j1");
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
      a.history.push({ at: a.submittedAt, by: P.en, text: "Application submitted" });
      S.apps.push(a);
      return a;
    };
    mkApp("1985123401", "SUBMITTED", "ঢাকা", "ঢাকা", "সাভার", "তেঁতুলঝোড়া ইউনিয়ন", [1, 2, 3]);
    mkApp(
      "1988123402",
      "SUBMITTED",
      "ঢাকা",
      "গাজীপুর",
      "কালিয়াকৈর",
      "মৌচাক ইউনিয়ন",
      [1, 2, 3, 4],
    );
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
    log("System", "Portal initialised with 10 enlisted registrars and 3 pending applications");
    save();
  }

  function ensureData(): void {
    let L: EnlState | null = null;
    try {
      L = JSON.parse(ls.get(STORE) || "null") as EnlState | null;
    } catch {
      L = null;
    }
    if (L && L.apps) {
      S = L;
      J = buildJur();
      (S.extraWards || []).forEach((w) => {
        if (J[w.parent]) {
          J[w.id] = { id: w.id, name: w.name, level: 4, parent: w.parent, kids: [] };
          J[w.parent]?.kids.push(w.id);
        }
      });
      (S.users || []).forEach((u) => {
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
      seed();
    }
  }

  // Ensure J and S are populated synchronously on boot
  ensureData();

  /* ---------- VDS seal (real ECDSA in this browser) ---------- */
  let KEYS: { priv: CryptoKey; pub: CryptoKey } | null = null;
  const b64u = (b: ArrayBuffer): string =>
    btoa(String.fromCharCode(...new Uint8Array(b)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  async function initKeys(): Promise<void> {
    try {
      const alg = { name: "ECDSA", namedCurve: "P-256" },
        st = ls.get("mrep-keys");
      if (st) {
        const j = JSON.parse(st) as { priv: JsonWebKey; pub: JsonWebKey };
        KEYS = {
          priv: await crypto.subtle.importKey("jwk", j.priv, alg, true, ["sign"]),
          pub: await crypto.subtle.importKey("jwk", j.pub, alg, true, ["verify"]),
        };
      } else {
        const k = await crypto.subtle.generateKey(alg, true, ["sign", "verify"]);
        KEYS = { priv: k.privateKey, pub: k.publicKey };
        ls.set(
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
  }
  async function sealFor(a: EnlApplication): Promise<string> {
    const pl = [
      "BDMR1",
      a.licenceNo ?? "",
      (a.approvedAt ?? "").slice(0, 10),
      a.p.nameEn,
      String(a.p.nid).slice(-4),
      placeOf(J, a.j.wards).replace(/\|/g, "/"),
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

  /* ---------- render ---------- */
  function render(): void {
    if (!VIS) return;
    const r = UI.role;
    const eroot = $("#eroot");
    if (!eroot) return;
    eroot.innerHTML = !UI.auth[r] ? loginPage(r) : shell(r);
    document.querySelectorAll<HTMLElement>("#eroot [data-qr]").forEach((el) => {
      if (typeof QRCode === "function" && !el.dataset["done"]) {
        el.dataset["done"] = "1";
        try {
          new QRCode(el, {
            text: el.dataset["qr"] ?? "",
            width: 100,
            height: 100,
            correctLevel: QRCode.CorrectLevel.M,
          });
        } catch {
          // Ignore QR rendering error
        }
      }
    });
  }
  function loginPage(r: string): string {
    const cfgMap: Record<string, { h: string; p: string; steps: string[] }> = {
      applicant: {
        h: "Apply to become a marriage registrar",
        p: "Individuals who wish to serve as a Nikah Registrar sign in with OneID, apply for the wards they want to serve, and track their application until the licence is issued.",
        steps: [
          "Sign up once with OneID eKYC",
          "Fill in qualifications, jurisdiction, office and documents",
          "An Admin or the Super Admin reviews it",
          "They approve with eSign; the licence goes to your OneID Wallet",
        ],
      },
      admin: {
        h: "Admin console",
        p: "Admins review applications and approve them with eSign, maintain the jurisdiction master and settings, and see every enlisted registrar by division, district, upazila, union and ward.",
        steps: [
          "Read the full application form",
          "Approve with eSign, return or reject",
          "Maintain jurisdictions and settings",
          "Browse the registrar directory",
        ],
      },
      super: {
        h: "Super Admin console",
        p: "The Super Admin has full access: approve registrars with eSign, suspend, reinstate or cancel licences, and manage admins.",
        steps: [
          "Read the full application form",
          "Approve with eSign, return or reject",
          "Suspend, reinstate or cancel registrars",
          "Add or disable admins",
        ],
      },
    };
    const cfg = cfgMap[r] ?? cfgMap["applicant"]!;
    let form: string;
    if (r === "applicant") {
      const apps = S.users.filter((u) => u.role === "applicant");
      if (!apps.some((u) => u.nid === UI.login["applicant"]))
        UI.login["applicant"] = apps[0] ? apps[0].nid : "";
      form = `<div class="fg"><label>OneID account <span class="en">(people who have signed up)</span></label><select class="inp" data-login="applicant">${apps.map((u) => `<option value="${u.nid}" ${UI.login["applicant"] === u.nid ? "selected" : ""}>${esc(u.name)} (NID ••••${u.nid.slice(-4)})</option>`).join("")}</select></div>
      <div class="fg"><label>Password</label><input class="inp" type="password" value="demo-pass" readonly></div>
      <button class="btn bp bfw" data-act="login" data-r="applicant">Sign in with OneID</button>
      <div class="or">New here?</div><button class="btn bfw" data-act="signup">Sign up with OneID eKYC</button>
      <p class="hint" style="text-align:center">Register, confirm the email code, set a password, then verify with your NID (camera scan or manual) or passport (scan + NFC) and a face check. eKYC is done only once.</p>`;
    } else {
      const u = userBy(r === "admin" ? "u-admin" : "u-super");
      form = `<div class="fg"><label>Official account</label><input class="inp" value="${esc(u?.name)} · ${esc(u?.designation)}" readonly></div>
      <div class="fg"><label>Password</label><input class="inp" type="password" value="demo-pass" readonly></div>
      <button class="btn bp bfw" data-act="login" data-r="${r}">Sign in</button><p class="hint" style="text-align:center;margin-top:10px">Officials sign in with a second factor in production.</p>`;
    }
    return `<div class="login"><div class="lcard"><div class="lleft"><div class="seal">LJD</div><h1>${cfg.h}</h1><p>${cfg.p}</p><ol>${cfg.steps.map((s) => `<li>${s}</li>`).join("")}</ol></div>
    <div class="lright"><h2>Sign in</h2><p class="sub" style="margin-bottom:16px">Marriage Registrar Enlistment Portal · Law and Justice Division</p>${form}<p class="hint" style="text-align:center;margin-top:16px">Prototype: OneID, eKYC, eSign and email are simulated.</p></div></div></div>`;
  }
  function navFor(r: string): Array<[string] | [string, string, number?]> {
    const cnt = (st: string[]): number => S.apps.filter((a) => st.includes(a.status)).length;
    if (r === "applicant")
      return [
        ["My application"],
        ["dash", "Dashboard"],
        ["apply", "Application"],
        ["licence", "My licence"],
      ];
    const common: Array<[string] | [string, string, number?]> = [
      ["Applications"],
      ["dash", "Dashboard"],
      ["verify", "Review and approval", cnt(["SUBMITTED"])],
      ["all", "All applications"],
      ["Registrars"],
      ["directory", "Registrar directory"],
      ["System"],
      ["jur", "Jurisdictions"],
      ["users", "Users and roles"],
      ["settings", "Eligibility settings"],
      ["audit", "Audit log"],
    ];
    return common;
  }
  const currentUser = (r: string): EnlUser | null =>
    r === "applicant"
      ? userBy(String(UI.auth["applicant"] || ""))
      : S.users.find((u) => u.id === (r === "admin" ? "u-admin" : "u-super")) || null;
  function shell(r: string): string {
    const me = currentUser(r);
    const pg = UI.page[r] ?? "dash";
    const titles: Record<string, string> = {
      dash: "Dashboard",
      apply: "Application",
      licence: "My licence",
      verify: "Review and approval",
      approve: "Review and approval",
      all: "All applications",
      directory: "Registrar directory",
      jur: "Jurisdictions",
      users: "Users and roles",
      settings: "Eligibility settings",
      audit: "Audit log",
    };
    const openApp = UI.open ? appById(UI.open) : undefined;
    const content = openApp ? appDetail(openApp, r) : pageFor(r, pg);
    const roleName = r === "super" ? "Super Admin" : r === "admin" ? "Admin" : "Applicant";
    return `<aside id="sb" class="${UI.sb ? "open" : ""}"><div class="sb-head"><div class="mark">MR</div><div><b>Registrar Enlistment</b><span>Law and Justice Division</span></div></div>
    <nav class="sb-nav">${navFor(r)
      .map((it) =>
        it.length === 1
          ? `<div class="sb-grp">${it[0]}</div>`
          : `<button class="sb-it ${pg === it[0] && !UI.open ? "on" : ""}" data-act="page" data-p="${it[0]}">${it[1]}${it[2] ? `<span class="n">${it[2]}</span>` : ""}</button>`,
      )
      .join("")}</nav>
    <div class="sb-foot"><div class="who"><div class="av">${ini(me?.name)}</div><div><b>${esc(me?.name)}</b><span>${roleName}</span></div></div><button class="btn sm bfw" data-act="logout">Sign out</button></div></aside>
    <div id="ov" class="${UI.sb ? "open" : ""}" data-act="sb"></div>
    <div id="main"><header id="tb"><button class="hamb" data-act="sb" aria-label="Open menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button><div><h1>${openApp ? "Application " + esc(openApp.appNo) : (titles[pg] ?? "Dashboard")}</h1><div class="crumb">${roleName} · ${esc(me?.designation || "OneID verified · NID ••••" + String(me?.nid ?? "").slice(-4))}</div></div></header><div class="content">${content}</div></div>`;
  }
  function pageFor(r: string, pg: string): string {
    if (r === "applicant")
      return pg === "apply" ? applyPage() : pg === "licence" ? licencePage() : applicantDash();
    switch (pg) {
      case "verify":
        return appTable(
          S.apps.filter((a) => a.status === "SUBMITTED"),
          "No applications waiting for review.",
        );
      case "approve":
        return appTable(
          S.apps.filter((a) => a.status === "FORWARDED"),
          "No verified applications waiting for your approval.",
        );
      case "all":
        return appTable(
          S.apps
            .filter((a) => a.status !== "DRAFT")
            .slice()
            .reverse(),
          "No applications yet.",
        );
      case "directory":
        return directoryPage();
      case "jur":
        return jurPage();
      case "users":
        return usersPage(r);
      case "settings":
        return settingsPage();
      case "audit":
        return auditPage();
      default:
        return adminDash();
    }
  }

  /* ---------- applicant ---------- */
  const myApp = (): EnlApplication | null => {
    const u = currentUser("applicant");
    if (!u) return null;
    return S.apps.filter((a) => a.userId === u.id).slice(-1)[0] || null;
  };
  function stepsHTML(a: EnlApplication | null): string {
    const s = a ? a.status : "DRAFT";
    const idxMap: Record<string, number> = {
      DRAFT: 0,
      RETURNED: 0,
      SUBMITTED: 1,
      FORWARDED: 1,
      ENLISTED: 3,
      REJECTED: 2,
      SUSPENDED: 3,
      CANCELLED: 3,
    };
    const idx = idxMap[s] ?? 0;
    const lab: Array<[string, string]> = [
      [
        "Submit application",
        s === "RETURNED"
          ? "Returned, fix and resubmit"
          : s === "DRAFT"
            ? "Not submitted yet"
            : "Submitted",
      ],
      [
        "Review and approval with eSign",
        s === "REJECTED"
          ? "Rejected"
          : idx > 1
            ? "Approved by " + (a?.approverTitle || "official")
            : idx === 1
              ? "With Admin / Super Admin"
              : "Waiting",
      ],
      ["Licence issued", idx >= 3 ? "Sent to OneID Wallet" : "Waiting"],
    ];
    return `<div class="steps" style="grid-template-columns:repeat(3,1fr)">${lab
      .map((l, i) => {
        const bad = (s === "REJECTED" && i === 1) || (s === "RETURNED" && i === 0);
        const done = !bad && (i < idx || (idx >= 3 && i === 2));
        return `<div class="st ${bad ? "bad" : done ? "done" : i === idx ? "now" : ""}"><i>${done ? "✓" : i + 1}</i><b>${l[0]}</b><small>${l[1]}</small></div>`;
      })
      .join("")}</div>`;
  }
  function applicantDash(): string {
    const u = currentUser("applicant"),
      a = myApp();
    let action = "";
    if (!a)
      action = `<div class="card"><div class="ch"><h3>Start your application</h3></div><p class="sub" style="margin-bottom:12px">Your identity is already verified by OneID eKYC (${fD(u?.ekycAt)}). Fill in your qualifications, the wards you want to serve, your office and documents, then submit.</p><button class="btn bp" data-act="newapp">Start application</button></div>`;
    else if (a.status === "DRAFT")
      action = `<div class="card"><div class="ch"><h3>Your application is a draft</h3>${chip(a.status)}</div><button class="btn bp" data-act="page" data-p="apply">Continue application</button></div>`;
    else if (a.status === "RETURNED")
      action = `<div class="card" style="border-left:4px solid #EA580C"><div class="ch"><h3>Returned for correction</h3>${chip(a.status)}</div><p style="margin-bottom:12px">${esc(a.returnNote)}</p><button class="btn bp" data-act="page" data-p="apply">Fix and resubmit</button></div>`;
    else if (a.status === "ENLISTED")
      action = `<div class="card" style="border-left:4px solid var(--pri)"><div class="ch"><h3>You are an enlisted marriage registrar</h3>${chip(a.status)}</div><div class="kv"><div><dt>Licence number</dt><dd>${esc(a.licenceNo)}</dd></div><div><dt>Wards</dt><dd class="bn">${esc(placeOf(J, a.j.wards))}</dd></div><div><dt>Valid until</dt><dd>${fD(a.validTo)}</dd></div></div><div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn bp" data-act="opendesk">Open registrar desk</button><button class="btn" data-act="page" data-p="licence">View licence</button></div></div>`;
    else if (a.status === "REJECTED")
      action = `<div class="card"><div class="ch"><h3>Application rejected</h3>${chip(a.status)}</div><p>${esc(a.rejectNote || "")}</p></div>`;
    else
      action = `<div class="card"><div class="ch"><h3>Application ${esc(a.appNo)}</h3>${chip(a.status)}</div><p class="sub">An Admin or the Super Admin is reviewing your application. When it is approved with eSign, your licence goes to your OneID Wallet.</p><div style="margin-top:12px"><button class="btn" data-act="viewmine">View application</button></div></div>`;
    return `<div class="card"><div class="ch"><h3>Assalamu Alaikum, ${esc(u?.name)}</h3><span class="chip c-sub">eKYC verified</span></div>${stepsHTML(a)}</div>${action}
    ${
      a && a.history && a.history.length
        ? `<div class="card"><div class="ch"><h3>History</h3></div><ul class="hist">${a.history
            .slice()
            .reverse()
            .map(
              (h) => `<li><div>${esc(h.text)}<small>${esc(h.by)} · ${fDT(h.at)}</small></div></li>`,
            )
            .join("")}</ul></div>`
        : ""
    }`;
  }
  function fld(
    label: string,
    path: string,
    o: { en?: string; area?: number; ro?: number; type?: string; ph?: string; hint?: string } = {},
  ): string {
    const v =
      path
        .split(".")
        .reduce<unknown>((x, k) => (x == null ? x : (x as Record<string, unknown>)[k]), UI.draft) ??
      "";
    return `<div class="fg"><label>${label}${o.en ? ` <span class="en">${o.en}</span>` : ""}</label>${o.area ? `<textarea class="inp" data-b="${path}">${esc(v)}</textarea>` : `<input class="inp" data-b="${path}" value="${esc(v)}" ${o.ro ? "readonly" : ""} ${o.type ? `type="${o.type}"` : ""} ${o.ph ? `placeholder="${esc(o.ph)}"` : ""}>`}${o.hint ? `<div class="hint">${o.hint}</div>` : ""}</div>`;
  }
  function selJ(
    label: string,
    key: "div" | "dist" | "upz" | "uni",
    level: number,
    parentId?: string,
  ): string {
    const opts =
      parentId || level === 0 ? (level === 0 ? roots(J) : kidsOf(J, parentId, level)) : [];
    const v = UI.draft?.j[key] ?? "";
    return `<div class="fg"><label class="bn">${label}</label><select class="inp bn" data-j="${key}" ${!opts.length ? "disabled" : ""}><option value="">নির্বাচন করুন</option>${opts.map((n) => `<option value="${n.id}" ${v === n.id ? "selected" : ""}>${esc(n.name)}</option>`).join("")}</select></div>`;
  }
  function takenWards(exceptId: string | null): Record<string, string> {
    const m: Record<string, string> = {};
    S.apps
      .filter((a) => a.status === "ENLISTED" && a.id !== exceptId)
      .forEach((a) => a.j.wards.forEach((w) => (m[w] = a.p.nameEn)));
    return m;
  }
  function applyPage(): string {
    const a = myApp();
    if (
      a &&
      ["SUBMITTED", "FORWARDED", "ENLISTED", "REJECTED", "SUSPENDED", "CANCELLED"].includes(
        a.status,
      )
    ) {
      const stLabel = ST[a.status]?.[0]?.toLowerCase() ?? a.status.toLowerCase();
      return `<div class="info">Your application ${esc(a.appNo)} is ${stLabel} and can't be edited now.</div><div style="margin-top:12px"><button class="btn" data-act="viewmine">View application</button></div>`;
    }
    const u = currentUser("applicant");
    if (!UI.draft && u) UI.draft = a ? clone(a) : blankApp(u);
    const d = UI.draft;
    if (!d) return "";
    const taken = takenWards(d.id),
      wardsOpts = d.j.uni ? kidsOf(J, d.j.uni, 4) : [];
    const errs = UI.errs || [];
    return `<div class="card"><div class="ch"><div><h3>Marriage registrar enlistment application</h3><p class="sub">${d.appNo ? esc(d.appNo) + " · " : ""}Your personal details come from OneID eKYC and can't be changed here.</p></div><button class="btn sm" data-act="demofill">Fill with demo data</button></div>
    ${d.status === "RETURNED" && d.returnNote ? `<div class="err"><b>Returned by admin:</b> ${esc(d.returnNote)}</div>` : ""}
    ${errs.length ? `<div class="err" role="alert"><b>Fix ${errs.length} item${errs.length > 1 ? "s" : ""} before submitting:</b><ul>${errs.map((e) => `<li>${esc(e)}</li>`).join("")}</ul></div>` : ""}
    <div class="fsec"><h4>Personal details<small>From OneID eKYC</small></h4><div class="g2">${fld("Name (Bangla)", "p.nameBn", { ro: 1 })}${fld("Name (English)", "p.nameEn", { ro: 1 })}${fld("Father's name", "p.father", { ro: 1 })}${fld("Mother's name", "p.mother", { ro: 1 })}${fld("Date of birth", "p.dob", { ro: 1, hint: `Age ${ageOf(d.p.dob)} years` })}${fld("NID number", "p.nid", { ro: 1 })}</div></div>
    <div class="fsec"><h4>Contact<small>Used for all notices</small></h4><div class="g2">${fld("Mobile", "c.mobile")}${fld("Email", "c.email", { type: "email" })}</div>${fld("Present address", "c.address", { area: 1 })}</div>
    <div class="fsec"><h4>Qualification<small>As required by the licensing rules</small></h4><div class="g2"><div class="fg"><label>Degree</label><select class="inp" data-b="q.degree"><option value="">Select</option>${["Kamil", "Fazil", "Masters (Islamic Studies)", "Other equivalent"].map((o) => `<option ${d.q.degree === o ? "selected" : ""}>${o}</option>`).join("")}</select></div>${fld("Institution", "q.institution")}${fld("Passing year", "q.year", { ph: "e.g. 2008" })}${fld("Result", "q.result", { ph: "e.g. First class" })}</div></div>
    <div class="fsec"><h4 class="bn">অধিক্ষেত্র<small>Jurisdiction you want to serve</small></h4><div><div class="g2">${selJ("বিভাগ", "div", 0)}${selJ("জেলা", "dist", 1, d.j.div)}${selJ("উপজেলা / সিটি কর্পোরেশন", "upz", 2, d.j.dist)}${selJ("ইউনিয়ন / পৌরসভা", "uni", 3, d.j.upz)}</div>
      <div class="fg"><label class="bn">ওয়ার্ড <span class="en">(choose one or more)</span></label>${wardsOpts.length ? `<div class="wards">${wardsOpts.map((w) => `<label class="bn ${taken[w.id] && !S.settings.multiPerWard ? "taken" : ""}" title="${taken[w.id] ? "Already served by " + esc(taken[w.id]) : ""}"><input type="checkbox" data-ward="${w.id}" ${d.j.wards.includes(w.id) ? "checked" : ""}>${esc(w.name)}${taken[w.id] ? " · নেওয়া" : ""}</label>`).join("")}</div><div class="hint">Wards marked নেওয়া already have an enlisted registrar.</div>` : `<div class="hint">Select a union or pourashava to see its wards.</div>`}</div></div></div>
    <div class="fsec"><h4>Office<small>Where marriages will be registered</small></h4><div class="g2">${fld("Office name", "o.name", { ph: "e.g. Genda Kazi Office" })}${fld("Office phone", "o.phone")}</div>${fld("Office address", "o.address", { area: 1 })}</div>
    <div class="fsec"><h4>Documents<small>PDF or image, up to 5 MB each</small></h4><div class="docs">${DOCS.filter(
      (x) => S.settings.reqDocs.includes(x[0]),
    )
      .map(
        ([k, l]) =>
          `<div class="doc"><div><b>${l}</b><small>${d.docs[k] ? esc(d.docs[k]) : "Not uploaded"}</small></div>${d.docs[k] ? `<span class="ok">✓ Uploaded <button class="btn sm" data-act="rmdoc" data-k="${k}">Remove</button></span>` : `<button class="btn sm" data-act="updoc" data-k="${k}">Upload</button>`}</div>`,
      )
      .join("")}</div></div>
    <div class="fsec"><h4>Declaration</h4><label class="chk"><input type="checkbox" data-decl="1" ${d.declare ? "checked" : ""}><span>I declare that the information given is true, I am not enlisted as a marriage registrar elsewhere, and I will follow the Muslim Marriages and Divorces (Registration) Act and Rules.</span></label></div>
    <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:6px"><button class="btn" data-act="savedraft">Save draft</button><button class="btn bp" data-act="submit">Submit application</button></div></div>`;
  }
  function validate(d: EnlApplication): string[] {
    const e: string[] = [],
      set = S.settings,
      age = ageOf(d.p.dob);
    if (age < set.minAge || age > set.maxAge)
      e.push(`Age must be between ${set.minAge} and ${set.maxAge} years (you are ${age}).`);
    if (!/^01\d{9}$/.test(d.c.mobile || ""))
      e.push("Enter an 11-digit mobile number starting with 01.");
    if (!/^\S+@\S+\.\S+$/.test(d.c.email || "")) e.push("Enter a valid email address.");
    if (!d.c.address.trim()) e.push("Enter your present address.");
    if (!d.q.degree || !d.q.institution.trim() || !/^\d{4}$/.test(d.q.year))
      e.push("Complete your qualification (degree, institution and a 4-digit passing year).");
    if (!d.j.wards.length) e.push("Select the jurisdiction down to at least one ward.");
    if (!S.settings.multiPerWard) {
      const t = takenWards(d.id);
      const clash = d.j.wards.filter((w) => t[w]);
      if (clash.length)
        e.push(
          `These wards already have an enlisted registrar: ${clash.map((w) => J[w]?.name ?? "").join(", ")}. Choose other wards.`,
        );
    }
    if (!d.o.name.trim() || !d.o.address.trim()) e.push("Enter the office name and address.");
    const miss = DOCS.filter((x) => S.settings.reqDocs.includes(x[0]) && !d.docs[x[0]]).map(
      (x) => x[1],
    );
    if (miss.length) e.push("Upload: " + miss.join(", ") + ".");
    if (!d.declare) e.push("Tick the declaration.");
    return e;
  }
  function saveDraft(): EnlApplication | null {
    const d = UI.draft;
    if (!d) return null;
    let a = d.id ? appById(d.id) : undefined;
    if (!a) {
      S.seq.app++;
      d.id = "a" + S.seq.app;
      d.appNo = "ENL-" + today().slice(0, 4) + "-" + S.seq.app;
      a = clone(d);
      S.apps.push(a);
    } else Object.assign(a, clone(d));
    save();
    return a;
  }
  function licencePage(): string {
    const a = myApp();
    if (!a || !["ENLISTED", "SUSPENDED"].includes(a.status))
      return `<div class="card empty">Your licence appears here after the Super Admin approves your application.</div>`;
    return `<div class="card"><div class="ch"><h3>Marriage registrar licence</h3>${chip(a.status)}</div>${certHTML(a)}<p class="hint" style="text-align:center;margin-top:10px">This licence is also in your OneID Wallet under Documents Vault.</p></div>`;
  }
  function certHTML(a: EnlApplication): string {
    const sealPart = (a.seal || "").split("|S:")[1];
    return `<div class="cert"><div class="in"><div class="g">GOVERNMENT OF THE PEOPLE'S REPUBLIC OF BANGLADESH</div><div class="o">LAW AND JUSTICE DIVISION</div>
    <h2>নিকাহ রেজিস্ট্রার লাইসেন্স</h2><div class="no">Marriage Registrar Licence · ${esc(a.licenceNo)}</div>
    <p>এই মর্মে প্রত্যয়ন করা যাচ্ছে যে <b>${esc(a.p.nameBn)}</b> (${esc(a.p.nameEn)}), জাতীয় পরিচয়পত্র নম্বর ••••${esc(String(a.p.nid).slice(-4))}, কে <b>${esc(placeOf(J, a.j.wards))}</b>, ${esc(
      pathOf(J, a.j.upz)
        .map((n) => n.name)
        .reverse()
        .join(", "),
    )} এলাকার জন্য নিকাহ রেজিস্ট্রার হিসেবে লাইসেন্স প্রদান করা হলো। কার্যালয়: ${esc(a.o.address)}। মেয়াদ: ${bn(fD(a.validTo))} পর্যন্ত।</p>
    <div class="ft"><div><div class="qr" data-qr="${esc(a.seal || "")}"></div><div class="pki">PKI Ref: ${esc(sealPart ? sealPart.slice(0, 20) : "")}</div></div>
    <div class="vsig"><div class="scr">${esc(a.approvedBy)}</div>Signed by: <b>${esc(a.approvedBy)}</b><br>${esc(a.approverTitle || "Super Admin")}, Law and Justice Division<br>Country code: BD<br>Date: ${fDT(a.approvedAt)}</div></div></div></div>`;
  }

  /* ---------- admin and super admin ---------- */
  function adminDash(): string {
    const c = (st: string): number => S.apps.filter((a) => a.status === st).length;
    const recent = S.apps
      .filter((a) => a.status !== "DRAFT")
      .slice()
      .reverse()
      .slice(0, 6);
    return `<div class="grid4"><div class="stat"><b>${c("SUBMITTED")}</b><span>Awaiting review and approval</span></div><div class="stat"><b>${c("RETURNED")}</b><span>Returned for correction</span></div><div class="stat"><b>${c("ENLISTED")}</b><span>Enlisted registrars</span></div><div class="stat"><b>${c("SUSPENDED") + c("CANCELLED")}</b><span>Suspended or cancelled</span></div></div>
    <div class="card"><div class="ch"><h3>Next step</h3></div>${c("SUBMITTED") ? `<p style="margin-bottom:12px">${c("SUBMITTED")} application${c("SUBMITTED") > 1 ? "s are" : " is"} waiting. Open one to read the full application form and approve it with eSign, return it or reject it.</p><button class="btn bp" data-act="page" data-p="verify">Open review and approval</button>` : `<p class="sub">Nothing is waiting. Browse the registrar directory or maintain the system.</p>`}</div>
    <div class="card"><div class="ch"><h3>Recent applications</h3><button class="btn sm" data-act="page" data-p="all">See all</button></div>${appTable(recent, "No applications yet.")}</div>`;
  }
  function appTable(list: EnlApplication[], emptyMsg: string): string {
    return list.length
      ? `<div class="tw"><table class="t"><thead><tr><th>Application</th><th>Applicant</th><th class="bn">ইউনিয়ন / পৌরসভা · ওয়ার্ড</th><th>Submitted</th><th>Status</th></tr></thead><tbody>${list.map((a) => `<tr class="click" data-act="openapp" data-id="${a.id}" tabindex="0"><td><b>${esc(a.licenceNo || a.appNo)}</b></td><td>${esc(a.p.nameEn)}<br><span class="bn" style="color:var(--tx3);font-size:12px">${esc(a.p.nameBn)}</span></td><td class="bn">${esc(placeOf(J, a.j.wards))}<br><span style="color:var(--tx3);font-size:12px">${a.j.dist ? esc(J[a.j.dist]?.name) + ", " + esc(J[a.j.div]?.name) : ""}</span></td><td>${fD(a.submittedAt)}</td><td>${chip(a.status)}</td></tr>`).join("")}</tbody></table></div>`
      : `<div class="tw"><div class="empty">${emptyMsg}</div></div>`;
  }
  function checksFor(a: EnlApplication): Array<[string, string]> {
    const out: Array<[string, string]> = [],
      age = ageOf(a.p.dob),
      set = S.settings;
    out.push([
      age >= set.minAge && age <= set.maxAge ? "ok" : "bad",
      `Age ${age} (allowed ${set.minAge} to ${set.maxAge})`,
    ]);
    const u = a.userId ? userBy(a.userId) : null;
    out.push([
      u && u.ekycAt ? "ok" : "warn",
      u && u.ekycAt
        ? `Identity verified by OneID eKYC on ${fD(u.ekycAt)}; NID matches the applicant`
        : "Migrated record: identity from the old register",
    ]);
    const miss = DOCS.filter((x) => set.reqDocs.includes(x[0]) && !a.docs[x[0]]);
    out.push([
      miss.length ? "bad" : "ok",
      miss.length
        ? "Missing: " + miss.map((x) => x[1]).join(", ")
        : "All required documents uploaded",
    ]);
    const t = takenWards(a.id),
      clash = a.j.wards.filter((w) => t[w]);
    out.push([
      clash.length ? (set.multiPerWard ? "warn" : "bad") : "ok",
      clash.length
        ? `Ward overlap with ${[...new Set(clash.map((w) => t[w]))].join(", ")}`
        : "No other enlisted registrar in the requested wards",
    ]);
    const dup = S.apps.find(
      (x) => x.id !== a.id && x.p.nid === a.p.nid && ["ENLISTED", "SUSPENDED"].includes(x.status),
    );
    out.push([
      dup ? "bad" : "ok",
      dup ? `Already enlisted as ${dup.licenceNo}` : "Not enlisted elsewhere",
    ]);
    out.push([
      a.q.degree ? "ok" : "bad",
      a.q.degree
        ? `Qualification: ${a.q.degree}, ${a.q.institution} (${a.q.year})`
        : "Qualification missing",
    ]);
    return out;
  }
  function appDetail(a: EnlApplication, r: string): string {
    const isOfficial = r === "admin" || r === "super",
      isSuper = r === "super";
    const checks = `<ul class="checks">${checksFor(a)
      .map(
        (c) =>
          `<li class="${c[0]}"><span class="i">${c[0] === "ok" ? "✓" : c[0] === "warn" ? "!" : "✕"}</span><span>${esc(c[1])}</span></li>`,
      )
      .join("")}</ul>`;
    let panel = "";
    if (isOfficial && a.status === "SUBMITTED")
      panel = `<div class="card" style="border-top:4px solid var(--pri)"><div class="ch"><h3>Review and approve</h3>${chip(a.status)}</div><p class="sub" style="margin-bottom:10px">Automatic checks</p>${checks}<p class="hint" style="margin-top:12px">Approving issues the licence, designates the registrar for the wards in section 4, seals it with a VDS and sends it to the registrar's OneID Wallet. Confirmed with a one-time SMS code.</p><div style="display:grid;gap:8px;margin-top:12px"><button class="btn bp" data-act="approve" data-id="${a.id}">Approve with eSign</button><button class="btn" data-act="return" data-id="${a.id}">Return to applicant</button><button class="btn br" data-act="reject" data-id="${a.id}">Reject</button></div></div>`;
    else if (isOfficial && (a.status === "ENLISTED" || a.status === "SUSPENDED"))
      panel = isSuper
        ? `<div class="card"><div class="ch"><h3>Manage registrar</h3>${chip(a.status)}</div><div style="display:grid;gap:8px">${a.status === "ENLISTED" ? `<button class="btn" data-act="suspend" data-id="${a.id}">Suspend</button>` : `<button class="btn bp" data-act="reinstate" data-id="${a.id}">Reinstate</button>`}<button class="btn br" data-act="cancel" data-id="${a.id}">Cancel licence</button></div></div>`
        : `<div class="card"><div class="ch"><h3>Registrar</h3>${chip(a.status)}</div><p class="sub">Only the Super Admin can suspend, reinstate or cancel a licence.</p></div>`;
    else
      panel = `<div class="card"><div class="ch"><h3>Status</h3>${chip(a.status)}</div>${a.returnNote && a.status === "RETURNED" ? `<p>${esc(a.returnNote)}</p>` : ""}${a.rejectNote && a.status === "REJECTED" ? `<p>${esc(a.rejectNote)}</p>` : ""}</div>`;
    return `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button class="btn sm" data-act="back">← Back</button><button class="btn sm" data-act="print">Print application form</button></div>
    <div class="card" style="margin-bottom:14px">${stepsHTML(a)}</div>
    <div class="dlayout"><div>${formHTML(a)}${a.status === "ENLISTED" || a.status === "SUSPENDED" ? `<div class="card" style="margin-top:14px"><div class="ch"><h3>Licence</h3></div>${certHTML(a)}</div>` : ""}</div>
    <aside class="dside">${panel}<div class="card"><div class="ch"><h3>History</h3></div><ul class="hist">${(
      a.history || []
    )
      .slice()
      .reverse()
      .map((h) => `<li><div>${esc(h.text)}<small>${esc(h.by)} · ${fDT(h.at)}</small></div></li>`)
      .join("")}</ul></div></aside></div>`;
  }
  function formHTML(a: EnlApplication): string {
    const u = a.userId ? userBy(a.userId) : null,
      path = a.j.wards.length ? pathOf(J, a.j.wards[0]) : [];
    const row = (bnL: string, enL: string, v: string): string =>
      `<tr><th><span class="bn">${bnL}</span><small>${enL}</small></th><td>${v || "—"}</td></tr>`;
    const sec = (n: number, bnT: string, enT: string, rows: string): string =>
      `<div class="af-sec"><h4><span class="af-n">${bn(n)}</span><span class="bn">${bnT}</span><small>${enT}</small></h4><table class="af-t">${rows}</table></div>`;
    const stLabel = ST[a.status]?.[0] ?? a.status;
    return `<article class="af" id="af-print"><header class="af-h"><div class="af-gov"><div class="af-emb" aria-hidden="true">GoB</div><div><div class="bn af-g1">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div><div class="bn af-g2">আইন ও বিচার বিভাগ</div><div class="af-g3">Law and Justice Division</div></div></div>
    <div class="af-photo" aria-label="Applicant photograph">${a.docs["photo"] ? `<svg viewBox="0 0 60 72" width="64" height="76"><rect width="60" height="72" fill="#E8EEF8"/><circle cx="30" cy="26" r="13" fill="#B9C7DE"/><path d="M6 72c2-16 12-24 24-24s22 8 24 24z" fill="#B9C7DE"/></svg><span>Photo attached</span>` : `<span>No photo</span>`}</div></header>
    <h2 class="af-title bn">নিকাহ রেজিস্ট্রার লাইসেন্সের জন্য আবেদনপত্র</h2><div class="af-sub">Application for Licence as Marriage Registrar (Nikah Registrar)</div>
    <div class="af-meta"><div><small>Application no.</small><b>${esc(a.appNo)}</b></div><div><small>Submitted</small><b>${fDT(a.submittedAt)}</b></div><div><small>Status</small><b>${stLabel}</b></div>${a.licenceNo ? `<div><small>Licence no.</small><b>${esc(a.licenceNo)}</b></div>` : ""}</div>
    ${sec(1, "ব্যক্তিগত তথ্য", "Personal details", row("নাম (বাংলা)", "Name in Bangla", `<span class="bn">${esc(a.p.nameBn)}</span>`) + row("নাম (ইংরেজি)", "Name in English", esc(a.p.nameEn)) + row("পিতার নাম", "Father's name", esc(a.p.father)) + row("মাতার নাম", "Mother's name", esc(a.p.mother)) + row("জন্ম তারিখ", "Date of birth", `${fD(a.p.dob)} (age ${ageOf(a.p.dob)})`) + row("লিঙ্গ", "Gender", esc(a.p.gender)) + row("জাতীয় পরিচয়পত্র নম্বর", "NID number", "••••••" + esc(String(a.p.nid).slice(-4))))}
    ${sec(2, "যোগাযোগ", "Contact", row("মোবাইল", "Mobile", esc(a.c.mobile)) + row("ইমেইল", "Email", esc(a.c.email)) + row("বর্তমান ঠিকানা", "Present address", `<span class="bn">${esc(a.c.address)}</span>`))}
    ${sec(3, "শিক্ষাগত যোগ্যতা", "Qualification", row("ডিগ্রি", "Degree", esc(a.q.degree)) + row("প্রতিষ্ঠান", "Institution", esc(a.q.institution)) + row("পাসের বছর", "Passing year", esc(a.q.year)) + row("ফলাফল", "Result", esc(a.q.result)))}
    ${sec(
      4,
      "প্রার্থিত অধিক্ষেত্র",
      "Jurisdiction requested",
      LEVELS.slice(0, 4)
        .map((l, i) =>
          row(l, LEVEL_EN[i] ?? "", path[i] ? `<span class="bn">${esc(path[i]?.name)}</span>` : ""),
        )
        .join("") +
        row(
          LEVELS[4] ?? "",
          LEVEL_EN[4] ?? "",
          `<span class="bn">${esc(a.j.wards.map((w) => J[w]?.name ?? "").join(", "))}</span>`,
        ),
    )}
    ${sec(5, "কার্যালয়", "Office", row("কার্যালয়ের নাম", "Office name", `<span class="bn">${esc(a.o.name)}</span>`) + row("ঠিকানা", "Address", `<span class="bn">${esc(a.o.address)}</span>`) + row("ফোন", "Phone", esc(a.o.phone)))}
    ${sec(
      6,
      "সংযুক্তি",
      "Attachments",
      DOCS.map(([k, l]) =>
        row(
          "",
          l,
          a.docs[k]
            ? `<span class="af-ok">✓ ${esc(a.docs[k])}</span>`
            : `<span class="af-miss">Not attached</span>`,
        ),
      ).join(""),
    )}
    ${sec(7, "পরিচয় যাচাই", "Identity verification", row("পদ্ধতি", "Method", u && u.ekycAt ? esc(String(u.ekycMethod || "OneID eKYC: NID + face match")) : "Migrated from the existing licence register") + row("যাচাইয়ের তারিখ", "Verified on", u && u.ekycAt ? fDT(u.ekycAt) : "—"))}
    <div class="af-sec"><h4><span class="af-n">${bn(8)}</span><span class="bn">ঘোষণা</span><small>Declaration</small></h4><p class="af-decl">I declare that the information given is true, I am not enlisted as a marriage registrar elsewhere, and I will follow the Muslim Marriages and Divorces (Registration) Act and Rules.</p>
      <div class="af-sign"><div><small>Applicant</small><b>${esc(a.p.nameEn)}</b><span>${a.submittedAt ? "Submitted electronically on " + fDT(a.submittedAt) : "Not submitted"}</span></div><div><small>Declaration accepted</small><b>${a.declare ? "Yes" : "No"}</b></div></div></div>
    <div class="af-off"><h4>For official use</h4><div class="af-offg"><div><small>Decision</small><b>${a.status === "ENLISTED" || a.status === "SUSPENDED" || a.status === "CANCELLED" ? "Approved" : a.status === "REJECTED" ? "Rejected" : a.status === "RETURNED" ? "Returned for correction" : "Pending"}</b></div><div><small>Approved by</small><b>${a.approvedBy ? esc(a.approvedBy) + " (" + esc(a.approverTitle || "") + ")" : "—"}</b></div><div><small>Date</small><b>${a.approvedAt ? fDT(a.approvedAt) : "—"}</b></div><div><small>Licence valid until</small><b>${a.validTo ? fD(a.validTo) : "—"}</b></div></div></div>
  </article>`;
  }
  function countUnder(nodeId: string, st: string): number {
    return S.apps.filter(
      (a) =>
        (st === "ALL"
          ? ["ENLISTED", "SUSPENDED", "CANCELLED"].includes(a.status)
          : a.status === st) && a.j.wards.some((w) => under(J, w, nodeId)),
    ).length;
  }
  function treeHTML(id: string, depth: number): string {
    const n = J[id];
    if (!n) return "";
    const open = UI.dirOpen[id],
      c = countUnder(id, UI.dirSt);
    const kids = n.kids;
    return `<div><button class="tn ${UI.dirNode === id ? "on" : ""}" style="padding-left:${8 + depth * 14}px" data-act="dirsel" data-id="${id}"><span class="tg" data-act="dirtog" data-id="${id}">${kids.length && n.level < 4 ? (open ? "▾" : "▸") : "·"}</span>${esc(n.name === CCA ? n.name : n.name)}<span class="ct ${c ? "" : "z"}">${bn(c)}</span></button>${open && n.level < 4 ? kids.map((k) => treeHTML(k, depth + 1)).join("") : ""}</div>`;
  }
  function directoryPage(): string {
    const node = UI.dirNode ? J[UI.dirNode] : undefined;
    const q = UI.dirQ.trim().toLowerCase();
    const list = S.apps
      .filter((a) =>
        UI.dirSt === "ALL"
          ? ["ENLISTED", "SUSPENDED", "CANCELLED"].includes(a.status)
          : a.status === UI.dirSt,
      )
      .filter((a) => !node || a.j.wards.some((w) => under(J, w, node.id)))
      .filter(
        (a) =>
          !q ||
          (
            a.p.nameEn +
            " " +
            a.p.nameBn +
            " " +
            (a.licenceNo || "") +
            " " +
            a.c.mobile +
            " " +
            a.o.address
          )
            .toLowerCase()
            .includes(q),
      );
    const crumbs = node ? pathOf(J, node.id) : [];
    const rows = list
      .map((a) => {
        const p = pathOf(J, a.j.wards[0]);
        return `<tr class="click" data-act="openapp" data-id="${a.id}" tabindex="0"><td><b>${esc(a.p.nameEn)}</b><br><span class="bn" style="color:var(--tx3);font-size:12px">${esc(a.p.nameBn)}</span></td><td class="nw">${esc(a.licenceNo)}</td><td class="bn">${esc(p[0]?.name)}</td><td class="bn">${esc(p[1]?.name)}</td><td class="bn">${esc(p[2]?.name)}</td><td class="bn">${esc(p[3]?.name)}</td><td class="bn">${esc(a.j.wards.map((w) => (J[w]?.name ?? "").replace("ওয়ার্ড ", "")).join(", "))}</td><td>${esc(a.c.mobile)}</td><td>${chip(a.status)}</td></tr>`;
      })
      .join("");
    return `<div class="dir"><div class="tree" aria-label="Jurisdiction hierarchy"><button class="tn ${!node ? "on" : ""}" data-act="dirsel" data-id=""><span class="tg">◆</span>সমগ্র বাংলাদেশ<span class="ct">${bn(countUnder("__none", UI.dirSt) || S.apps.filter((a) => (UI.dirSt === "ALL" ? ["ENLISTED", "SUSPENDED", "CANCELLED"].includes(a.status) : a.status === UI.dirSt)).length)}</span></button>${roots(
      J,
    )
      .map((n) => treeHTML(n.id, 0))
      .join("")}</div>
    <div><div class="card" style="padding:14px 16px"><div class="bc"><button data-act="dirsel" data-id="">সমগ্র বাংলাদেশ</button>${crumbs.map((n) => `<span>›</span><button data-act="dirsel" data-id="${n.id}">${esc(n.name)}</button>`).join("")}</div>
      <div class="levels">${LEVELS.map((l, i) => `<span class="chip ${node && node.level === i ? "c-sub" : "c-dr"} bn">${l}</span>`).join("")}</div>
      <div class="toolbar"><input class="inp" data-dirq="1" placeholder="Search name, licence, mobile or office" value="${esc(UI.dirQ)}"><select class="inp" data-dirst="1">${[
        ["ENLISTED", "Enlisted"],
        ["SUSPENDED", "Suspended"],
        ["CANCELLED", "Cancelled"],
        ["ALL", "All statuses"],
      ]
        .map(([v, l]) => `<option value="${v}" ${UI.dirSt === v ? "selected" : ""}>${l}</option>`)
        .join(
          "",
        )}</select><span class="sub" style="align-self:center">${list.length} registrar${list.length === 1 ? "" : "s"}${node ? " in " + esc(node.name) : ""}</span></div></div>
      <div class="tw" style="margin-top:12px">${list.length ? `<table class="t"><thead><tr><th>Name</th><th>Licence</th><th class="bn">বিভাগ</th><th class="bn">জেলা</th><th class="bn">উপজেলা / সিটি কর্পোরেশন</th><th class="bn">ইউনিয়ন / পৌরসভা</th><th class="bn">ওয়ার্ড</th><th>Mobile</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>` : `<div class="empty">No registrars match this area and filter.</div>`}</div></div></div>`;
  }

  /* ---------- system pages ---------- */
  function jurPage(): string {
    const counts = [0, 1, 2, 3, 4].map((l) => Object.values(J).filter((n) => n.level === l).length);
    return `<div class="grid4">${LEVELS.map((l, i) => `<div class="stat"><b>${counts[i]}</b><span class="bn">${l}</span></div>`).join("")}</div>
    <div class="card"><div class="ch"><h3>Add a ward</h3></div><p class="sub" style="margin-bottom:12px">New wards appear immediately in the application form and the directory.</p><div class="g3"><div class="fg"><label class="bn">ইউনিয়ন / পৌরসভা</label><select class="inp bn" id="jw-uni">${Object.values(
      J,
    )
      .filter((n) => n.level === 3)
      .map(
        (n) =>
          `<option value="${n.id}">${esc(n.name === CCA ? (n.parent ? J[n.parent]?.name : n.name) : n.name + ", " + (n.parent ? J[n.parent]?.name : ""))}</option>`,
      )
      .join(
        "",
      )}</select></div><div class="fg"><label>Ward name</label><input class="inp bn" id="jw-name" placeholder="ওয়ার্ড ১০"></div><div class="fg"><label>&nbsp;</label><button class="btn bp bfw" data-act="addward">Add ward</button></div></div></div>
    <div class="card"><div class="ch"><h3>Hierarchy</h3></div><div class="tw"><table class="t"><thead><tr>${LEVELS.slice(
      0,
      4,
    )
      .map((l) => `<th class="bn">${l}</th>`)
      .join("")}<th class="bn">ওয়ার্ড</th></tr></thead><tbody>${Object.values(J)
      .filter((n) => n.level === 3)
      .map((n) => {
        const p = pathOf(J, n.id);
        return `<tr>${p.map((x) => `<td class="bn">${esc(x.name)}</td>`).join("")}<td>${n.kids.length}</td></tr>`;
      })
      .join("")}</tbody></table></div></div>`;
  }
  function usersPage(r: string): string {
    const rows = S.users
      .map(
        (u) =>
          `<tr><td><b>${esc(u.name)}</b><br><span style="color:var(--tx3);font-size:12px">${esc(u.email)}</span></td><td>${u.role === "super" ? "Super Admin" : u.role === "admin" ? "Admin" : "Applicant"}</td><td>${esc(u.designation || "—")}</td><td>${u.active ? '<span class="chip c-sub">Active</span>' : '<span class="chip c-sus">Disabled</span>'}</td><td>${r === "super" && u.role === "admin" ? `<button class="btn sm" data-act="toggleuser" data-id="${u.id}">${u.active ? "Disable" : "Enable"}</button>` : ""}</td></tr>`,
      )
      .join("");
    return `${r === "super" ? `<div class="card"><div class="ch"><h3>Add an admin</h3></div><div class="g3"><div class="fg"><label>Full name</label><input class="inp" id="nu-name" placeholder="e.g. Shamim Ahmed"></div><div class="fg"><label>Official email</label><input class="inp" id="nu-mail" placeholder="name@lawjustice.gov.bd"></div><div class="fg"><label>Designation</label><input class="inp" id="nu-des" placeholder="Assistant Programmer"></div></div><button class="btn bp" data-act="adduser">Add admin</button></div>` : `<div class="info" style="margin-bottom:14px">Only the Super Admin can add or disable admins.</div>`}
    <div class="card"><div class="ch"><h3>Users and roles</h3></div><div class="tw"><table class="t"><thead><tr><th>User</th><th>Role</th><th>Designation</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <h4 style="margin:18px 0 8px">What each role can do</h4><div class="tw"><table class="t"><thead><tr><th>Action</th><th>Applicant</th><th>Admin</th><th>Super Admin</th></tr></thead><tbody>
    ${[
      ["Apply, edit and resubmit own application", "Yes", "—", "—"],
      ["Review applications, return for correction", "—", "Yes", "Yes"],
      ["Approve with eSign, reject", "—", "Yes", "Yes"],
      ["Suspend, reinstate, cancel registrars", "—", "—", "Yes"],
      ["Registrar directory by hierarchy", "—", "Yes", "Yes"],
      ["Jurisdictions and eligibility settings", "—", "Yes", "Yes"],
      ["Add or disable admins", "—", "—", "Yes"],
    ]
      .map(
        (r2) =>
          `<tr>${r2.map((c, i) => `<td${i ? ' style="text-align:center"' : ""}>${c}</td>`).join("")}</tr>`,
      )
      .join("")}</tbody></table></div></div>`;
  }
  function settingsPage(): string {
    const s = S.settings;
    return `<div class="card"><div class="ch"><h3>Eligibility settings</h3></div><p class="sub" style="margin-bottom:14px">These rules apply to new submissions and to the automatic checks admins see.</p>
    <div class="g3"><div class="fg"><label>Minimum age</label><input class="inp" type="number" id="set-min" value="${s.minAge}"></div><div class="fg"><label>Maximum age</label><input class="inp" type="number" id="set-max" value="${s.maxAge}"></div><div class="fg"><label>More than one registrar per ward</label><select class="inp" id="set-multi"><option value="0" ${!s.multiPerWard ? "selected" : ""}>Not allowed</option><option value="1" ${s.multiPerWard ? "selected" : ""}>Allowed</option></select></div></div>
    <div class="fg"><label>Required documents</label><div class="docs">${DOCS.map(([k, l]) => `<label class="chk"><input type="checkbox" data-reqdoc="${k}" ${s.reqDocs.includes(k) ? "checked" : ""}><span>${l}</span></label>`).join("")}</div></div>
    <button class="btn bp" data-act="savesettings">Save settings</button></div>`;
  }
  function auditPage(): string {
    return `<div class="card"><div class="ch"><h3>Audit log</h3><span class="sub">${S.audit.length} events</span></div><div class="tw"><table class="t"><thead><tr><th>Time</th><th>By</th><th>Action</th></tr></thead><tbody>${S.audit
      .slice(0, 200)
      .map(
        (e) =>
          `<tr><td style="white-space:nowrap">${fDT(e.at)}</td><td>${esc(e.by)}</td><td>${esc(e.text)}</td></tr>`,
      )
      .join("")}</tbody></table></div></div>`;
  }

  /* ---------- modal and toast ---------- */
  let mOk: (() => string | Promise<string>) | null = null,
    toastT: ReturnType<typeof setTimeout> | undefined;
  function toast(m: string): void {
    const t = $("#etoast");
    if (!t) return;
    t.textContent = m;
    t.classList.add("show");
    if (toastT) clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 2600);
  }
  function modal(html: string, ok: (() => string | Promise<string>) | null, wide?: boolean): void {
    const m = $("#emodal");
    if (!m) return;
    m.innerHTML = `<div class="dlg ${wide ? "wide" : ""}" role="dialog" aria-modal="true">${html}</div>`;
    m.hidden = false;
    mOk = ok;
    const f = m.querySelector<HTMLElement>("input,textarea,select,button");
    if (f) f.focus();
  }
  function closeModal(): void {
    const m = $("#emodal");
    if (m) {
      m.hidden = true;
      m.innerHTML = "";
    }
    mOk = null;
  }
  function reasonModal(
    title: string,
    text: string,
    btn: string,
    danger: boolean,
    onOk: (reason: string) => void,
  ): void {
    modal(
      `<h3>${title}</h3><p class="sub">${text}</p><div class="fg" style="margin-top:12px"><label>Reason</label><textarea class="inp" id="m-rs"></textarea></div><p class="err" id="m-err" hidden></p><div class="row"><button class="btn" data-act="mclose">Cancel</button><button class="btn ${danger ? "br" : "bp"}" data-act="mok">${btn}</button></div>`,
      () => {
        const rsEl = $("#m-rs") as HTMLTextAreaElement | null;
        const t = rsEl ? rsEl.value.trim() : "";
        if (!t) return "Enter a reason.";
        onOk(t);
        return "";
      },
    );
  }
  function signupModal(): void {
    const c = SIGNUP_DEMOS.filter((n) => !S.users.some((u) => u.nid === n));
    modal(
      `<h3>Sign up with OneID eKYC</h3><p class="sub">Verify your identity once with your NID and a face check. You won't need to do it again.</p>
    <div class="g2" style="margin-top:12px"><div class="fg"><label>NID number</label><input class="inp" id="su-nid" inputmode="numeric"></div><div class="fg"><label>Date of birth</label><input class="inp" type="date" id="su-dob"></div><div class="fg"><label>Mobile</label><input class="inp" id="su-mob" placeholder="01XXXXXXXXX"></div><div class="fg"><label>Email</label><input class="inp" id="su-mail" type="email"></div></div>
    ${c.length ? `<p class="demo">Demo: ${c.map((n) => `<button class="btn sm" data-act="sufill" data-n="${n}">${esc(PEOPLE[n]?.en)}</button>`).join(" ")}</p>` : ""}
    <p class="err" id="m-err" hidden></p><div class="row"><button class="btn" data-act="mclose">Cancel</button><button class="btn bp" data-act="mok">Continue to face check</button></div>`,
      () => {
        const n = ($("#su-nid") as HTMLInputElement | null)?.value.trim() ?? "",
          d = ($("#su-dob") as HTMLInputElement | null)?.value ?? "",
          mob = ($("#su-mob") as HTMLInputElement | null)?.value.trim() ?? "",
          em = ($("#su-mail") as HTMLInputElement | null)?.value.trim() ?? "";
        const P = PEOPLE[n];
        if (!P) return "No NID record matches this number.";
        if (P.dob !== d) return "The date of birth doesn't match the NID record.";
        if (S.users.some((u) => u.nid === n))
          return "This NID already has an account. Sign in instead.";
        if (!/^01\d{9}$/.test(mob)) return "Enter an 11-digit mobile number starting with 01.";
        if (!/^\S+@\S+\.\S+$/.test(em)) return "Enter a valid email address.";
        const dlg = $("#emodal .dlg");
        if (dlg) {
          dlg.innerHTML = `<h3>Face check</h3><div class="cam"><span>🙂</span></div><p style="text-align:center;font-weight:600" id="lv">Hold your face inside the circle</p><p class="sub" style="text-align:center">Simulated; the camera isn't used.</p>`;
        }
        setTimeout(() => {
          const el = $("#lv");
          if (el) el.textContent = "Matching with your NID photo";
        }, 900);
        setTimeout(() => {
          const u: EnlUser = {
            id: "u" + Date.now(),
            role: "applicant",
            nid: n,
            name: P.en,
            email: em,
            mobile: mob,
            active: true,
            ekycAt: now(),
          };
          S.users.push(u);
          log(P.en, "Signed up with OneID eKYC");
          save();
          closeModal();
          UI.auth["applicant"] = n;
          UI.login["applicant"] = n;
          UI.page["applicant"] = "dash";
          render();
          toast("Account verified. You can now apply.");
        }, 2000);
        return "pending";
      },
    );
  }
  function otpModal(title: string, text: string, onOk: () => Promise<void>): void {
    // const code = otpCode();
    const code = "000000";
    modal(
      `<h3>${title}</h3><p class="sub">${text}</p><div class="fg" style="margin-top:12px"><label>Code sent by SMS to your registered mobile</label><input class="inp otp" id="m-otp" inputmode="numeric" maxlength="6"><div class="demo">Demo code: ${code}</div></div><p class="err" id="m-err" hidden></p><div class="row"><button class="btn" data-act="mclose">Cancel</button><button class="btn bp" data-act="mok">Sign and approve</button></div>`,
      async () => {
        const otpEl = $("#m-otp") as HTMLInputElement | null;
        if ((otpEl?.value.trim() ?? "") !== code) return "That code doesn't match.";
        await onOk();
        return "";
      },
    );
  }

  /* ---------- events ---------- */
  const onInput = (e: Event): void => {
    const target = e.target;
    if (!VIS || !(target instanceof HTMLElement) || !target.closest("#eroot, #emodal")) return;
    const t = target as HTMLInputElement,
      d = t.dataset;
    if (UI.onb && d["ob"]) {
      UI.onb[d["ob"]] = t.value;
      UI.onb["err"] = "";
      return;
    }
    if (UI.onb && d["otp"] !== undefined) {
      const boxes = [...document.querySelectorAll<HTMLInputElement>("[data-otp]")],
        i = Number(d["otp"]),
        dg = t.value.replace(/\D/g, "");
      if (dg.length > 1) {
        dg.split("")
          .slice(0, 6 - i)
          .forEach((ch, k) => {
            const box = boxes[i + k];
            if (box) box.value = ch;
          });
      } else t.value = dg;
      UI.onb["otp"] = boxes.map((x) => x.value).join("");
      const nx = boxes[Math.min(i + Math.max(dg.length, 1), 5)];
      if (dg && nx) nx.focus();
      const vb = $("#ob-verify") as HTMLButtonElement | null;
      if (vb) vb.disabled = String(UI.onb["otp"] || "").length !== 6;
      return;
    }
    if (d["b"] && UI.draft) {
      const ks = d["b"].split(".");
      let o: Record<string, unknown> = UI.draft as unknown as Record<string, unknown>;
      ks.slice(0, -1).forEach((k) => {
        o = o[k] as Record<string, unknown>;
      });
      const lastKey = ks[ks.length - 1];
      if (lastKey) o[lastKey] = t.value;
    }
    if (d["dirq"]) {
      UI.dirQ = t.value;
      const pos = t.selectionStart ?? 0;
      render();
      const el = document.querySelector<HTMLInputElement>("[data-dirq]");
      if (el) {
        el.focus();
        el.setSelectionRange(pos, pos);
      }
    }
  };

  const onChange = (e: Event): void => {
    const target = e.target;
    if (!VIS || !(target instanceof HTMLElement) || !target.closest("#eroot, #emodal")) return;
    const t = target as HTMLInputElement & HTMLSelectElement,
      d = t.dataset;
    if (UI.onb && d["obchk"]) {
      UI.onb[d["obchk"]] = t.checked;
      UI.onb["err"] = "";
      return;
    }
    if (UI.onb && d["ob"]) {
      UI.onb[d["ob"]] = t.value;
      return;
    }
    if (d["login"]) {
      UI.login[d["login"]] = t.value;
      return;
    }
    if (d["j"] && UI.draft) {
      const order: Array<"div" | "dist" | "upz" | "uni"> = ["div", "dist", "upz", "uni"],
        jKey = d["j"] as "div" | "dist" | "upz" | "uni",
        i = order.indexOf(jKey);
      UI.draft.j[jKey] = t.value;
      order.slice(i + 1).forEach((k) => (UI.draft!.j[k] = ""));
      UI.draft.j.wards = [];
      render();
      return;
    }
    if (d["ward"] && UI.draft) {
      const w = UI.draft.j.wards,
        i = w.indexOf(d["ward"]);
      if (t.checked && i < 0) w.push(d["ward"]);
      if (!t.checked && i >= 0) w.splice(i, 1);
      return;
    }
    if (d["decl"] && UI.draft) {
      UI.draft.declare = t.checked;
      return;
    }
    if (d["b"] && UI.draft && t.tagName === "SELECT") {
      const ks = d["b"].split(".");
      let o: Record<string, unknown> = UI.draft as unknown as Record<string, unknown>;
      ks.slice(0, -1).forEach((k) => {
        o = o[k] as Record<string, unknown>;
      });
      const lastKey = ks[ks.length - 1];
      if (lastKey) o[lastKey] = t.value;
      return;
    }
    if (d["dirst"]) {
      UI.dirSt = t.value;
      render();
    }
  };

  const onKeyDown = (e: KeyboardEvent): void => {
    if (!VIS) return;
    const target = e.target as HTMLInputElement | null;
    if (
      UI.onb &&
      target?.dataset &&
      target.dataset["otp"] !== undefined &&
      e.key === "Backspace" &&
      !target.value
    ) {
      const pv = document.querySelector<HTMLElement>(
        '[data-otp="' + (Number(target.dataset["otp"]) - 1) + '"]',
      );
      if (pv) pv.focus();
    }
    const emodal = $("#emodal");
    if (e.key === "Escape" && emodal && !emodal.hidden) closeModal();
    if (e.key === "Enter" && target?.classList?.contains("click")) target.click();
  };

  const onClick = async (e: MouseEvent): Promise<void> => {
    const target = e.target;
    if (target instanceof HTMLElement && target.id === "emodal") {
      closeModal();
      return;
    }
    if (!VIS || !(target instanceof HTMLElement) || !target.closest("#eroot, #emodal")) return;
    const b = target.closest<HTMLButtonElement>("[data-act]");
    if (!b) return;
    const act = b.dataset["act"],
      id = b.dataset["id"] ?? null,
      r = UI.role;
    const top = () => window.scrollTo(0, 0);
    switch (act) {
      case "role":
        UI.role = b.dataset["r"] ?? "applicant";
        UI.open = null;
        UI.sb = false;
        render();
        top();
        break;
      case "login": {
        const loginRole = b.dataset["r"] ?? "applicant";
        UI.auth[loginRole] = loginRole === "applicant" ? (UI.login["applicant"] ?? null) : true;
        UI.page[loginRole] = "dash";
        UI.open = null;
        render();
        top();
        toast("Signed in");
        break;
      }
      case "logout": {
        UI.auth[r] = null;
        UI.open = null;
        UI.draft = null;
        const bridge = B();
        if (bridge) bridge.home(r);
        break;
      }
      case "opendesk": {
        const bridge = B();
        if (bridge && typeof UI.auth["applicant"] === "string") {
          bridge.openDesk(UI.auth["applicant"]);
        }
        break;
      }
      case "signup":
        signupModal();
        break;
      case "sufill": {
        const n = b.dataset["n"] ?? "",
          P = PEOPLE[n];
        if (!P) break;
        const suNid = $("#su-nid") as HTMLInputElement | null;
        const suDob = $("#su-dob") as HTMLInputElement | null;
        const suMob = $("#su-mob") as HTMLInputElement | null;
        const suMail = $("#su-mail") as HTMLInputElement | null;
        if (suNid) suNid.value = n;
        if (suDob) suDob.value = P.dob;
        if (suMob) suMob.value = "0171" + n.slice(-7);
        if (suMail)
          suMail.value =
            P.en
              .toLowerCase()
              .replace(/[^a-z]+/g, ".")
              .replace(/^\.|\.$/g, "") + "@mail.com";
        break;
      }
      case "sb":
        UI.sb = !UI.sb;
        render();
        break;
      case "page":
        UI.page[r] = b.dataset["p"] ?? "dash";
        UI.open = null;
        UI.sb = false;
        UI.errs = null;
        if (b.dataset["p"] !== "apply") UI.draft = null;
        render();
        top();
        break;
      case "newapp":
        UI.page["applicant"] = "apply";
        UI.draft = null;
        render();
        top();
        break;
      case "viewmine":
        UI.open = myApp()?.id ?? null;
        render();
        top();
        break;
      case "openapp":
        UI.open = id;
        render();
        top();
        break;
      case "back":
        UI.open = null;
        render();
        top();
        break;
      case "print":
        window.print();
        break;
      case "demofill": {
        const d = UI.draft;
        if (!d) break;
        const div = roots(J)[0],
          dist = div ? kidsOf(J, div.id, 1)[0] : undefined,
          upz = dist ? kidsOf(J, dist.id, 2).find((n) => n.name === "কেরানীগঞ্জ") : undefined,
          uni = upz ? kidsOf(J, upz.id, 3)[0] : undefined;
        if (!div || !dist || !upz || !uni) break;
        const t = takenWards(d.id);
        d.c.address = d.c.address || "বাড়ি ৮, রোড ২, শুভাড্যা, কেরানীগঞ্জ, ঢাকা";
        d.q = {
          degree: "Kamil",
          institution: "Dhaka Alia Madrasah",
          year: "2010",
          result: "First class",
        };
        d.j = {
          div: div.id,
          dist: dist.id,
          upz: upz.id,
          uni: uni.id,
          wards: kidsOf(J, uni.id, 4)
            .filter((w) => !t[w.id])
            .slice(0, 3)
            .map((w) => w.id),
        };
        d.o = {
          name: "শুভাড্যা কাজী অফিস",
          address: "বাজার রোড, শুভাড্যা, কেরানীগঞ্জ, ঢাকা",
          phone: d.c.mobile,
        };
        d.docs = Object.fromEntries(DOCS.map((x) => [x[0], x[0] + ".pdf"]));
        d.declare = true;
        UI.errs = null;
        render();
        toast("Demo data filled");
        break;
      }
      case "updoc":
        if (UI.draft && b.dataset["k"]) {
          UI.draft.docs[b.dataset["k"]] =
            b.dataset["k"] + "_" + Date.now().toString().slice(-4) + ".pdf";
          render();
        }
        break;
      case "rmdoc":
        if (UI.draft && b.dataset["k"]) {
          UI.draft.docs[b.dataset["k"]] = "";
          render();
        }
        break;
      case "savedraft":
        saveDraft();
        toast("Draft saved");
        render();
        break;
      case "submit": {
        if (!UI.draft) break;
        const errs = validate(UI.draft);
        UI.errs = errs;
        if (errs.length) {
          render();
          top();
          break;
        }
        const wasReturned = UI.draft.status === "RETURNED";
        UI.draft.status = "SUBMITTED";
        UI.draft.submittedAt = now();
        UI.draft.returnNote = "";
        const a = saveDraft();
        if (!a) break;
        hist(a, a.p.nameEn, wasReturned ? "Corrected and resubmitted" : "Application submitted");
        log(a.p.nameEn, `${wasReturned ? "Resubmitted" : "Submitted"} ${a.appNo}`, a.id);
        mail(a.c.email, a.p.nameEn, `Application ${a.appNo} received`, [
          `Dear ${a.p.nameEn},`,
          `We have received your application to be enlisted as a marriage registrar for ${placeOf(J, a.j.wards)}.`,
          "An Admin or the Super Admin will review it and approve it with eSign. We'll email you when there is a decision.",
        ]);
        save();
        UI.draft = null;
        UI.errs = null;
        UI.page["applicant"] = "dash";
        render();
        top();
        toast("Application submitted");
        break;
      }
      case "forward-unused": {
        const a = appById(id),
          me = currentUser(r);
        if (!a || !me) break;
        a.status = "FORWARDED";
        hist(a, me.name, "Verified by admin and forwarded to Super Admin");
        log(me.name, `Verified and forwarded ${a.appNo}`, a.id);
        save();
        render();
        top();
        toast("Forwarded to Super Admin");
        break;
      }
      case "return": {
        const a = appById(id),
          me = currentUser(r);
        if (!a || !me) break;
        reasonModal(
          "Return to applicant",
          "Explain what the applicant must correct. They will fix it and resubmit.",
          "Return",
          false,
          (t) => {
            a.status = "RETURNED";
            a.returnNote = t;
            hist(a, me.name, "Returned: " + t);
            log(me.name, `Returned ${a.appNo}: ${t}`, a.id);
            mail(a.c.email, a.p.nameEn, `Application ${a.appNo} needs correction`, [
              `Dear ${a.p.nameEn},`,
              "Your marriage registrar application was returned with this note:",
              t,
              "Please sign in, correct it and resubmit.",
            ]);
            save();
            render();
            toast("Returned to applicant");
          },
        );
        break;
      }
      case "reject": {
        const a = appById(id),
          me = currentUser(r);
        if (!a || !me) break;
        reasonModal(
          "Reject application",
          "The applicant will be told the reason. This can't be undone.",
          "Reject",
          true,
          (t) => {
            a.status = "REJECTED";
            a.rejectNote = t;
            hist(a, me.name, "Rejected: " + t);
            log(me.name, `Rejected ${a.appNo}: ${t}`, a.id);
            mail(a.c.email, a.p.nameEn, `Application ${a.appNo} rejected`, [
              `Dear ${a.p.nameEn},`,
              "Your marriage registrar application was rejected for this reason:",
              t,
            ]);
            save();
            render();
            toast("Application rejected");
          },
        );
        break;
      }
      case "approve": {
        const a = appById(id),
          me = currentUser(r);
        if (!a || !me) break;
        otpModal(
          "Approve with eSign",
          `Approving designates ${a.p.nameEn} as marriage registrar for ${placeOf(J, a.j.wards)}, issues the licence and sends it to their OneID Wallet.`,
          async () => {
            a.status = "ENLISTED";
            a.licenceNo = nextLicence(a.j.div);
            a.approvedAt = now();
            a.approvedBy = me.name;
            a.approverTitle = r === "super" ? "Super Admin" : "Admin";
            a.validTo = addDays(365 * 5).slice(0, 10);
            a.seal = await sealFor(a);
            hist(
              a,
              me.name,
              `Approved with eSign (${a.approverTitle}); licence ${a.licenceNo} issued and sent to OneID Wallet`,
            );
            log(me.name, `Approved ${a.appNo} with eSign; licence ${a.licenceNo}`, a.id);
            mail(
              a.c.email,
              a.p.nameEn,
              `You are enlisted as a marriage registrar (${a.licenceNo})`,
              [
                `Dear ${a.p.nameEn},`,
                `Your enlistment has been approved with eSign by ${me.name} (${a.approverTitle}). Licence ${a.licenceNo}, valid until ${fD(a.validTo)}.`,
                `You are designated for ${placeOf(J, a.j.wards)}. Your sealed licence is in your OneID Wallet, and you can now sign in to the Marriage Registrar Portal.`,
              ],
            );
            save();
            render();
            top();
            toast("Approved. Licence issued and sent to OneID Wallet.");
            const bridge = B();
            if (bridge) bridge.refresh();
          },
        );
        break;
      }
      case "suspend": {
        const a = appById(id),
          me = currentUser(r);
        if (!a || !me) break;
        reasonModal(
          "Suspend registrar",
          "The registrar can't approve marriages while suspended. Their open marriage applications are reassigned.",
          "Suspend",
          true,
          (t) => {
            a.status = "SUSPENDED";
            hist(a, me.name, "Suspended: " + t);
            log(me.name, `Suspended ${a.licenceNo}: ${t}`, a.id);
            mail(a.c.email, a.p.nameEn, `Licence ${a.licenceNo} suspended`, [
              `Dear ${a.p.nameEn},`,
              "Your marriage registrar licence has been suspended:",
              t,
            ]);
            save();
            render();
            toast("Registrar suspended");
            const bridge = B();
            if (bridge) bridge.refresh();
          },
        );
        break;
      }
      case "reinstate": {
        const a = appById(id),
          me = currentUser(r);
        if (!a || !me) break;
        a.status = "ENLISTED";
        hist(a, me.name, "Reinstated");
        log(me.name, `Reinstated ${a.licenceNo}`, a.id);
        save();
        render();
        toast("Registrar reinstated");
        const bridge = B();
        if (bridge) bridge.refresh();
        break;
      }
      case "cancel": {
        const a = appById(id),
          me = currentUser(r);
        if (!a || !me) break;
        reasonModal(
          "Cancel licence",
          "The licence and its seal are revoked and the wards become free. This can't be undone.",
          "Cancel licence",
          true,
          (t) => {
            a.status = "CANCELLED";
            hist(a, me.name, "Licence cancelled: " + t);
            log(me.name, `Cancelled ${a.licenceNo}: ${t}`, a.id);
            save();
            render();
            toast("Licence cancelled");
            const bridge = B();
            if (bridge) bridge.refresh();
          },
        );
        break;
      }
      case "dirsel":
        if (target.closest("[data-act=dirtog]")) break;
        UI.dirNode = id || null;
        if (id) UI.dirOpen[id] = true;
        render();
        break;
      case "dirtog":
        if (id) UI.dirOpen[id] = !UI.dirOpen[id];
        render();
        break;
      case "addward": {
        const uniEl = $("#jw-uni") as HTMLSelectElement | null,
          nmEl = $("#jw-name") as HTMLInputElement | null;
        const uni = uniEl?.value ?? "",
          nm = nmEl?.value.trim() ?? "";
        if (!nm || !uni || !J[uni]) {
          toast("Enter a ward name");
          break;
        }
        const nid = "j" + (Object.keys(J).length + 1) + "x";
        J[nid] = { id: nid, name: nm, level: 4, parent: uni, kids: [] };
        J[uni]!.kids.push(nid);
        S.extraWards = S.extraWards || [];
        S.extraWards.push({ id: nid, name: nm, parent: uni });
        log(currentUser(r)?.name ?? "Admin", `Added ward "${nm}" under ${J[uni]!.name}`);
        save();
        render();
        toast("Ward added");
        break;
      }
      case "adduser": {
        const nm = ($("#nu-name") as HTMLInputElement | null)?.value.trim() ?? "",
          em = ($("#nu-mail") as HTMLInputElement | null)?.value.trim() ?? "",
          ds = ($("#nu-des") as HTMLInputElement | null)?.value.trim() ?? "";
        if (!nm || !/^\S+@\S+\.\S+$/.test(em)) {
          toast("Enter a name and a valid email");
          break;
        }
        S.users.push({
          id: "u" + Date.now(),
          role: "admin",
          nid: "",
          name: nm,
          email: em,
          designation: ds || "Admin",
          mobile: "",
          active: true,
        });
        log(currentUser(r)?.name ?? "Super Admin", `Added admin ${nm}`);
        save();
        render();
        toast("Admin added");
        break;
      }
      case "toggleuser": {
        const u = userBy(id);
        if (!u) break;
        u.active = !u.active;
        log(
          currentUser(r)?.name ?? "Super Admin",
          `${u.active ? "Enabled" : "Disabled"} admin ${u.name}`,
        );
        save();
        render();
        break;
      }
      case "savesettings": {
        const mn = +(($("#set-min") as HTMLInputElement | null)?.value ?? 0),
          mx = +(($("#set-max") as HTMLInputElement | null)?.value ?? 0);
        if (!(mn > 0 && mx > mn)) {
          toast("Maximum age must be above minimum age");
          break;
        }
        S.settings.minAge = mn;
        S.settings.maxAge = mx;
        S.settings.multiPerWard =
          (($("#set-multi") as HTMLSelectElement | null)?.value ?? "0") === "1";
        S.settings.reqDocs = [...document.querySelectorAll<HTMLInputElement>("[data-reqdoc]")]
          .filter((x) => x.checked)
          .map((x) => x.dataset["reqdoc"] ?? "")
          .filter(Boolean);
        log(currentUser(r)?.name ?? "Admin", `Updated eligibility settings (age ${mn}–${mx})`);
        save();
        render();
        toast("Settings saved");
        break;
      }
      case "mail": {
        const m = (S.emails || []).find((x) => x.id === id);
        if (m) m.read = true;
        UI.inboxSel = id;
        save();
        render();
        break;
      }
      case "mclose":
        closeModal();
        break;
      case "mok": {
        if (!mOk) break;
        b.disabled = true;
        const res = await mOk();
        if (res === "pending") break;
        if (res) {
          const el = $("#m-err");
          if (el) {
            el.hidden = false;
            el.textContent = res;
          }
          b.disabled = false;
        } else closeModal();
        break;
      }
      case "reset":
        ls.del(STORE);
        seed();
        Object.assign(UI, {
          auth: { applicant: null, admin: null, super: null },
          open: null,
          draft: null,
          dirNode: null,
          dirOpen: {},
          dirQ: "",
          dirSt: "ENLISTED",
          errs: null,
        });
        render();
        toast("Demo data restored");
        break;
    }
  };

  document.addEventListener("input", onInput);
  document.addEventListener("change", onChange);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("click", onClick);

  cleanupPreviousEnlistmentListeners = () => {
    document.removeEventListener("input", onInput);
    document.removeEventListener("change", onChange);
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("click", onClick);
  };

  /* ---------- bridge to the shared portal ---------- */
  const bridge: ENLBridgeContract = {
    async init(): Promise<void> {
      await initKeys();
      ensureData();
      for (const a of S.apps) {
        if (a.status === "ENLISTED" && (!a.seal || a.seal.endsWith("|S:UNSIGNED"))) {
          a.seal = await sealFor(a);
        }
      }
      save();
    },
    show(role?: string, nid?: string | null, page?: string): void {
      ensureData();
      VIS = true;
      const targetRole = role || UI.role || "applicant";
      UI.role = targetRole;
      if (targetRole === "applicant") {
        if (nid !== undefined) {
          UI.auth["applicant"] = nid;
          if (nid) UI.login["applicant"] = nid;
        }
        if (page !== undefined) {
          UI.page["applicant"] = page;
        } else if (!UI.page["applicant"]) {
          UI.page["applicant"] = "dash";
        }
      }
      UI.open = null;
      UI.draft = null;
      UI.errs = null;
      const eroot = $("#eroot");
      if (eroot) eroot.hidden = false;
      render();
    },
    signIn(role: string): void {
      UI.auth[role] = true;
      UI.page[role] = "dash";
      this.show(role);
    },
    getRole(): string {
      return UI.role || "applicant";
    },
    syncUser(user): void {
      ensureData();
      PEOPLE[user.nid] = {
        en: user.name,
        bn: user.nameBn || user.name,
        dob: user.dob || "1996-05-15",
        g: "M",
      };
      const existing = S.users.find((u) => u.nid === user.nid);
      if (existing) {
        existing.name = user.name;
        existing.email = user.email;
        existing.mobile = user.mobile;
        if (user.nameBn) existing.nameBn = user.nameBn;
        if (user.dob) existing.dob = user.dob;
        if (user.ekycAt) existing.ekycAt = user.ekycAt;
      } else {
        S.users.push({
          id: user.nid,
          role: "applicant",
          nid: user.nid,
          name: user.name,
          ...(user.nameBn !== undefined ? { nameBn: user.nameBn } : {}),
          ...(user.dob !== undefined ? { dob: user.dob } : {}),
          email: user.email,
          mobile: user.mobile,
          active: true,
          ...(user.ekycAt !== undefined ? { ekycAt: user.ekycAt } : {}),
        });
      }
      UI.auth["applicant"] = user.nid;
      UI.login["applicant"] = user.nid;
      save();
    },
    hide(): void {
      VIS = false;
      const r = $("#eroot");
      if (r) {
        r.hidden = true;
        r.innerHTML = "";
      }
      closeModal();
    },
    enlisted() {
      return S.apps
        .filter((a) => ["ENLISTED", "SUSPENDED", "CANCELLED"].includes(a.status))
        .map((a) => {
          const p = pathOf(J, a.j.wards[0]);
          return {
            licenceNo: a.licenceNo ?? "",
            nid: String(a.p.nid),
            nameEn: a.p.nameEn,
            nameBn: a.p.nameBn,
            dob: a.p.dob,
            div: p[0]?.name ?? "",
            dist: p[1]?.name ?? "",
            upz: p[2]?.name ?? "",
            uni: p[3]?.name ?? "",
            wards: a.j.wards.map((w) => J[w]?.name ?? ""),
            office: a.o.address || a.o.name,
            email: a.c.email,
            mobile: a.c.mobile,
            status: a.status,
          };
        });
    },
    tree() {
      const t: Record<string, Record<string, Record<string, Record<string, string[]>>>> = {};
      Object.values(J)
        .filter((n) => n.level === 4)
        .forEach((w) => {
          const p = pathOf(J, w.id);
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
    },
    pendingFor(nid: string) {
      return S.apps.filter((a) => a.userId === nid).slice(-1)[0] || null;
    },
    reset(): void {
      ls.del(STORE);
      seed();
      Object.assign(UI, createDefaultEnlUI());
    },
    render,
  };

  window.ENLBridge = bridge;
}
