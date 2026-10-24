import type { AnyDeps } from "../types";

/** components/symbols. Dependencies: . */
export function createComponentsSymbols(_dependencies: AnyDeps = {}) {
  const IC = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
    globe:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="13" rx="2"/><circle cx="12" cy="10.5" r="4"/><path d="M8 21h8M12 17v4"/></svg>',
    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>',
    appr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h6M7 14h4"/><path d="M15 15l5-8"/></svg>',
    tab: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 14c1-3 2-5 3-5s1 3 2 3 1-2 2-2"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    shield:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    face: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="12" cy="10" r="5"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/><path d="M10 9.5h.01M14 9.5h.01M10.5 12c.8.6 2.2.6 3 0"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 010 10h-3"/></svg>',
    menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    wallet:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 012-2h13v4"/><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 13.5h2"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6"/></svg>',
  };
  if (typeof document !== "undefined") {
    let p = "";
    for (let k = 0; k < 7; k++) {
      let d = "";
      for (let x = 0; x <= 150; x += 3) {
        const y = 13 + 9 * Math.sin((x / 150) * Math.PI * 4 + (k * Math.PI) / 7);
        d += (x ? "L" : "M") + x + " " + y.toFixed(2);
      }
      p += `<path d="${d}" fill="none" stroke="#1D4ED8" stroke-opacity=".45" stroke-width=".6"/>`;
    }
    document.documentElement.style.setProperty(
      "--guil",
      `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="26">${p}</svg>`)}")`,
    );
  }
  const SEAL = `<svg class="seal" width="88" height="88" viewBox="0 0 100 100" aria-hidden="true"><defs><path id="scp" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"/></defs><circle cx="50" cy="50" r="47" fill="none" stroke="#1D4ED8" stroke-width="2.5"/><circle cx="50" cy="50" r="27" fill="none" stroke="#1D4ED8" stroke-width="1.5"/><text font-size="8" font-weight="700" fill="#1D4ED8" letter-spacing="1.1"><textPath href="#scp">LAW AND JUSTICE DIVISION * VISIBLE DIGITAL SEAL *</textPath></text><text x="50" y="49" text-anchor="middle" font-size="13" font-weight="800" fill="#1D4ED8">VDS</text><text x="50" y="61" text-anchor="middle" font-size="7" fill="#1D4ED8">PKI SEALED</text></svg>`;
  return { IC, SEAL };
}
