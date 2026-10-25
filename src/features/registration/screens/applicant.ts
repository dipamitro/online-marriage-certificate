import type { AnyDeps, ApplicationRecord } from "../types";

/**
 * Renders the Marriage Registration Applicant Portal (`/applicant`),
 * including the applicant dashboard, application tracking table, and application detail view.
 *
 * Dependencies: `IC`, `STATUS`, `STEPS`, `UI`, `appById`, `certHTML`, `chip`, `docHTML`,
 * `esc`, `esignPage`, `fDT`, `flowHTML`, `formPage`, `histHTML`, `stepDone`, `stepSub`,
 * `summaryHTML`, `tableHTML`.
 */
export function createScreensApplicant(dependencies: AnyDeps) {
  /**
   * Renders the active sub-page inside the Applicant Portal (`dash`, `new`, `track`, `esignreq`, `esigndone`).
   */
  function applicantPage(
    account: { id: string; name: string; email: string; role: string },
    myApplications: ApplicationRecord[],
  ): { title: string; sub: string; content: string } {
    const activePage = dependencies.UI.page.applicant;
    const openedApplication: ApplicationRecord | undefined =
      dependencies.UI.open.applicant && dependencies.appById(dependencies.UI.open.applicant);

    // Delegate to the embedded eSign view when viewing "My eSign" tabs
    if (
      activePage !== "new" &&
      (activePage === "esignreq" || activePage === "esigndone" || dependencies.UI.open.esign)
    ) {
      dependencies.UI.page.esign = activePage === "esigndone" ? "done" : "dash";
      return dependencies.esignPage(account.id, dependencies.UI._mineE, dependencies.UI._pendE);
    }

    // 7-step Marriage Registration Application Form
    if (activePage === "new" && dependencies.UI.draft) {
      return {
        title: "New Application",
        sub: "বিবাহ নিবন্ধনের আবেদন",
        content: dependencies.formPage(),
      };
    }

    // Single application detail view
    if (openedApplication) {
      return {
        title: "Application " + openedApplication.appNo,
        sub: dependencies.STATUS[openedApplication.status]?.[0] ?? "",
        content: applicantDetail(openedApplication),
      };
    }

    // Track all applications table
    if (activePage === "track") {
      return {
        title: "Track Applications",
        sub: `${myApplications.length} total`,
        content: dependencies.tableHTML(myApplications, "applicant", []),
      };
    }

    // Applicant Dashboard
    const countByStatuses = (statuses: string[]) =>
      myApplications.filter((app) => statuses.includes(app.status)).length;

    const pendingEsignCount = dependencies.UI._pendE?.length ?? 0;
    const esignNudgeBannerHtml = pendingEsignCount
      ? `
        <div class="card" style="border-left:4px solid var(--pri);margin-bottom:14px;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
          <div>
            <h3>You have ${pendingEsignCount} eSign request${pendingEsignCount > 1 ? "s" : ""}</h3>
            <p style="color:var(--tx2);font-size:13px">A marriage registration application names you as the bride or groom.</p>
          </div>
          <button class="btn bp" data-act="page" data-pg="esignreq">Go to My eSign</button>
        </div>
      `
      : "";

    const processProgressRowsHtml = (() => {
      const combinedPool: ApplicationRecord[] = [
        ...myApplications,
        ...(dependencies.UI._mineE || []).filter(
          (app: ApplicationRecord) => !myApplications.includes(app),
        ),
      ].sort((first, second) =>
        String(second.submittedAt || second.createdAt || "").localeCompare(
          String(first.submittedAt || first.createdAt || ""),
        ),
      );

      const latestApp = combinedPool.find((app) => app.status !== "draft") || combinedPool[0];

      const latestAppHeading = latestApp
        ? `<p style="font-size:12px;color:var(--tx3);margin:-6px 0 6px">Latest application: ${dependencies.esc(latestApp.appNo)}</p>`
        : "";

      const stepRows = dependencies.STEPS.map(
        (stepTuple: [string, string, string], index: number) => {
          const isStepCompleted = latestApp && dependencies.stepDone(latestApp, index);
          const statusColor = isStepCompleted ? "var(--pri)" : "var(--tx3)";
          const statusText = latestApp ? dependencies.stepSub(latestApp, index) : stepTuple[1];

          return `
            <div class="irow">
              <span>${index + 1}. ${stepTuple[0]}</span>
              <span style="color:${statusColor}">${statusText}</span>
            </div>
          `;
        },
      ).join("");

      return latestAppHeading + stepRows;
    })();

    const firstName = dependencies.esc(account.name.split(" ")[0]);
    const plusIconHtml = dependencies.IC.plus.replace("<svg", '<svg width="15" height="15"');

    return {
      title: "Dashboard",
      sub: "Applicant Portal",
      content: `
        ${esignNudgeBannerHtml}
        <div class="banner">
          <div>
            <h2>Welcome, ${firstName}</h2>
            <p>Online Marriage Registration · Applicant Portal</p>
          </div>
          <div class="pills2">
            <span>${dependencies.esc(account.role)}</span>
            <span class="gr">OneID account</span>
          </div>
        </div>
        <div class="sg">
          <div class="sc">
            <div class="sl">Applications</div>
            <div class="sv">${myApplications.length}</div>
            <div class="ss">Total</div>
          </div>
          <div class="sc am">
            <div class="sl">Awaiting eSign</div>
            <div class="sv">${countByStatuses(["esign"])}</div>
            <div class="ss">Bride &amp; groom</div>
          </div>
          <div class="sc pu">
            <div class="sl">With registrar</div>
            <div class="sv">${countByStatuses(["appraisal", "approval"])}</div>
            <div class="ss">Appraisal or approval</div>
          </div>
          <div class="sc gr">
            <div class="sl">Issued</div>
            <div class="sv">${countByStatuses(["issued"])}</div>
            <div class="ss">Digital Nikahnama</div>
          </div>
        </div>
        <div class="g2">
          <div class="card">
            <div class="chdr"><h3>Marriage registration</h3></div>
            <p style="color:var(--tx2);margin-bottom:14px">
              Bride, groom or a representative fills in the application. After submitting, the bride and groom receive an email to complete eKYC and accept with eSign.
            </p>
            <button class="btn bp bfw" data-act="newapp">
              ${plusIconHtml} New marriage registration application
            </button>
          </div>
          <div class="card">
            <div class="chdr"><h3>Process</h3></div>
            ${processProgressRowsHtml}
          </div>
        </div>
        <div style="margin-top:18px">
          <div class="chdr"><h3>My applications</h3></div>
          ${dependencies.tableHTML(myApplications, "applicant", ["reg"])}
        </div>
      `,
    };
  }

  /**
   * Renders the detailed view of a single marriage registration application for the applicant.
   */
  function applicantDetail(application: ApplicationRecord): string {
    const canEdit = ["draft", "reverted"].includes(application.status);

    const revertedBannerHtml =
      application.status === "reverted"
        ? `
          <div class="card" style="border-left:4px solid var(--r)">
            <div class="chdr"><h3>Reverted by the registrar</h3></div>
            <p>${dependencies.esc(application.revertReason)}</p>
            <div style="margin-top:12px">
              <button class="btn bp" data-act="editapp" data-id="${application.id}">Edit and resubmit</button>
            </div>
          </div>
        `
        : "";

    const draftBannerHtml =
      application.status === "draft"
        ? `
          <div class="card">
            <div class="chdr"><h3>Draft</h3></div>
            <button class="btn bp" data-act="editapp" data-id="${application.id}">Continue editing</button>
          </div>
        `
        : "";

    const esignStatusBannerHtml =
      application.status === "esign"
        ? `
          <div class="card">
            <div class="chdr"><h3>Waiting for bride &amp; groom eSign</h3></div>
            ${(["groom", "bride"] as const)
              .map((spouseKey) => {
                const label = spouseKey === "groom" ? "Groom" : "Bride";
                const spouse = application.f[spouseKey];
                const isSigned = Boolean(application.esign[spouseKey].sign);
                return `
                  <div class="irow">
                    <span>${label}: ${dependencies.esc(spouse.nameEn)} (${dependencies.esc(spouse.email)})</span>
                    <span>${isSigned ? `<span class="chip cg">eSigned</span>` : `<span class="chip ca">Pending</span>`}</span>
                  </div>
                `;
              })
              .join("")}
            <div style="margin-top:12px">
              <button class="btn bs" data-act="resendesign" data-id="${application.id}">Resend eSign emails</button>
            </div>
          </div>
        `
        : "";

    const issuedBannerHtml =
      application.status === "issued" && application.issued
        ? `
          <div class="card">
            <div class="chdr">
              <h3>${application.vault ? "Sent to OneID Vault" : "Approved by the registrar"}</h3>
              ${dependencies.chip(application)}
            </div>
            <p>
              Registration ${dependencies.esc(application.issued.regNo)} ·
              ${
                application.vault
                  ? `delivered to the bride's and groom's OneID Wallet on ${dependencies.fDT(application.vault.at)}`
                  : "the registrar will now send it to the bride's and groom's OneID Vault"
              }.
            </p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
              <button class="btn bp" data-act="pdf" data-id="${application.id}">Nikahnama PDF</button>
              ${application.cert ? `<button class="btn bp" data-act="pdf" data-kind="cert" data-id="${application.id}">Marriage Certificate PDF</button>` : ""}
              <button class="btn bs" data-act="verifyapp" data-id="${application.id}">Verify</button>
            </div>
          </div>
        `
        : "";

    const certificatePreviewHtml = application.cert
      ? `
        <div class="card">
          <div class="chdr">
            <h3>Marriage Certificate</h3>
            <span class="chip cb">SN ${dependencies.esc(application.cert.sn)}</span>
          </div>
          <div class="dv">${dependencies.certHTML(application)}</div>
        </div>
      `
      : "";

    return `
      <button class="btn bs" data-act="back" style="margin-bottom:14px">← Back</button>
      <div class="card">
        <div class="chdr"><h3>Progress</h3>${dependencies.chip(application)}</div>
        ${dependencies.flowHTML(application)}
      </div>
      ${revertedBannerHtml}
      ${draftBannerHtml}
      ${esignStatusBannerHtml}
      ${issuedBannerHtml}
      <div class="g2" style="margin-top:14px">
        <div class="card"><div class="chdr"><h3>Summary</h3></div>${dependencies.summaryHTML(application)}</div>
        <div class="card"><div class="chdr"><h3>History</h3></div>${dependencies.histHTML(application)}</div>
      </div>
      <div class="card">
        <div class="chdr">
          <h3>Digital Nikahnama ${application.status === "issued" ? "" : "(preview)"}</h3>
          ${canEdit ? `<button class="btn bs" data-act="editapp" data-id="${application.id}">Edit</button>` : ""}
        </div>
        <div class="dv">${dependencies.docHTML(application)}</div>
      </div>
      ${certificatePreviewHtml}
    `;
  }

  return { applicantPage, applicantDetail };
}
