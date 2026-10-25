import type { AnyDeps } from "../types";

/** services/bridge. Dependencies: PEOPLE, S, UI, demoEmail, demoMobile, doLogin, pushMail, rebuildFromEnl, render, save. */
export function createServicesBridge(dependencies: AnyDeps) {
  window.OMRBridge = {
    user(nid: string) {
      const u = dependencies.S && dependencies.S.users[nid];
      if (!u) return null;
      const P = dependencies.PEOPLE[nid] || {};
      return {
        id: nid,
        nid,
        name: u.name || P.en || nid,
        email: u.email,
        mobile: u.mobile,
        ekycAt: u.ekyc && u.ekyc.at,
        ekycMethod: u.ekyc && u.ekyc.method,
      };
    },
    person(nid: string) {
      const u = dependencies.S && dependencies.S.users[nid];
      const P = dependencies.PEOPLE[nid];
      if (!P && !u) return null;
      return {
        en: u?.name || P?.en || nid,
        bn: u?.nameBn || P?.bn || u?.name || nid,
        dob: u?.dob || P?.dob || "1995-01-01",
        g: P?.g || "M",
      };
    },
    demoContact(nid: string) {
      return dependencies.PEOPLE[nid]
        ? { email: dependencies.demoEmail(nid), mobile: dependencies.demoMobile(nid) }
        : null;
    },
    mail(to: string, toName: string, subject: string, body: string[]) {
      dependencies.pushMail(to, toName, subject, body, { type: "none" });
      dependencies.save();
    },
    home(signOutRole?: string) {
      if (signOutRole === "admin" || signOutRole === "super") {
        dependencies.UI.home.role = signOutRole;
      } else if (signOutRole === "applicant") {
        dependencies.UI.home.role = "registrar";
      }
      dependencies.UI.portal = "home";
      window.ENLBridge?.hide();
      dependencies.render();
      window.OMRBridge?.onSignInRoleChange?.(dependencies.UI.home.role || "applicant");
      window.scrollTo(0, 0);
    },
    openDesk(nid: string) {
      window.ENLBridge?.hide();
      dependencies.rebuildFromEnl();
      dependencies.UI.portal = "registrar";
      dependencies.doLogin("registrar", nid);
    },
    refresh() {
      dependencies.rebuildFromEnl();
      dependencies.save();
      dependencies.render();
    },
    async resetDemo() {
      dependencies.ls?.del(dependencies.STORE);
      dependencies.rebuildFromEnl();
      if (typeof dependencies.seedSync === "function") {
        dependencies.seedSync();
      }
      if (typeof dependencies.seed === "function") {
        await dependencies.seed();
      }
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
    },
    getPortal(): string {
      return dependencies.UI.portal;
    },
    setPortal(portal: string) {
      if (!portal || dependencies.UI.portal === portal) return;
      dependencies.UI.portal = portal;
      dependencies.UI.sb = false;
      if (portal === "enl") {
        window.ENLBridge?.show();
      } else {
        window.ENLBridge?.hide();
      }
      dependencies.render();
    },
    getSignInRole(): string {
      return dependencies.UI.home.role || "applicant";
    },
    setSignInRole(role: string) {
      if (!role) return;
      const changed = dependencies.UI.home.role !== role || dependencies.UI.portal !== "home";
      dependencies.UI.home.role = role;
      dependencies.UI.home.err = "";
      dependencies.UI.portal = "home";
      window.ENLBridge?.hide();
      if (changed) {
        dependencies.render();
      }
    },
  };
  return {};
}
