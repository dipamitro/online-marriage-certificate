import type { AnyDeps, EmailMessage } from "../types";

/** screens/portal-shell. Dependencies: $, S, UI, docPage, hydrateQR, inboxPage, loginPage, rebuildFromEnl, roleHome, shell, verifyPage, walletLogin, walletShell. */
export function createScreensPortalShell(dependencies: AnyDeps) {
  const PORTALS: Array<[string, string]> = [
    ["home", "🔐 Sign in"],
    ["wallet", "🪪 OneID Wallet"],
    ["verify", "🛡️ Verify"],
    ["inbox", "📧 Email"],
  ];
  function render(): void {
    dependencies.rebuildFromEnl();
    const p: string = dependencies.UI.portal;
    document.body.className = "p-" + (p === "enl" ? "registrar" : p);
    const unread = dependencies.S.emails.filter((m: EmailMessage) => !m.read).length;
    const pillsEl = dependencies.$("#pills") as HTMLElement | null;
    if (pillsEl) {
      pillsEl.innerHTML =
        PORTALS.map(
          ([k, l]) =>
            `<button class="${p === k || (p === "doc" && k === "inbox") ? "on" : ""}" data-act="portal" data-p="${k}">${l}${k === "inbox" && unread ? `<span class="bdg">${unread}</span>` : ""}</button>`,
        ).join("") + `<button data-act="reset" title="Reset demo data">↺ Reset demo</button>`;
    }
    const rootEl = dependencies.$("#root") as HTMLElement | null;
    if (!rootEl) return;
    rootEl.style.display = p === "enl" ? "none" : "";
    if (p === "enl") {
      rootEl.innerHTML = "";
      window.OMRBridge?.onPortalChange?.(p);
      return;
    }
    if (window.ENLBridge) window.ENLBridge.hide();
    let html: string;
    if (p === "home") html = dependencies.roleHome();
    else if (p === "verify") html = pubShell(dependencies.verifyPage());
    else if (p === "inbox") html = pubShell(dependencies.inboxPage());
    else if (p === "doc") html = pubShell(dependencies.docPage());
    else if (p === "wallet")
      html = dependencies.UI.auth.wallet ? dependencies.walletShell() : dependencies.walletLogin();
    else if (!dependencies.UI.auth[p]) html = dependencies.loginPage(p);
    else html = dependencies.shell(p);
    rootEl.innerHTML = html;
    dependencies.hydrateQR(rootEl);
    window.OMRBridge?.onPortalChange?.(p);
  }
  const pubShell = (c: string): string => `<div class="pubwrap">${c}</div>`;
  return { PORTALS, render, pubShell };
}
