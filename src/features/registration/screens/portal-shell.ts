import type { AnyDeps } from "../types";

/**
 * Renders the active portal screen into `#root`
 * (or delegates to `#eroot` when `UI.portal === "enl"`).
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
   * Synchronizes the registrar directory from the Enlistment Engine and
   * renders the active portal screen into `#root`.
   */
  function render(): void {
    dependencies.rebuildFromEnl();

    const activePortal: string = dependencies.UI.portal;
    document.body.className = "p-" + (activePortal === "enl" ? "registrar" : activePortal);

    // Ensure legacy top pill bar (#pills) stays empty and hidden
    const pillsContainer = dependencies.$("#pills") as HTMLElement | null;
    if (pillsContainer) {
      pillsContainer.innerHTML = "";
      pillsContainer.hidden = true;
    }

    // Render active portal content (#root)
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
      screenHtml = dependencies.UI.inbox?.auth
        ? pubShell(dependencies.inboxPage())
        : dependencies.inboxPage();
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

  return { PORTALS: [] as Array<[string, string]>, render, pubShell };
}
