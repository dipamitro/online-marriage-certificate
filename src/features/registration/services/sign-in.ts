import type { AnyDeps } from "../types";

/** services/sign-in. Dependencies: UI, licOf, markSeen, render, toast. */
export function createServicesSignIn(dependencies: AnyDeps) {
  function doLogin(p: string, nid: string, openId?: string | null, asEsign?: boolean): void {
    if (p === "registrar" && !dependencies.licOf(nid)) {
      dependencies.UI.login.registrar = nid;
      if (dependencies.UI.pending && dependencies.UI.pending.p === p)
        dependencies.UI.pending = null;
      dependencies.UI.portal = "enl";
      window.ENLBridge?.show("applicant", nid);
      dependencies.render();
      window.scrollTo(0, 0);
      dependencies.toast("Signed in with OneID");
      return;
    }
    dependencies.UI.auth[p] = p === "registrar" ? (dependencies.licOf(nid) ?? null) : nid;
    dependencies.UI.login[p] = nid;
    dependencies.UI.page[p] = p === "wallet" ? "vault" : "dash";
    dependencies.UI.open[p] = null;
    dependencies.UI.accept = false;
    if (p === "wallet") {
      dependencies.UI.wallet = { cat: openId ? "marriage" : null, doc: null, sb: false };
      if (openId) dependencies.markSeen(nid);
    } else if (openId) dependencies.UI.open[p] = openId;
    const pe =
      dependencies.UI.pending && dependencies.UI.pending.p === p ? dependencies.UI.pending : null;
    dependencies.UI.open.esign = null;
    if (p === "applicant" && (asEsign || (pe && pe.esign))) {
      dependencies.UI.open.applicant = null;
      dependencies.UI.page.applicant = "esignreq";
      dependencies.UI.open.esign = openId || (pe && pe.appId) || null;
    }
    if (pe) dependencies.UI.pending = null;
    dependencies.render();
    window.scrollTo(0, 0);
    dependencies.toast("Signed in with OneID");
  }
  return { doLogin };
}
