/* eslint-disable prettier/prettier */
import type { EnlApplication, EnlState, EnlUIState, EnlUser, JurNode } from "../types";
import { esc, ini } from "../services/applications";

export interface ShellDeps {
  $: (s: string) => HTMLElement | null;
  jur: Record<string, JurNode>;
  state: EnlState;
  ui: EnlUIState;
  getVis: () => boolean;
  userBy: (id: string | null | undefined) => EnlUser | null;
  appById: (id: string | null | undefined) => EnlApplication | undefined;
  // Page renderers
  applicantDash: () => string;
  applyPage: () => string;
  licencePage: () => string;
  adminDash: () => string;
  appDetail: (a: EnlApplication, r: string) => string;
  directoryPage: () => string;
  jurPage: () => string;
  usersPage: (r: string) => string;
  settingsPage: () => string;
  auditPage: () => string;
  appTable: (list: EnlApplication[], emptyMsg: string) => string;
}

interface QRCodeInstance {
  new (
    el: HTMLElement,
    options: {
      text: string;
      width?: number;
      height?: number;
      correctLevel?: number;
    },
  ): unknown;
  CorrectLevel: {
    L: number;
    M: number;
    Q: number;
    H: number;
  };
}

declare const QRCode: QRCodeInstance | undefined;

