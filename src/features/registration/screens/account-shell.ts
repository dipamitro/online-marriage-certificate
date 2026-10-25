import type { AnyDeps, ApplicationRecord } from "../types";

type SidebarNavItem =
  [sectionHeader: string] | [pageKey: string, label: string, iconHtml: string, badgeCount?: number];

/**
 * Renders the authenticated sidebar + topbar layout shell for the
 * `applicant`, `esign`, and `registrar` portals.
 *
 * Dependencies: `IC`, `PEOPLE`, `S`, `UI`, `accOf`, `applicantPage`, `esc`,
 * `esignPage`, `ini`, `regName`, `registrarPage`, `toEn`.
 */
export function createScreensAccountShell(dependencies: AnyDeps) {
  function shell(portalKey: string): string {
    const authenticatedUserId = dependencies.UI.auth[portalKey] ?? "";
    let userName = "";
    let userRoleLabel = "";
    let navItems: SidebarNavItem[] = [];
    let pageTitle = "";
    let pageSubtitle = "";
    let pageContentHtml = "";

    if (portalKey === "applicant") {
      const account = dependencies.accOf(authenticatedUserId);
      userName = account.name;
      userRoleLabel = account.role + " · Applicant";

      const myCreatedApps: ApplicationRecord[] = dependencies.S.apps.filter(
        (app: ApplicationRecord) => app.owner === authenticatedUserId,
      );
      const appsNamingMeAsSpouse: ApplicationRecord[] = dependencies.S.apps.filter(
        (app: ApplicationRecord) =>
          app.status !== "draft" &&
          (dependencies.toEn(app.f.groom.nid) === authenticatedUserId ||
            dependencies.toEn(app.f.bride.nid) === authenticatedUserId),
      );
      const pendingMyEsignApps = appsNamingMeAsSpouse.filter((app) => {
        const mySpouseRole =
          dependencies.toEn(app.f.groom.nid) === authenticatedUserId ? "groom" : "bride";
        return app.status === "esign" && !app.esign[mySpouseRole].sign;
      });

      const revertedCount = myCreatedApps.filter((app) => app.status === "reverted").length;

      navItems = [
        ["MAIN"],
        ["dash", "Dashboard", dependencies.IC.home],
        ["new", "New Application", dependencies.IC.plus],
        ["track", "Track Applications", dependencies.IC.list, revertedCount],
        ["MY ESIGN"],
        ["esignreq", "eSign Requests", dependencies.IC.tab, pendingMyEsignApps.length],
        ["esigndone", "Signed & Completed", dependencies.IC.check],
      ];

      dependencies.UI._mineE = appsNamingMeAsSpouse;
      dependencies.UI._pendE = pendingMyEsignApps;
      ({
        title: pageTitle,
        sub: pageSubtitle,
        content: pageContentHtml,
      } = dependencies.applicantPage(account, myCreatedApps));
    } else if (portalKey === "esign") {
      const person = dependencies.PEOPLE[authenticatedUserId];
      userName = person?.en ?? authenticatedUserId;
      userRoleLabel = "OneID verified citizen";

      const appsNamingMe: ApplicationRecord[] = dependencies.S.apps
        .filter(
          (app: ApplicationRecord) =>
            app.f.groom.nid === authenticatedUserId || app.f.bride.nid === authenticatedUserId,
        )
        .filter((app: ApplicationRecord) => app.status !== "draft");

      const pendingEsignApps = appsNamingMe.filter((app) => {
        const mySpouseRole = app.f.groom.nid === authenticatedUserId ? "groom" : "bride";
        return app.status === "esign" && !app.esign[mySpouseRole].sign;
      });

      navItems = [
        ["MY ESIGN"],
        ["dash", "eSign Requests", dependencies.IC.tab, pendingEsignApps.length],
        ["done", "Signed & Completed", dependencies.IC.check],
      ];

      ({
        title: pageTitle,
        sub: pageSubtitle,
        content: pageContentHtml,
      } = dependencies.esignPage(authenticatedUserId, appsNamingMe, pendingEsignApps));
    } else {
      userName = dependencies.regName(authenticatedUserId);
      userRoleLabel = "Marriage Registrar · " + authenticatedUserId;

      const assignedApps: ApplicationRecord[] = dependencies.S.apps.filter(
        (app: ApplicationRecord) =>
          app.f.registrar === authenticatedUserId && app.status !== "draft",
      );
      const countByStatus = (status: string) =>
        assignedApps.filter((app) => app.status === status).length;

      navItems = [
        ["DESK"],
        ["dash", "Dashboard", dependencies.IC.home],
        [
          "appraisal",
          "Review & Approve",
          dependencies.IC.pen,
          countByStatus("appraisal") + countByStatus("approval"),
        ],
        ["esign", "Awaiting Bride & Groom eSign", dependencies.IC.tab],
        ["reverted", "Reverted", dependencies.IC.undo],
        ["issued", "Issued", dependencies.IC.doc],
        ["ACCOUNT"],
        ["profile", "eSign Profile", dependencies.IC.shield],
        ["enl-licence", "My licence and enlistment", dependencies.IC.doc],
      ];

      ({
        title: pageTitle,
        sub: pageSubtitle,
        content: pageContentHtml,
      } = dependencies.registrarPage(authenticatedUserId, assignedApps));
    }

    const activePageKey = dependencies.UI.page[portalKey];
    const brandMark = portalKey === "registrar" ? "MR" : portalKey === "esign" ? "eS" : "BD";
    const brandTitle =
      portalKey === "registrar"
        ? "Registrar Portal"
        : portalKey === "esign"
          ? "eSign Portal"
          : "Marriage Registration";
    const brandSubtitle =
      portalKey === "registrar"
        ? "Law and Justice Division"
        : portalKey === "esign"
          ? "Bride & Groom"
          : "Applicant Account";

    const sidebarNavHtml = navItems
      .map((item) => {
        if (item.length === 1) {
          return `<div class="sb-hd">${item[0]}</div>`;
        }
        const [itemPageKey, itemLabel, itemIcon, badgeCount] = item;
        const isCurrentItem =
          activePageKey === itemPageKey &&
          (!dependencies.UI.open[portalKey] ||
            (portalKey === "applicant" && String(itemPageKey).startsWith("esign")));
        const badgeHtml = badgeCount ? `<span class="sb-bdg">${badgeCount}</span>` : "";

        return `
          <button class="sb-it ${isCurrentItem ? "on" : ""}" data-act="page" data-pg="${itemPageKey}">
            ${itemIcon}${itemLabel}${badgeHtml}
          </button>
        `;
      })
      .join("");

    return `
      <aside id="sb" class="${dependencies.UI.sb ? "open" : ""}">
        <div class="sb-logo">
          <div class="mark" style="width:36px;height:36px;font-size:12px">${brandMark}</div>
          <div class="sb-nm">${brandTitle}<span>${brandSubtitle}</span></div>
        </div>
        <div class="sb-scrl">${sidebarNavHtml}</div>
        <div class="sb-bot">
          <div class="sb-usr">
            <div class="av">${dependencies.ini(userName)}</div>
            <div style="min-width:0">
              <div class="sb-uname">${dependencies.esc(userName)}</div>
              <div class="sb-urole">${dependencies.esc(userRoleLabel)}</div>
            </div>
          </div>
          <button class="sb-out" data-act="logout">Sign out</button>
        </div>
      </aside>
      <div id="ov" class="${dependencies.UI.sb ? "open" : ""}" data-act="closesb"></div>
      <div id="main">
        <header id="tb">
          <button class="hamb" data-act="opensb" aria-label="Open menu">${dependencies.IC.menu}</button>
          <div class="tb-title">${pageTitle}<span>${pageSubtitle}</span></div>
          <div class="tb-r">
            <div class="av" title="${dependencies.esc(userName)}">${dependencies.ini(userName)}</div>
          </div>
        </header>
        <div class="content">${pageContentHtml}</div>
      </div>
    `;
  }

  return { shell };
}
