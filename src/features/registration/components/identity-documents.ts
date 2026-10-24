import type { AnyDeps } from "../types";

/** components/identity-documents. Dependencies: PEOPLE, addDays, esc, fD, obSplit, today, userOf. */
export function createComponentsIdentityDocuments(dependencies: AnyDeps) {
  const OB_IC = {
    back: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    x: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    lock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>',
    eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    idc: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M9 3h6v4H9z"/><circle cx="9" cy="12.5" r="2"/><path d="M6 17c.6-1.5 1.7-2.2 3-2.2s2.4.7 3 2.2M14 11h4M14 14h3"/></svg>',
    cam: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    cal: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    card: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    user: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    shield:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    thumb:
      '<svg width="150" height="130" viewBox="0 0 150 130" aria-hidden="true"><circle cx="75" cy="68" r="44" fill="#E3ECFB"/><circle cx="22" cy="44" r="6" fill="#DC2626"/><circle cx="128" cy="30" r="6" fill="#3B82F6"/><circle cx="124" cy="102" r="6" fill="#F59E0B"/><path d="M58 64h-14a4 4 0 00-4 4v28a4 4 0 004 4h14z" fill="#2563EB"/><path d="M58 64l14-26c3-5 11-3 10 3l-3 17h18c5 0 8 4 7 9l-5 24c-1 4-4 7-8 7H58z" fill="#FBD5B5" stroke="#E8B48F" stroke-width="2"/></svg>',
  };
  const OB_ORDER = [
    "register",
    "otp",
    "password",
    "start",
    "method",
    "pmethod",
    "scanFront",
    "scanBack",
    "pScan",
    "pNfc",
    "confirm",
    "face",
    "done",
  ];
  function passNo(n: string): string {
    return "EB" + String(n).slice(-7);
  }
  function passExp(): string {
    return dependencies.addDays(dependencies.today(), 365 * 7);
  }
  function mrzName(n: string): string {
    const parts = (dependencies.PEOPLE[n]?.en ?? "")
      .toUpperCase()
      .replace(/[^A-Z ]/g, "")
      .split(" ")
      .filter(Boolean);
    const sur = parts.pop() || "";
    return sur + "<<" + parts.join("<");
  }
  function passCard(n: string): string {
    const P = dependencies.PEOPLE[n],
      s2 = dependencies.obSplit(n),
      dob = P.dob.replace(/-/g, "").slice(2),
      exp = passExp().replace(/-/g, "").slice(2);
    const l1 = ("P<BGD" + mrzName(n)).padEnd(44, "<").slice(0, 44),
      l2 =
        (passNo(n) + "<4BGD" + dob + "7" + (P.g === "F" ? "F" : "M") + exp + "3" + n.slice(0, 10))
          .padEnd(42, "<")
          .slice(0, 42) + "06";
    return `<div class="ppc"><div class="h"><span>PEOPLE'S REPUBLIC OF BANGLADESH</span><span>PASSPORT · e-PASSPORT</span></div>
    <div class="b"><div class="ph"></div><div class="f"><div><i>Type</i><b>P</b></div><div><i>Country code</i><b>BGD</b></div><div><i>Passport No.</i><b>${passNo(n)}</b></div><div><i>Surname</i><b>${dependencies.esc((s2.last || s2.first).toUpperCase())}</b></div><div><i>Given name</i><b>${dependencies.esc(s2.first.toUpperCase())}</b></div><div><i>Nationality</i><b>BANGLADESHI</b></div><div><i>Date of birth</i><b>${dependencies.fD(P.dob).toUpperCase()}</b></div><div><i>Personal No.</i><b>${n}</b></div><div><i>Sex</i><b>${P.g}</b></div><div><i>Date of expiry</i><b>${dependencies.fD(passExp()).toUpperCase()}</b></div></div></div>
    <div class="mrz">${dependencies.esc(l1)}
${dependencies.esc(l2)}</div></div>`;
  }
  function obCands(p: string): string[] {
    return (
      p === "registrar"
        ? ["1990123403", "1992123405", "6222222222"]
        : ["1990123456", "2001987654", "5678901234"]
    ).filter((n) => !dependencies.userOf(n));
  }
  return { OB_IC, OB_ORDER, passNo, passExp, mrzName, passCard, obCands };
}