export function createScreensShell(deps: ShellDeps) {
  const {
    $,
    jur,
    state,
    ui,
    getVis,
    userBy,
    appById,
    applicantDash,
    applyPage,
    licencePage,
    adminDash,
    appDetail,
    directoryPage,
    jurPage,
    usersPage,
    settingsPage,
    auditPage,
    appTable,
  } = deps;

  /* ---------- render ---------- */
  function render(): void {
    if (!getVis()) return;
    const r = ui.role;
    const eroot = $("#eroot");
    if (!eroot) return;
    eroot.innerHTML = !ui.auth[r] ? loginPage(r) : shell(r);
    document.querySelectorAll<HTMLElement>("#eroot [data-qr]").forEach((el) => {
      if (typeof QRCode === "function" && !el.dataset["done"]) {
        el.dataset["done"] = "1";
        try {
          new QRCode(el, {
            text: el.dataset["qr"] ?? "",
            width: 100,
            height: 100,
            correctLevel: QRCode.CorrectLevel.M,
          });
        } catch {
          // Ignore QR rendering error
        }
      }
    });
  }
  function loginPage(r: string): string {
    const cfgMap: Record<string, { h: string; p: string; steps: string[] }> = {
      applicant: {
        h: "Apply to become a marriage registrar",
        p: "Individuals who wish to serve as a Nikah Registrar sign in with OneID, apply for the wards they want to serve, and track their application until the licence is issued.",
        steps: [
          "Sign up once with OneID eKYC",
          "Fill in qualifications, jurisdiction, office and documents",
          "An Admin or the Super Admin reviews it",
          "They approve with eSign; the licence goes to your OneID Wallet",
        ],
      },
      admin: {
        h: "Admin console",
        p: "Admins review applications and approve them with eSign, maintain the jurisdiction master and settings, and see every enlisted registrar by division, district, upazila, union and ward.",
        steps: [
          "Read the full application form",
          "Approve with eSign, return or reject",
          "Maintain jurisdictions and settings",
          "Browse the registrar directory",
        ],
      },
      super: {
        h: "Super Admin console",
        p: "The Super Admin has full access: approve registrars with eSign, suspend, reinstate or cancel licences, and manage admins.",
        steps: [
          "Read the full application form",
          "Approve with eSign, return or reject",
          "Suspend, reinstate or cancel registrars",
          "Add or disable admins",
        ],
      },
    };
    const cfg = cfgMap[r] ?? cfgMap["applicant"]!;
    let form: string;
    if (r === "applicant") {
      const apps = state.users.filter((u) => u.role === "applicant");
      if (!apps.some((u) => u.nid === ui.login["applicant"]))
        ui.login["applicant"] = apps[0] ? apps[0].nid : "";
      form = `<div class="fg"><label>OneID account <span class="en">(people who have signed up)</span></label><select class="inp" data-login="applicant">${apps.map((u) => `<option value="${u.nid}" ${ui.login["applicant"] === u.nid ? "selected" : ""}>${esc(u.name)} (NID ••••${u.nid.slice(-4)})</option>`).join("")}</select></div>
      <div class="fg"><label>Password</label><input class="inp" type="password" value="demo-pass" readonly></div>
      <button class="btn bp bfw" data-act="login" data-r="applicant">Sign in with OneID</button>
      <div class="or">New here?</div><button class="btn bfw" data-act="signup">Sign up with OneID eKYC</button>
      <p class="hint" style="text-align:center">Register, confirm the email code, set a password, then verify with your NID (camera scan or manual) or passport (scan + NFC) and a face check. eKYC is done only once.</p>`;
    } else {
      const u = userBy(r === "admin" ? "u-admin" : "u-super");
      form = `<div class="fg"><label>Official account</label><input class="inp" value="${esc(u?.name)} · ${esc(u?.designation)}" readonly></div>
      <div class="fg"><label>Password</label><input class="inp" type="password" value="demo-pass" readonly></div>
      <button class="btn bp bfw" data-act="login" data-r="${r}">Sign in</button><p class="hint" style="text-align:center;margin-top:10px">Officials sign in with a second factor in production.</p>`;
    }
    return `<div class="login"><div class="lcard"><div class="lleft"><div class="seal">LJD</div><h1>${cfg.h}</h1><p>${cfg.p}</p><ol>${cfg.steps.map((s) => `<li>${s}</li>`).join("")}</ol></div>
    <div class="lright"><h2>Sign in</h2><p class="sub" style="margin-bottom:16px">Marriage Registrar Enlistment Portal · Law and Justice Division</p>${form}<p class="hint" style="text-align:center;margin-top:16px">Prototype: OneID, eKYC, eSign and email are simulated.</p></div></div></div>`;
  }
  function navFor(r: string): Array<[string] | [string, string, number?]> {
    const cnt = (st: string[]): number => state.apps.filter((a) => st.includes(a.status)).length;
    if (r === "applicant")
      return [
        ["My application"],
        ["dash", "Dashboard"],
        ["apply", "Application"],
        ["licence", "My licence"],
      ];
    const common: Array<[string] | [string, string, number?]> = [
      ["Applications"],
      ["dash", "Dashboard"],
      ["verify", "Review and approval", cnt(["SUBMITTED"])],
      ["all", "All applications"],
      ["Registrars"],
      ["directory", "Registrar directory"],
      ["System"],
      ["jur", "Jurisdictions"],
      ["users", "Users and roles"],
      ["settings", "Eligibility settings"],
      ["audit", "Audit log"],
    ];
    return common;
  }
  const currentUser = (r: string): EnlUser | null =>
    r === "applicant"
      ? userBy(String(ui.auth["applicant"] || ""))
      : state.users.find((u) => u.id === (r === "admin" ? "u-admin" : "u-super")) || null;
  function shell(r: string): string {
    const me = currentUser(r);
    const pg = ui.page[r] ?? "dash";
    const titles: Record<string, string> = {
      dash: "Dashboard",
      apply: "Application",
      licence: "My licence",
      verify: "Review and approval",
      approve: "Review and approval",
      all: "All applications",
      directory: "Registrar directory",
      jur: "Jurisdictions",
      users: "Users and roles",
      settings: "Eligibility settings",
      audit: "Audit log",
    };
    const openApp = ui.open ? appById(ui.open) : undefined;
    const content = openApp ? appDetail(openApp, r) : pageFor(r, pg);
    const roleName = r === "super" ? "Super Admin" : r === "admin" ? "Admin" : "Applicant";
    return `<aside id="sb" class="${ui.sb ? "open" : ""}"><div class="sb-head"><div class="mark">MR</div><div><b>Registrar Enlistment</b><span>Law and Justice Division</span></div></div>
    <nav class="sb-nav">${navFor(r)
      .map((it) =>
        it.length === 1
          ? `<div class="sb-grp">${it[0]}</div>`
          : `<button class="sb-it ${pg === it[0] && !ui.open ? "on" : ""}" data-act="page" data-p="${it[0]}">${it[1]}${it[2] ? `<span class="n">${it[2]}</span>` : ""}</button>`,
      )
      .join("")}</nav>
    <div class="sb-foot"><div class="who"><div class="av">${ini(me?.name)}</div><div><b>${esc(me?.name)}</b><span>${roleName}</span></div></div><button class="btn sm bfw" data-act="logout">Sign out</button></div></aside>
    <div id="ov" class="${ui.sb ? "open" : ""}" data-act="sb"></div>
    <div id="main"><header id="tb"><button class="hamb" data-act="sb" aria-label="Open menu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button><div><h1>${openApp ? "Application " + esc(openApp.appNo) : (titles[pg] ?? "Dashboard")}</h1><div class="crumb">${roleName} · ${esc(me?.designation || "OneID verified · NID ••••" + String(me?.nid ?? "").slice(-4))}</div></div></header><div class="content">${content}</div></div>`;
  }
  function pageFor(r: string, pg: string): string {
    if (r === "applicant")
      return pg === "apply" ? applyPage() : pg === "licence" ? licencePage() : applicantDash();
    switch (pg) {
      case "verify":
        return appTable(
          state.apps.filter((a) => a.status === "SUBMITTED"),
          "No applications waiting for review.",
        );
      case "approve":
        return appTable(
          state.apps.filter((a) => a.status === "FORWARDED"),
          "No verified applications waiting for your approval.",
        );
      case "all":
        return appTable(
          state.apps
            .filter((a) => a.status !== "DRAFT")
            .slice()
            .reverse(),
          "No applications yet.",
        );
      case "directory":
        return directoryPage();
      case "jur":
        return jurPage();
      case "users":
        return usersPage(r);
      case "settings":
        return settingsPage();
      case "audit":
        return auditPage();
      default:
        return adminDash();
    }
  }

  return {
    render,
    loginPage,
    navFor,
    currentUser,
    shell,
    pageFor,
  };
}
