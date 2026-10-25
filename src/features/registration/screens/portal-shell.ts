import type { AnyDeps } from "../types";

/**
 * Top navigation bar switcher pills have been removed in favor of dedicated routes.
 * Kept as an empty array for backward compatibility with existing callers.
 */
const TOP_BAR_PORTALS: Array<[string, string]> = [];

/**
 * Manages the top navigation container (`#pills`) and mounts the active portal screen
 * into `#root` (or delegates to `#eroot` when `UI.portal === "enl"`).
 *
 * Only the `↺ Reset demo` button appears on the Admin and Super Admin portals.
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
   * top navigation bar, and renders the active portal screen into `#root`.
   */
  function render(): void {
    dependencies.rebuildFromEnl();

    const activePortal: string = dependencies.UI.portal;
    document.body.className = "p-" + (activePortal === "enl" ? "registrar" : activePortal);

    // Determine whether the current view is the Admin or Super Admin portal
    const currentEnlRole = window.ENLBridge?.getRole?.();
    const isAdminOrSuperAdmin =
      activePortal === "admin" ||
      activePortal === "super" ||
      (activePortal === "enl" && (currentEnlRole === "admin" || currentEnlRole === "super")) ||
      (activePortal === "home" &&
        (dependencies.UI.home?.role === "admin" || dependencies.UI.home?.role === "super"));

    // 1. Render top bar (#pills): TOP_BAR_PORTALS removed; only Reset demo appears on admin and super admin portal
    const pillsContainer = dependencies.$("#pills") as HTMLElement | null;
    if (pillsContainer) {
      if (isAdminOrSuperAdmin) {
        pillsContainer.innerHTML =
          `<button data-act="reset" title="Reset demo data">↺ Reset demo</button>`;
        pillsContainer.style.display = "";
        document.documentElement.style.setProperty("--pill", "46px");
      } else {
        pillsContainer.innerHTML = "";
        pillsContainer.style.display = "none";
        document.documentElement.style.setProperty("--pill", "0px");
      }
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

  return { PORTALS: TOP_BAR_PORTALS, render, pubShell };
}
