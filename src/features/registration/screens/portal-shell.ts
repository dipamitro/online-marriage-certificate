import type { AnyDeps, EmailMessage } from "../types";

/**
 * Top navigation bar switcher pills displayed across all portals.
 */
const TOP_BAR_PORTALS: Array<[string, string]> = [
  ["home", "🔐 Sign in"],
  ["wallet", "🪪 OneID Wallet"],
  ["verify", "🛡️ Verify"],
  ["inbox", "📧 Email"],
];

/**
 * Renders the top navigation bar (`#pills`) and mounts the active portal screen
 * into `#root` (or delegates to `#eroot` when `UI.portal === "enl"`).
 *
 * Dependencies: `$`, `S`, `UI`, `docPage`, `hydrateQR`, `inboxPage`, `loginPage`,
 * `rebuildFromEnl`, `roleHome`, `shell`, `verifyPage`, `walletLogin`, `walletShell`.
 */
export function createScreensPortalShell(dependencies: AnyDeps) {
  /**
   * Wraps public screens (`/verify`, `/inbox`, `doc`) in a centered container.
   */
  const pubShell = (innerHtml: string): string => `<div class="pubwrap">${innerHtml}</div>`;

  /**
   * Synchronizes the registrar directory from the Enlistment Engine, updates the
   * top navigation pills, and renders the active portal screen into `#root`.
   */
  function render(): void {
    dependencies.rebuildFromEnl();

    const activePortal: string = dependencies.UI.portal;
    document.body.className = "p-" + (activePortal === "enl" ? "registrar" : activePortal);

    // 1. Render top navigation bar pills (#pills)
    const unreadEmailsCount = dependencies.S.emails.filter(
      (email: EmailMessage) => !email.read,
    ).length;

    const pillsContainer = dependencies.$("#pills") as HTMLElement | null;
    if (pillsContainer) {
      const portalButtonsHtml = TOP_BAR_PORTALS.map(([portalKey, label]) => {
        const isActive =
          activePortal === portalKey || (activePortal === "doc" && portalKey === "inbox");
        const unreadBadgeHtml =
          portalKey === "inbox" && unreadEmailsCount
            ? `<span class="bdg">${unreadEmailsCount}</span>`
            : "";

        return `<button class="${isActive ? "on" : ""}" data-act="portal" data-p="${portalKey}">${label}${unreadBadgeHtml}</button>`;
      }).join("");

      pillsContainer.innerHTML =
        portalButtonsHtml +
        `<button data-act="reset" title="Reset demo data">↺ Reset demo</button>`;
    }

    // 2. Render active portal content (#root)
    const rootContainer = dependencies.$("#root") as HTMLElement | null;
    if (!rootContainer) return;

    rootContainer.style.display = activePortal === "enl" ? "none" : "";

    // When the Enlistment Engine (#eroot) is active, hide #root and notify React Router
    if (activePortal === "enl") {
      rootContainer.innerHTML = "";
      window.OMRBridge?.onPortalChange?.(activePortal);
      return;
    }

    if (window.ENLBridge) {
      window.ENLBridge.hide();
    }

    let screenHtml: string;
    if (activePortal === "home") {
      screenHtml = dependencies.roleHome();
    } else if (activePortal === "verify") {
      screenHtml = pubShell(dependencies.verifyPage());
    } else if (activePortal === "inbox") {
      screenHtml = pubShell(dependencies.inboxPage());
    } else if (activePortal === "doc") {
      screenHtml = pubShell(dependencies.docPage());
    } else if (activePortal === "wallet") {
      screenHtml = dependencies.UI.auth.wallet
        ? dependencies.walletShell()
        : dependencies.walletLogin();
    } else if (!dependencies.UI.auth[activePortal]) {
      screenHtml = dependencies.loginPage(activePortal);
    } else {
      screenHtml = dependencies.shell(activePortal);
    }

    rootContainer.innerHTML = screenHtml;
    dependencies.hydrateQR(rootContainer);
    window.OMRBridge?.onPortalChange?.(activePortal);
  }

  return { PORTALS: TOP_BAR_PORTALS, render, pubShell };
}
