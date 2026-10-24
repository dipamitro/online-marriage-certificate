import type { AnyDeps } from "../types";

/** Navigation commands, isolated from other portal actions. */
export function createNavigationActions(dependencies: AnyDeps) {
  return async function handleNavigation(act: string, b: HTMLElement): Promise<boolean> {
    const id = b.dataset["id"] ?? null,
      P: string = dependencies.UI.portal;
    const top = () => window.scrollTo(0, 0);
    switch (act) {
      case "portal":
        dependencies.UI.portal = b.dataset["p"] ?? "home";
        dependencies.UI.sb = false;
        dependencies.render();
        top();
        break;
      case "login": {
        const lp = b.dataset["p"] ?? "applicant",
          n = dependencies.UI.login[lp];
        if (!n || !dependencies.userOf(n)) {
          dependencies.toast("Sign up first");
          break;
        }
        dependencies.doLogin(lp, n);
        break;
      }
      case "loginOLD": {
        const pKey = b.dataset["p"] ?? "applicant";
        dependencies.UI.auth[pKey] = dependencies.UI.login[pKey];
        dependencies.UI.page[pKey] = "dash";
        dependencies.UI.open[pKey] = null;
        dependencies.render();
        top();
        if (pKey === "esign") dependencies.toast("Signed in with OneID");
        break;
      }
      case "logout":
        if (P === "wallet") dependencies.UI.wallet = { cat: null, doc: null, sb: false };
        dependencies.UI.auth[P] = null;
        dependencies.UI.open[P] = null;
        dependencies.UI.draft = null;
        if (P !== "wallet") {
          if (P === "applicant" || P === "registrar") {
            dependencies.UI.home.role = P;
          }
          dependencies.UI.portal = "home";
        }
        dependencies.render();
        if (P !== "wallet") {
          window.OMRBridge?.onSignInRoleChange?.(dependencies.UI.home.role || "applicant");
        }
        break;
      case "opensb":
        dependencies.UI.sb = true;
        dependencies.render();
        break;
      case "closesb":
        dependencies.UI.sb = false;
        dependencies.render();
        break;
      case "page":
        if (b.dataset["pg"] === "enl-licence") {
          const authReg = dependencies.UI.auth.registrar ?? "";
          const rn = dependencies.REGISTRARS[authReg] && dependencies.REGISTRARS[authReg].nid;
          dependencies.UI.portal = "enl";
          window.ENLBridge?.show("applicant", rn, "licence");
          dependencies.render();
          window.scrollTo(0, 0);
          break;
        }
        dependencies.UI.page[P] = b.dataset["pg"] ?? "dash";
        dependencies.UI.open[P] = null;
        if (P === "applicant") dependencies.UI.open.esign = null;
        dependencies.UI.sb = false;
        dependencies.UI.accept = false;
        if (b.dataset["pg"] === "new") dependencies.startDraft(null);
        dependencies.render();
        top();
        break;
      case "openapp": {
        const a = dependencies.appById(id);
        const pTarget = b.dataset["p"] ?? P;
        if (pTarget === "applicant" && a && ["draft"].includes(a.status)) {
          dependencies.startDraft(a);
        } else {
          dependencies.UI.open[pTarget] = id;
        }
        dependencies.UI.accept = false;
        dependencies.render();
        top();
        break;
      }
      case "back":
        if (P === "applicant" && dependencies.UI.open.esign) dependencies.UI.open.esign = null;
        else dependencies.UI.open[P] = null;
        dependencies.UI.accept = false;
        dependencies.render();
        top();
        break;
      case "gorole": {
        const rr = b.dataset["r"] ?? "applicant";
        if (rr === "admin" || rr === "super") {
          dependencies.UI.portal = "enl";
          window.ENLBridge?.show(rr);
          dependencies.render();
        } else {
          dependencies.UI.portal = rr;
          dependencies.render();
        }
        window.scrollTo(0, 0);
        break;
      }
      case "reset":
        window.ENLBridge?.reset();
        dependencies.ls.del(dependencies.STORE);
        if (window.ENLBridge) {
          await window.ENLBridge.init();
        }
        dependencies.rebuildFromEnl();
        if (typeof dependencies.seed === "function") {
          await dependencies.seed();
        }
        dependencies.UI.portal = "home";
        dependencies.UI.auth = { applicant: null, esign: null, registrar: null, wallet: null };
        dependencies.UI.open = { applicant: null, esign: null, registrar: null, wallet: null };
        dependencies.UI.draft = null;
        dependencies.UI.errors = null;
        dependencies.render();
        dependencies.toast("Demo data restored");
        break;
      default:
        return false;
    }
    return true;
  };
}
