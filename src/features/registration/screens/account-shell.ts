import type { AnyDeps, ApplicationRecord } from "../types";

/** screens/account-shell. Dependencies: IC, PEOPLE, S, UI, accOf, applicantPage, esc, esignPage, ini, regName, registrarPage, toEn. */
export function createScreensAccountShell(dependencies: AnyDeps) {
  function shell(p: string): string {
    const who = dependencies.UI.auth[p] ?? "";
    let name = "",
      role = "",
      items: Array<Array<string | number>> = [],
      title = "",
      sub = "",
      content = "";
    if (p === "applicant") {
      const acc = dependencies.accOf(who);
      name = acc.name;
      role = acc.role + " · Applicant";
      const mine: ApplicationRecord[] = dependencies.S.apps.filter(
        (a: ApplicationRecord) => a.owner === who,
      );
      const mineE: ApplicationRecord[] = dependencies.S.apps.filter(
        (a: ApplicationRecord) =>
          a.status !== "draft" &&
          (dependencies.toEn(a.f.groom.nid) === who || dependencies.toEn(a.f.bride.nid) === who),
      );
      const pendE = mineE.filter(
        (a) =>
          a.status === "esign" &&
          !a.esign[dependencies.toEn(a.f.groom.nid) === who ? "groom" : "bride"].sign,
      );
      items = [
        ["MAIN"],
        ["dash", "Dashboard", dependencies.IC.home],
        ["new", "New Application", dependencies.IC.plus],
        [
          "track",
          "Track Applications",
          dependencies.IC.list,
          mine.filter((a) => a.status === "reverted").length,
        ],
        ["MY ESIGN"],
        ["esignreq", "eSign Requests", dependencies.IC.tab, pendE.length],
        ["esigndone", "Signed & Completed", dependencies.IC.check],
      ];
      dependencies.UI._mineE = mineE;
      dependencies.UI._pendE = pendE;
      ({ title, sub, content } = dependencies.applicantPage(acc, mine));
    } else if (p === "esign") {
      const P = dependencies.PEOPLE[who];
      name = P?.en ?? who;
      role = "OneID verified citizen";
      const mine: ApplicationRecord[] = dependencies.S.apps
        .filter((a: ApplicationRecord) => a.f.groom.nid === who || a.f.bride.nid === who)
        .filter((a: ApplicationRecord) => a.status !== "draft");
      const pend = mine.filter(
        (a) => a.status === "esign" && !a.esign[a.f.groom.nid === who ? "groom" : "bride"].sign,
      );
      items = [
        ["MY ESIGN"],
        ["dash", "eSign Requests", dependencies.IC.tab, pend.length],
        ["done", "Signed & Completed", dependencies.IC.check],
      ];
      ({ title, sub, content } = dependencies.esignPage(who, mine, pend));
    } else {
      name = dependencies.regName(who);
      role = "Marriage Registrar · " + who;
      const mine: ApplicationRecord[] = dependencies.S.apps.filter(
        (a: ApplicationRecord) => a.f.registrar === who && a.status !== "draft",
      );
      const cnt = (st: string) => mine.filter((a) => a.status === st).length;
      items = [
        ["DESK"],
        ["dash", "Dashboard", dependencies.IC.home],
        ["appraisal", "Review & Approve", dependencies.IC.pen, cnt("appraisal") + cnt("approval")],
        ["esign", "Awaiting Bride & Groom eSign", dependencies.IC.tab],
        ["reverted", "Reverted", dependencies.IC.undo],
        ["issued", "Issued", dependencies.IC.doc],
        ["ACCOUNT"],
        ["profile", "eSign Profile", dependencies.IC.shield],
        ["enl-licence", "My licence and enlistment", dependencies.IC.doc],
      ];
      ({ title, sub, content } = dependencies.registrarPage(who, mine));
    }
    const cur = dependencies.UI.page[p];
    return `<aside id="sb" class="${dependencies.UI.sb ? "open" : ""}"><div class="sb-logo"><div class="mark" style="width:36px;height:36px;font-size:12px">${p === "registrar" ? "MR" : p === "esign" ? "eS" : "BD"}</div><div class="sb-nm">${p === "registrar" ? "Registrar Portal" : p === "esign" ? "eSign Portal" : "Marriage Registration"}<span>${p === "registrar" ? "Law and Justice Division" : p === "esign" ? "Bride & Groom" : "Applicant Account"}</span></div></div>
    <div class="sb-scrl">${items.map((it) => (it.length === 1 ? `<div class="sb-hd">${it[0]}</div>` : `<button class="sb-it ${cur === it[0] && (!dependencies.UI.open[p] || (p === "applicant" && String(it[0]).startsWith("esign"))) ? "on" : ""}" data-act="page" data-pg="${it[0]}">${it[2]}${it[1]}${it[3] ? `<span class="sb-bdg">${it[3]}</span>` : ""}</button>`)).join("")}</div>
    <div class="sb-bot"><div class="sb-usr"><div class="av">${dependencies.ini(name)}</div><div style="min-width:0"><div class="sb-uname">${dependencies.esc(name)}</div><div class="sb-urole">${dependencies.esc(role)}</div></div></div><button class="sb-out" data-act="logout">Sign out</button></div></aside>
    <div id="ov" class="${dependencies.UI.sb ? "open" : ""}" data-act="closesb"></div>
    <div id="main"><header id="tb"><button class="hamb" data-act="opensb" aria-label="Open menu">${dependencies.IC.menu}</button><div class="tb-title">${title}<span>${sub}</span></div><div class="tb-r"><div class="av" title="${dependencies.esc(name)}">${dependencies.ini(name)}</div></div></header><div class="content">${content}</div></div>`;
  }
  return { shell };
}
