import type { AnyDeps, ApplicationRecord, EmailMessage } from "../types";

/** screens/wallet. Dependencies: IC, PEOPLE, S, UI, addDays, appById, certHTML, coupleEn, docHTML, esc, fD, fDT, ini, regName, save, signupBox, toEn, today, userOptions. */
export function createScreensWallet(dependencies: AnyDeps) {
  const WI = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/></svg>',
    vault:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M3 10h18"/></svg>',
    derived:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="12" height="14" rx="2"/><path d="M16 21H6a2 2 0 01-2-2V7"/></svg>',
    plans:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="3" y="4" width="7" height="7" rx="1"/><path d="M14 5h7M14 9h5M3 15h7M3 19h7M14 15h7M14 19h5"/></svg>',
    sub: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></svg>',
    buy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14l-1 13H6z"/><path d="M9 7a3 3 0 016 0"/></svg>',
    set: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
    prof: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    bell: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>',
    trash:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
    chev: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    t_training:
      '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6h20l6 6v30H10z"/><path d="M15 15h12M15 20h14M15 25h8M15 30h6"/><circle cx="32" cy="30" r="5"/><path d="M29.5 34.5L28 41l4-2 4 2-1.5-6.5"/></svg>',
    t_marriage:
      '<svg viewBox="0 0 48 48" fill="none" stroke="#1D4ED8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h22l6 6v30H9z"/><path d="M14 13h12M14 18h16"/><circle cx="19" cy="31" r="6"/><circle cx="27" cy="31" r="6"/><path d="M22 23.5l1-2 1 2" stroke="#60A5FA"/></svg>',
    t_corp:
      '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="9" width="38" height="28" rx="2"/><rect x="9" y="13" width="30" height="20"/><path d="M13 18h10M13 22h12M13 26h8"/><circle cx="32" cy="23" r="4"/><path d="M30 27l-1 6 3-1.5 3 1.5-1-6"/></svg>',
    t_id: '<svg viewBox="0 0 48 48" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="38" height="28" rx="3" stroke="#1F3A68"/><rect x="18" y="7" width="12" height="7" rx="2" fill="#1D4ED8" stroke="#1F3A68"/><circle cx="16" cy="23" r="4" fill="#5AA2E8" stroke="none"/><path d="M9 33c1-4 4-6 7-6s6 2 7 6" fill="#5AA2E8" stroke="none"/><path d="M27 21h11M27 26h11M27 31h7" stroke="#1F3A68"/><path d="M40 15v4M38 17h4" stroke="#1D4ED8"/></svg>',
    t_visa:
      '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="11" y="5" width="26" height="38" rx="2"/><circle cx="24" cy="20" r="8"/><path d="M16 20h16M24 12c3 3 3 13 0 16M24 12c-3 3-3 13 0 16"/><path d="M17 34h14M19 38h10"/></svg>',
    t_identity:
      '<svg viewBox="0 0 48 48" fill="none" stroke="#2F7FD3" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 4l4.5 3.3 5.6-.2 1.7 5.3 4.6 3.2-1.7 5.4 1.7 5.4-4.6 3.2-1.7 5.3-5.6-.2L24 44l-4.5-3.3-5.6.2-1.7-5.3-4.6-3.2L9.3 27 7.6 21.6l4.6-3.2 1.7-5.3 5.6.2z"/><path d="M17 24l5 5 9-10"/></svg>',
  };
  const WCATS: Array<[string, string, string, string[] | null]> = [
    [
      "training",
      "Training Certificate",
      WI.t_training,
      [
        "Cyber Security Fundamentals",
        "Project Management Professional",
        "Advanced Excel for Professionals",
        "Digital Bangladesh Leadership",
        "Public Procurement (e-GP)",
        "First Aid and CPR",
        "English Communication Skills",
        "Data Protection Essentials",
        "Customer Service Excellence",
      ],
    ],
    ["marriage", "Marriage Certificate", WI.t_marriage, null],
    [
      "corp",
      "Corporate Office",
      WI.t_corp,
      [
        "Appointment Letter",
        "Experience Certificate",
        "Salary Certificate",
        "No Objection Certificate",
        "Promotion Letter",
        "Release Letter",
        "Employee ID Card",
      ],
    ],
    ["id", "ID Card", WI.t_id, ["National ID Card (Smart Card)"]],
    ["visa", "VISA", WI.t_visa, ["Schengen Tourist Visa"]],
    ["identity", "Identity Documents", WI.t_identity, ["Passport"]],
  ];
  const wDocs = (nid: string): ApplicationRecord[] =>
    dependencies.S.apps.filter(
      (a: ApplicationRecord) =>
        a.status === "issued" &&
        a.vault &&
        (dependencies.toEn(a.f.groom.nid).trim() === nid ||
          dependencies.toEn(a.f.bride.nid).trim() === nid),
    );
  const ringIcon = WI.t_marriage.replace('viewBox="0 0 48 48"', 'viewBox="6 4 36 40"');
  function markSeen(nid: string): void {
    dependencies.S.walletSeen = dependencies.S.walletSeen || {};
    dependencies.S.walletSeen[nid] = wDocs(nid).map((a) => a.id);
    dependencies.save();
  }
  function walletLogin(): string {
    return `<div class="login" style="background:#F4F7FB"><div class="lcard" style="box-shadow:0 20px 60px rgba(16,24,40,.15)"><div class="lleft" style="background:linear-gradient(135deg,#0B2A55,#1F6FD1)"><h1>Your documents, <em style="color:#8FD3FF">verified and in one place.</em></h1><p>OneID Wallet keeps your verified identity documents and certificates. Marriage certificates from the Online Marriage Registration system are delivered here automatically.</p><ul><li>Documents Vault by document type</li><li>Digital Nikahnama with eSign and VDS</li><li>Share and verify anywhere</li></ul></div>
    <div class="lright"><div class="brandrow">${walletLogo()}</div><h2>Sign in to OneID Wallet</h2><p class="sub">Demo: choose whose wallet to open</p>${dependencies.UI.pending && dependencies.UI.pending.p === "wallet" ? `<div class="feebox" style="margin-bottom:12px">${dependencies.UI.pending.msg}</div>` : ""}<div class="fg"><label>OneID account</label>${dependencies.userOptions("wallet")}</div><button class="btn bp bfw" data-act="login" data-p="wallet">Sign in with OneID</button>${dependencies.signupBox("wallet")}</div></div></div>`;
  }
  function walletLogo(): string {
    return `<span class="wlogo" aria-label="OneID Wallet"><svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="wg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1F6FD1"/><stop offset="1" stop-color="#3B82F6"/></linearGradient></defs><circle cx="20" cy="20" r="16" fill="none" stroke="url(#wg)" stroke-width="6"/><path d="M8 17c5 2 9-4 13-1s6 7 11 4" fill="none" stroke="#60A5FA" stroke-width="3"/></svg><b>neID</b><small>Wallet</small></span>`;
  }
  function walletShell(): string {
    const nid = dependencies.UI.auth.wallet ?? "",
      P = dependencies.PEOPLE[nid],
      W = dependencies.UI.wallet;
    const items: Array<[string, string, string]> = [
      ["home", "Home", WI.home],
      ["vault", "Document Vaults", WI.vault],
      ["derived", "Derived Documents", WI.derived],
      ["plans", "Browse Plans", WI.plans],
      ["sub", "My Subscription", WI.sub],
      ["buy", "My Purchases", WI.buy],
      ["set", "Settings", WI.set],
      ["prof", "Profile", WI.prof],
    ];
    const unread = dependencies.S.emails.filter(
      (m: EmailMessage) => !m.read && m.link.type === "vault" && m.link.nid === nid,
    ).length;
    return `<div class="wl"><header class="wl-top"><button class="wham" data-act="wsb" aria-label="Menu">${dependencies.IC.menu}</button>${walletLogo()}<div class="wl-r"><button class="wbell" data-act="wnote" aria-label="Notifications">${WI.bell}<span class="b">${unread ? unread : "9+"}</span></button><button class="wlogout" data-act="logout">Logout</button></div></header>
    <div class="wl-body"><aside class="wl-sb ${W.sb ? "open" : ""}"><div class="wl-prof"><div class="wl-ph">${dependencies.ini(P?.en)}</div><div class="wl-nm">${dependencies.esc(P?.en)}</div><div class="wl-ver">Verified</div><div class="wl-id">ID: ${dependencies.esc(nid)}</div></div>
      ${items.map(([k, l, ic]) => `<button class="wl-it ${k === "vault" ? "on" : ""}" data-act="wnav" data-k="${k}">${ic}${l}</button>`).join("")}</aside>
      <div class="wl-ov ${W.sb ? "open" : ""}" data-act="wsb"></div>
      <main class="wl-main">${walletMain(nid)}</main></div></div>`;
  }
  function walletMain(nid: string): string {
    const W = dependencies.UI.wallet,
      docs = wDocs(nid),
      seen: string[] = (dependencies.S.walletSeen || {})[nid] || [];
    if (W.doc && W.kind === "cert") {
      const a: ApplicationRecord | undefined = dependencies.appById(W.doc);
      if (!a || !a.cert) return "";
      return `<div class="wcrumb"><button data-act="wcat" data-k="">Documents Vault</button>›<button data-act="wcat" data-k="marriage">Marriage Certificate</button>›<span>SN ${dependencies.esc(a.cert.sn)}</span></div>
      <div class="wl-h"><div><h1>Marriage Certificate</h1><p>${dependencies.esc(dependencies.coupleEn(a))} · SN ${dependencies.esc(a.cert.sn)} · issued ${dependencies.fD(a.cert.at)} by Law &amp; Justice Division</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="wbtn p" data-act="pdf" data-kind="cert" data-id="${a.id}">Download PDF</button><button class="wbtn" data-act="wverc" data-id="${a.id}">Verify</button></div></div>
      <div class="dv" style="margin-top:20px">${dependencies.certHTML(a)}</div>`;
    }
    if (W.doc) {
      const a: ApplicationRecord | undefined = dependencies.appById(W.doc);
      if (!a || !a.issued) return "";
      return `<div class="wcrumb"><button data-act="wcat" data-k="">Documents Vault</button>›<button data-act="wcat" data-k="marriage">Marriage Certificate</button>›<span>${dependencies.esc(a.issued.regNo)}</span></div>
      <div class="wl-h"><div><h1>Digital Nikahnama</h1><p>${dependencies.esc(dependencies.coupleEn(a))} · ${dependencies.esc(a.issued.regNo)} · issued ${dependencies.fD(a.issued.at)} by Law &amp; Justice Division</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="wbtn p" data-act="pdf" data-id="${a.id}">Download PDF</button><button class="wbtn" data-act="verifyapp" data-id="${a.id}">Verify</button></div></div>
      <div class="dv" style="margin-top:20px">${dependencies.docHTML(a)}</div>`;
    }
    if (W.cat) {
      const c = WCATS.find((x) => x[0] === W.cat);
      if (!c) return "";
      const row = (a: ApplicationRecord, kind: string) => {
        const C = kind === "cert";
        return `<div class="wdoc"><div class="ti">${ringIcon}</div><div><b>${C ? "Marriage Certificate" : "Digital Nikahnama <span class='bn' style='font-weight:500;color:#3B5B8C'>· ডিজিটাল নিকাহনামা</span>"}</b><div class="meta">${dependencies.esc(dependencies.coupleEn(a))} · ${C && a.cert ? "SN " + dependencies.esc(a.cert.sn) + " · Reg. " + dependencies.esc(a.issued?.regNo) : dependencies.esc(a.issued?.regNo)} · Received ${dependencies.fDT(a.vault?.at)}</div><div class="meta">Issuer: Law &amp; Justice Division · Registrar ${dependencies.esc(dependencies.regName(a.f.registrar))}</div><div class="tags"><span class="wtag g">✓ Verified</span><span class="wtag b">${C ? "eSigned by registrar" : "eSigned by bride, groom &amp; registrar"}</span><span class="wtag">VDS sealed</span>${C ? `<span class="wtag">English</span>` : `<span class="wtag">বাংলা</span>`}</div></div><div class="acts"><button class="wbtn p" data-act="wview" data-id="${a.id}" data-kind="${kind}">View</button><button class="wbtn" data-act="pdf" data-id="${a.id}" ${C ? 'data-kind="cert"' : ""}>Download</button><button class="wbtn" data-act="${C ? "wverc" : "verifyapp"}" data-id="${a.id}">Verify</button></div></div>`;
      };
      const list =
        c[0] === "marriage"
          ? docs.length
            ? docs.map((a) => row(a, "nk") + (a.cert ? row(a, "cert") : "")).join("")
            : `<div class="wempty">No marriage documents yet. When a marriage registrar approves your marriage registration and sends it to your OneID Vault, the Digital Nikahnama and Marriage Certificate appear here.</div>`
          : (c[3] ?? [])
              .map(
                (n, i) =>
                  `<div class="wdoc"><div class="ti" style="background:#F1F5FA;color:#1B2333">${c[2]}</div><div><b>${dependencies.esc(n)}</b><div class="meta">Demo document · added ${dependencies.fD(dependencies.addDays(dependencies.today(), -30 - i * 17))}</div><div class="tags"><span class="wtag g">✓ Verified</span></div></div><div class="acts"><button class="wbtn" data-act="wdemo">View</button></div></div>`,
              )
              .join("");
      return `<div class="wcrumb"><button data-act="wcat" data-k="">Documents Vault</button>›<span>${c[1]}</span></div>
      <div class="wl-h"><div><h1>${c[1]}</h1><p>${c[0] === "marriage" ? "Digital Nikahnama and Marriage Certificate issued through the Online Marriage Registration system" : "Your verified documents in this category"}</p></div><button class="wtrash" data-act="wdemo">${WI.trash} Trash</button></div><div class="wdocs">${list}</div>`;
    }
    const count = (k: string) =>
      k === "marriage"
        ? docs.reduce((n, a) => n + (a.cert ? 2 : 1), 0)
        : (WCATS.find((x) => x[0] === k)?.[3]?.length ?? 0);
    const isNew = docs.some((a) => !seen.includes(a.id));
    return `<div class="wl-h"><div><h1>Documents Vault</h1><p>Manage your verified documents and certificates securely</p></div><button class="wtrash" data-act="wdemo">${WI.trash} Trash</button></div>
    <div class="wl-panel"><h2>Select Document Type</h2><p>Select document type to get your desired document details</p>
    <div class="wtypes">${WCATS.map((c) => {
      const n = count(c[0]);
      return `<button class="wtype ${c[0] === "marriage" ? "mar" : ""}" data-act="wcat" data-k="${c[0]}">${c[0] === "marriage" && isNew ? `<span class="wnew">NEW</span>` : ""}<span class="ti">${c[2]}</span><span><b>${c[1]}</b><span>${n} document${n === 1 ? "" : "s"}</span></span><span class="ch">${WI.chev}</span></button>`;
    }).join("")}</div></div>`;
  }
  return { WI, WCATS, wDocs, ringIcon, markSeen, walletLogin, walletLogo, walletShell, walletMain };
}
