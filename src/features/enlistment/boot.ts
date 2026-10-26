import type {
  ENLBridgeContract,
  EnlApplication,
  EnlState,
  EnlUIState,
  EnlUser,
  JurNode,
} from "./types";
import { PEOPLE } from "./constants/people";
import { now } from "./services/applications";
import { buildTreeData, pathOf } from "./services/jurisdiction";
import { initKeys, sealFor } from "./services/seal";
import {
  STORE,
  createDefaultEnlUI,
  ensureEnlistmentData,
  ls,
  saveEnlistmentState,
  seedData,
} from "./services/storage";
import { createScreensApplicant } from "./screens/applicant";
import { createScreensAdmin } from "./screens/admin";
import { createScreensSuperAdmin } from "./screens/superadmin";
import { createScreensSystem } from "./screens/system";
import { createScreensDialogs } from "./screens/dialogs";
import { createScreensShell } from "./screens/shell";
import { createEventsActions } from "./events/actions";

let sharedEnlUI: EnlUIState = createDefaultEnlUI();
let cleanupPreviousEnlistmentListeners: (() => void) | null = null;

/**
 * Synchronously boots the Registrar Enlistment engine and registers window.ENLBridge.
 */
export function bootEnlistment(): void {
  if (cleanupPreviousEnlistmentListeners) {
    cleanupPreviousEnlistmentListeners();
    cleanupPreviousEnlistmentListeners = null;
  }

  const $ = (s: string): HTMLElement | null => document.querySelector<HTMLElement>(s);
  let VIS = false;

  const data = ensureEnlistmentData();
  let S: EnlState = data.state;
  let J: Record<string, JurNode> = data.jur;

  if (!ls.get(STORE)) {
    sharedEnlUI = createDefaultEnlUI();
  }
  const UI: EnlUIState = sharedEnlUI;

  const save = (): void => saveEnlistmentState(S);

  const B = () => (typeof window !== "undefined" ? window.OMRBridge : undefined);

  const bUser = (nid: string | null | undefined): EnlUser | null => {
    const bridge = B();
    if (!bridge || !nid) return null;
    const u = bridge.user(nid);
    if (!u) return null;
    return {
      id: u.id,
      role: "applicant",
      nid: u.nid,
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      active: true,
      ...(u.ekycAt !== undefined ? { ekycAt: u.ekycAt } : {}),
      ...(u.ekycMethod !== undefined ? { ekycMethod: u.ekycMethod } : {}),
    };
  };

  const appById = (id: string | null | undefined): EnlApplication | undefined =>
    S.apps.find((a) => a.id === id);

  const userBy = (id: string | null | undefined): EnlUser | null =>
    S.users.find((u) => u.id === id || u.nid === id) || bUser(id);

  const currentUser = (r: string): EnlUser | null =>
    r === "applicant"
      ? userBy((UI.auth["applicant"] as string) || UI.login["applicant"] || "1985123401")
      : userBy(r === "admin" ? "u-admin" : "u-super");

  function log(by: string, text: string, appId?: string | null): void {
    S.audit.unshift({ at: now(), by, text, appId: appId || null });
  }

  function mail(to: string, toName: string, subject: string, body: string[]): void {
    const bridge = B();
    if (bridge) bridge.mail(to, toName, subject, body);
  }

  function hist(a: EnlApplication, by: string, text: string): void {
    (a.history = a.history || []).push({ at: now(), by, text });
  }

  function reseed(): void {
    ls.del(STORE);
    S = seedData(J);
    save();
  }

  function blankApp(user: EnlUser): EnlApplication {
    const bridge = B();
    const P: {
      en?: string;
      bn?: string;
      dob?: string;
      g?: string;
      father?: string;
      mother?: string;
    } = Object.assign({}, PEOPLE[user.nid] || {}, (bridge && bridge.person(user.nid)) || {});
    return {
      id: null,
      appNo: "",
      userId: user.nid,
      status: "DRAFT",
      createdAt: now(),
      p: {
        nameBn: P.bn || user.nameBn || user.name,
        nameEn: P.en || user.name,
        father: P.father || "",
        mother: P.mother || "",
        dob: P.dob || user.dob || "",
        nid: user.nid,
        gender: P.g === "F" ? "Female" : "Male",
      },
      c: { mobile: user.mobile, email: user.email, address: "" },
      q: { degree: "", institution: "", year: "", result: "" },
      j: { div: "", dist: "", upz: "", uni: "", wards: [] },
      o: { name: "", address: "", phone: "" },
      docs: {},
      declare: false,
      history: [],
    };
  }

  function resetUI(): void {
    Object.assign(UI, createDefaultEnlUI());
  }

  // 1. Dialogs & Modals
  let renderFn: () => void = () => {};
  const dialogs = createScreensDialogs({
    $,
    jur: J,
    state: S,
    ui: UI,
    save,
    render: () => renderFn(),
    log,
  });

  // 2. Screen Renderers
  const applicantScreens = createScreensApplicant({
    $,
    jur: J,
    state: S,
    ui: UI,
    currentUser,
    save,
    render: () => renderFn(),
    toast: dialogs.toast,
    certHTML: dialogs.certHTML,
    appById,
    blankApp,
  });

  const adminScreens = createScreensAdmin({
    $,
    jur: J,
    state: S,
    ui: UI,
    userBy,
    stepsHTML: applicantScreens.stepsHTML,
    certHTML: dialogs.certHTML,
  });

  const superAdminScreens = createScreensSuperAdmin({
    $,
    jur: J,
    state: S,
    ui: UI,
  });

  const systemScreens = createScreensSystem({
    $,
    jur: J,
    state: S,
    ui: UI,
  });

  // 3. Shell Renderer
  const shellScreens = createScreensShell({
    $,
    jur: J,
    state: S,
    ui: UI,
    getVis: () => VIS,
    userBy,
    appById,
    applicantDash: applicantScreens.applicantDash,
    applyPage: applicantScreens.applyPage,
    licencePage: applicantScreens.licencePage,
    adminDash: adminScreens.adminDash,
    appDetail: adminScreens.appDetail,
    directoryPage: systemScreens.directoryPage,
    jurPage: superAdminScreens.jurPage,
    usersPage: superAdminScreens.usersPage,
    settingsPage: superAdminScreens.settingsPage,
    auditPage: superAdminScreens.auditPage,
    appTable: adminScreens.appTable,
  });

  renderFn = shellScreens.render;

  // 4. Action Listeners
  const actions = createEventsActions({
    $,
    jur: J,
    state: S,
    ui: UI,
    getVis: () => VIS,
    setVis: (v: boolean) => {
      VIS = v;
    },
    save,
    render: () => renderFn(),
    toast: dialogs.toast,
    modal: dialogs.modal,
    closeModal: dialogs.closeModal,
    reasonModal: dialogs.reasonModal,
    signupModal: dialogs.signupModal,
    otpModal: dialogs.otpModal,
    certHTML: dialogs.certHTML,
    appById,
    userBy,
    currentUser,
    log,
    mail,
    hist,
    seed: reseed,
    resetUI,
    myApp: applicantScreens.myApp,
    saveDraft: applicantScreens.saveDraft,
    B,
  });

  cleanupPreviousEnlistmentListeners = actions.attach();

  // 5. ENLBridge Implementation
  const bridge: ENLBridgeContract = {
    async init(): Promise<void> {
      await initKeys(ls);
      const data2 = ensureEnlistmentData();
      S = data2.state;
      J = data2.jur;
      for (const a of S.apps) {
        if (a.status === "ENLISTED" && (!a.seal || a.seal.endsWith("|S:UNSIGNED"))) {
          a.seal = await sealFor(a, J);
        }
      }
      save();
    },

    show(role?: string, nid?: string | null, page?: string): void {
      const data2 = ensureEnlistmentData();
      S = data2.state;
      J = data2.jur;
      VIS = true;
      const targetRole = role || UI.role || "applicant";
      UI.role = targetRole;
      if (targetRole === "applicant") {
        if (nid !== undefined) {
          UI.auth["applicant"] = nid;
          if (nid) UI.login["applicant"] = nid;
        }
        if (page !== undefined) {
          UI.page["applicant"] = page;
        } else if (!UI.page["applicant"]) {
          UI.page["applicant"] = "dash";
        }
      }
      UI.open = null;
      UI.draft = null;
      UI.errs = null;
      const eroot = $("#eroot");
      if (eroot) eroot.hidden = false;
      renderFn();
    },

    signIn(role: string): void {
      UI.auth[role] = true;
      UI.page[role] = "dash";
      this.show(role);
    },

    getRole(): string {
      return UI.role || "applicant";
    },

    syncUser(user): void {
      const data2 = ensureEnlistmentData();
      S = data2.state;
      J = data2.jur;
      PEOPLE[user.nid] = {
        en: user.name,
        bn: user.nameBn || user.name,
        dob: user.dob || "1996-05-15",
        g: "M",
      };
      const existing = S.users.find((u) => u.nid === user.nid);
      if (existing) {
        existing.name = user.name;
        existing.email = user.email;
        existing.mobile = user.mobile;
        if (user.nameBn) existing.nameBn = user.nameBn;
        if (user.dob) existing.dob = user.dob;
        if (user.ekycAt) existing.ekycAt = user.ekycAt;
      } else {
        S.users.push({
          id: user.nid,
          role: "applicant",
          nid: user.nid,
          name: user.name,
          ...(user.nameBn !== undefined ? { nameBn: user.nameBn } : {}),
          ...(user.dob !== undefined ? { dob: user.dob } : {}),
          email: user.email,
          mobile: user.mobile,
          active: true,
          ...(user.ekycAt !== undefined ? { ekycAt: user.ekycAt } : {}),
        });
      }
      UI.auth["applicant"] = user.nid;
      UI.login["applicant"] = user.nid;
      save();
    },

    hide(): void {
      VIS = false;
      const r = $("#eroot");
      if (r) {
        r.hidden = true;
        r.innerHTML = "";
      }
      dialogs.closeModal();
    },

    enlisted() {
      return S.apps
        .filter((a) => ["ENLISTED", "SUSPENDED", "CANCELLED"].includes(a.status))
        .map((a) => {
          const p = pathOf(J, a.j.wards[0]);
          return {
            licenceNo: a.licenceNo ?? "",
            nid: String(a.p.nid),
            nameEn: a.p.nameEn,
            nameBn: a.p.nameBn,
            dob: a.p.dob,
            div: p[0]?.name ?? "",
            dist: p[1]?.name ?? "",
            upz: p[2]?.name ?? "",
            uni: p[3]?.name ?? "",
            wards: a.j.wards.map((w) => J[w]?.name ?? ""),
            office: a.o.address || a.o.name,
            email: a.c.email,
            mobile: a.c.mobile,
            status: a.status,
          };
        });
    },

    tree() {
      return buildTreeData(J);
    },

    pendingFor(nid: string) {
      return S.apps.filter((a) => a.userId === nid).slice(-1)[0] || null;
    },

    reset(): void {
      reseed();
      resetUI();
    },

    render: () => renderFn(),
  };

  window.ENLBridge = bridge;
}
