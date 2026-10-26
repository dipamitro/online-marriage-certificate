/* eslint-disable prettier/prettier */
import type { AnyDeps } from "../types";

/**
 * Handles authenticating a user into the requested portal (`applicant`, `registrar`, `esign`, `wallet`)
 * and routing unenlisted registrars to the Enlistment Portal (`/enlistment`).
 *
 * Dependencies: `UI`, `licOf`, `markSeen`, `render`, `toast`.
 */
export function createServicesSignIn(dependencies: AnyDeps) {
  /**
   * Signs a user (identified by `nid`) into `portalKey`.
   *
   * - If `portalKey === "registrar"` and the user does not yet hold an active registrar licence,
   *   they are redirected to the Marriage Registrar Enlistment Portal (`/enlistment`).
   * - Otherwise, their session is stored in `UI.auth[portalKey]` and the portal dashboard opens.
   */
  function doLogin(
    portalKey: string,
    nid: string,
    openApplicationId?: string | null,
    openAsEsign?: boolean,
  ): void {
    const registrarLicence = dependencies.licOf(nid);

    // Unenlisted registrar applicants go to the Enlistment Portal (/enlistment)
    if (portalKey === "registrar" && !registrarLicence) {
      dependencies.UI.login.registrar = nid;
      if (dependencies.UI.pending && dependencies.UI.pending.p === portalKey) {
        dependencies.UI.pending = null;
      }
      dependencies.UI.portal = "enl";
      window.ENLBridge?.show("applicant", nid);
      dependencies.render();
      window.scrollTo(0, 0);
      return;
    }

    // Standard portal sign-in
    dependencies.UI.auth[portalKey] = portalKey === "registrar" ? (registrarLicence ?? null) : nid;
    dependencies.UI.login[portalKey] = nid;
    dependencies.UI.page[portalKey] = portalKey === "wallet" ? "vault" : "dash";
    dependencies.UI.open[portalKey] = null;
    dependencies.UI.accept = false;

    // Configure OneID Wallet view or open a specific application if deep-linked
    if (portalKey === "wallet") {
      dependencies.UI.wallet = {
        cat: openApplicationId ? "marriage" : null,
        doc: null,
        sb: false,
      };
      if (openApplicationId) {
        dependencies.markSeen(nid);
      }
    } else if (openApplicationId) {
      dependencies.UI.open[portalKey] = openApplicationId;
    }

    // Check if the user arrived via an eSign email invitation link
    const pendingRedirect =
      dependencies.UI.pending && dependencies.UI.pending.p === portalKey
        ? dependencies.UI.pending
        : null;

    dependencies.UI.open.esign = null;
    if (portalKey === "applicant" && (openAsEsign || (pendingRedirect && pendingRedirect.esign))) {
      dependencies.UI.open.applicant = null;
      dependencies.UI.page.applicant = "esignreq";
      dependencies.UI.open.esign =
        openApplicationId || (pendingRedirect && pendingRedirect.appId) || null;
    }

    if (pendingRedirect) {
      dependencies.UI.pending = null;
    }

    dependencies.render();
    window.scrollTo(0, 0);
  }

  return { doLogin };
}
