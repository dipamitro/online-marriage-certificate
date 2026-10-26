/* eslint-disable prettier/prettier */
import type { AnyDeps } from "../types";

/**
 * Handles top-level portal navigation, sidebar toggling, page switching,
 * sign-out, and demo data reset (`↺ Reset demo`).
 */
export function createNavigationActions(dependencies: AnyDeps) {
  return function handleNavigation(
    action: string,
    button: HTMLElement,
  ): boolean | Promise<boolean> {
    const applicationId = button.dataset["id"] ?? null;
    const currentPortal: string = dependencies.UI.portal;
    const scrollToTop = () => window.scrollTo(0, 0);

    switch (action) {
      case "portal":
        dependencies.UI.portal = button.dataset["p"] ?? "home";
        dependencies.UI.sb = false;
        dependencies.render();
        scrollToTop();
        break;

      case "login": {
        const targetPortal = button.dataset["p"] ?? "applicant";
        const selectedNid = dependencies.UI.login[targetPortal];
        if (!selectedNid || !dependencies.userOf(selectedNid)) {
          dependencies.toast("Sign up first");
          break;
        }
        dependencies.doLogin(targetPortal, selectedNid);
        break;
      }

      case "loginOLD": {
        const targetPortal = button.dataset["p"] ?? "applicant";
        dependencies.UI.auth[targetPortal] = dependencies.UI.login[targetPortal];
        dependencies.UI.page[targetPortal] = "dash";
        dependencies.UI.open[targetPortal] = null;
        dependencies.render();
        scrollToTop();
        break;
      }

      case "logout":
        if (currentPortal === "wallet") {
          dependencies.UI.wallet = { cat: null, doc: null, sb: false };
        }
        dependencies.UI.auth[currentPortal] = null;
        dependencies.UI.open[currentPortal] = null;
        dependencies.UI.draft = null;

        if (currentPortal !== "wallet") {
          if (currentPortal === "applicant" || currentPortal === "registrar") {
            dependencies.UI.home.role = currentPortal;
          }
          dependencies.UI.portal = "home";
        }
        dependencies.render();
        if (currentPortal !== "wallet") {
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

      case "page": {
        const targetPage = button.dataset["pg"] ?? "dash";

        if (targetPage === "enl-licence") {
          const activeRegistrarLicence = dependencies.UI.auth.registrar ?? "";
          const registrarNid =
            dependencies.REGISTRARS[activeRegistrarLicence] &&
            dependencies.REGISTRARS[activeRegistrarLicence].nid;
          dependencies.UI.portal = "enl";
          window.ENLBridge?.show("applicant", registrarNid, "licence");
          dependencies.render();
          scrollToTop();
          break;
        }

        dependencies.UI.page[currentPortal] = targetPage;
        dependencies.UI.open[currentPortal] = null;
        if (currentPortal === "applicant") {
          dependencies.UI.open.esign = null;
        }
        dependencies.UI.sb = false;
        dependencies.UI.accept = false;
        if (targetPage === "new") {
          dependencies.startDraft(null);
        }
        dependencies.render();
        scrollToTop();
        break;
      }

      case "openapp": {
        const application = dependencies.appById(applicationId);
        const targetPortal = button.dataset["p"] ?? currentPortal;
        if (targetPortal === "applicant" && application && ["draft"].includes(application.status)) {
          dependencies.startDraft(application);
        } else {
          dependencies.UI.open[targetPortal] = applicationId;
        }
        dependencies.UI.accept = false;
        dependencies.render();
        scrollToTop();
        break;
      }

      case "back":
        if (currentPortal === "applicant" && dependencies.UI.open.esign) {
          dependencies.UI.open.esign = null;
        } else {
          dependencies.UI.open[currentPortal] = null;
        }
        dependencies.UI.accept = false;
        dependencies.render();
        scrollToTop();
        break;

      case "gorole": {
        const targetRole = button.dataset["r"] ?? "applicant";
        if (targetRole === "admin" || targetRole === "super") {
          dependencies.UI.portal = "enl";
          window.ENLBridge?.show(targetRole);
          dependencies.render();
        } else {
          dependencies.UI.portal = targetRole;
          dependencies.render();
        }
        scrollToTop();
        break;
      }

      case "reset":
        return (async () => {
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
          dependencies.UI.inbox = {
            id: null,
            auth: null,
            emailInput: "",
            passwordInput: "",
            err: "",
          };
          dependencies.UI.draft = null;
          dependencies.UI.errors = null;
          dependencies.render();
          dependencies.toast("Demo reset");
          return true;
        })();

      default:
        return false;
    }

    return true;
  };
}
