import type { AnyDeps, ApplicationRecord } from "../types";

/**
 * Page header titles and subtitles for the Registrar Desk sidebar views.
 */
const REGISTRAR_FILTER_HEADERS: Record<string, [title: string, subtitle: string]> = {
  appraisal: ["Review & Approve", "Approve with eSign or revert"],
  approval: ["Approval with eSign", "eKYC, then eSign"],
  esign: ["Awaiting Bride & Groom eSign", "Not yet with you"],
  reverted: ["Reverted", "Sent back to applicant"],
  issued: ["Issued", "Digital Nikahnama generated"],
};

/**
 * Renders the Marriage Registrar Desk (`/registrar`), including the registrar dashboard,
 * application review & eSign approval screen, and registrar eSign profile.
 *
 * Dependencies: `IC`, `REGISTRARS`, `STATUS`, `UI`, `appById`, `appraisalChecks`, `certHTML`,
 * `chip`, `docHTML`, `esc`, `fDT`, `flagsHTML`, `flowHTML`, `histHTML`, `idCard`, `regName`,
 * `summaryHTML`, `tableHTML`, `toEn`.
 */
export function createScreensRegistrar(dependencies: AnyDeps) {
  /**
   * Renders the active sub-page inside the Marriage Registrar Portal.
   */
  function registrarPage(
    licenceNo: string,
    assignedApplications: ApplicationRecord[],
  ): { title: string; sub: string; content: string } {
    const openedApplication: ApplicationRecord | undefined =
      dependencies.UI.open.registrar && dependencies.appById(dependencies.UI.open.registrar);
    const activePage: string = dependencies.UI.page.registrar;

    if (openedApplication) {
      return {
        title: "Application " + openedApplication.appNo,
        sub: dependencies.STATUS[openedApplication.status]?.[0] ?? "",
        content: registrarDetail(licenceNo, openedApplication),
      };
    }

    const filterByStatus = (status: string) =>
      assignedApplications.filter((app) => app.status === status);

    if (REGISTRAR_FILTER_HEADERS[activePage]) {
      const [headerTitle, headerSubtitle] = REGISTRAR_FILTER_HEADERS[activePage]!;
      const filteredApps =
        activePage === "appraisal"
          ? assignedApplications.filter((app) => ["appraisal", "approval"].includes(app.status))
          : filterByStatus(activePage);

      return {
        title: headerTitle,
        sub: headerSubtitle,
        content: dependencies.tableHTML(filteredApps, "registrar", []),
      };
    }

    if (activePage === "profile") {
      const registrarRecord = dependencies.REGISTRARS[licenceNo];
      const unionOrUpazila =
        registrarRecord.uni === "সিটি কর্পোরেশন এলাকা" ? registrarRecord.upz : registrarRecord.uni;

      return {
        title: "eSign Profile",
        sub: licenceNo,
        content: `
          <div class="g2">
            <div class="card">
              <div class="chdr"><h3>Registrar</h3><span class="chip cg">Enlisted</span></div>
              <div class="irow"><span>Name</span><span>${dependencies.esc(dependencies.regName(licenceNo))}</span></div>
              <div class="irow"><span>Licence</span><span>${licenceNo}</span></div>
              <div class="irow"><span>Jurisdiction</span><span class="bn">${dependencies.esc(registrarRecord.wards.join(", "))}, ${dependencies.esc(unionOrUpazila)}</span></div>
              <div class="irow"><span>Office</span><span class="bn">${dependencies.esc(registrarRecord.office)}</span></div>
              <div class="irow"><span>Email</span><span>${dependencies.esc(registrarRecord.email)}</span></div>
            </div>
            <div class="card">
              <div class="chdr"><h3>eSign certificate</h3><span class="chip cg">Valid</span></div>
              <div class="irow"><span>Organization</span><span>Law &amp; Justice Division</span></div>
              <div class="irow"><span>Country code</span><span>BD</span></div>
              <div class="irow"><span>Issuer</span><span>Bangladesh eSign CA (demo)</span></div>
              <div class="irow"><span>Approval rule</span><span>eKYC before every approval eSign</span></div>
            </div>
          </div>
        `,
      };
    }

    const readyToApproveApps = assignedApplications.filter((app) =>
      ["appraisal", "approval"].includes(app.status),
    );

    return {
      title: "Dashboard",
      sub: "Marriage Registrar Portal",
      content: `
        <div class="banner">
          <div>
            <h2>Marriage Registrar Desk</h2>
            <p>${dependencies.esc(dependencies.regName(licenceNo))} · ${licenceNo}</p>
          </div>
          <div class="pills2">
            <span class="go">Licensed Registrar</span>
            <span class="gr">eSign Profile Active</span>
          </div>
        </div>
        <div class="sg">
          <div class="sc am">
            <div class="sl">Ready to approve</div>
            <div class="sv">${readyToApproveApps.length}</div>
            <div class="ss">Bride &amp; groom signed</div>
          </div>
          <div class="sc pu">
            <div class="sl">Awaiting eSign</div>
            <div class="sv">${filterByStatus("esign").length}</div>
            <div class="ss">Bride &amp; groom</div>
          </div>
          <div class="sc gr">
            <div class="sl">Issued</div>
            <div class="sv">${filterByStatus("issued").length}</div>
            <div class="ss">Nikahnama generated</div>
          </div>
        </div>
        <div class="chdr"><h3>Needs your action</h3></div>
        ${dependencies.tableHTML(readyToApproveApps, "registrar", [])}
        <div class="chdr" style="margin-top:18px"><h3>All applications</h3></div>
        ${dependencies.tableHTML(assignedApplications, "registrar", [])}
      `,
    };
  }

  /**
   * Renders the Registrar's review, appraisal checklist, and eSign approval view for an application.
   */
  function registrarDetail(_licenceNo: string, application: ApplicationRecord): string {
    const status = application.status;
    const placeActionCardBelowPreview = status === "appraisal" || status === "approval";
    let actionCardHtml = "";

    if (status === "appraisal" || status === "approval") {
      const registrarNid = dependencies.REGISTRARS[application.f.registrar].nid;
      const penIconHtml = dependencies.IC.pen.replace("<svg", '<svg width="16" height="16"');

      actionCardHtml = `
        <div class="card" style="border-left:4px solid var(--pri)">
          <div class="chdr">
            <h3>Step 4 · Registrar Approval with eSign</h3>
            <span class="chip cb">Bride &amp; groom signed</span>
          </div>
          <p style="color:var(--tx2);margin-bottom:12px">
            Review all information, then approve with your eSign to complete the registration. If there is any confusion or problem, revert it to the applicant.
          </p>
          ${dependencies.flagsHTML(dependencies.appraisalChecks(application))}
          <div style="margin-top:14px">${dependencies.idCard(registrarNid)}</div>
          <p style="font-size:12.5px;color:var(--tx3);margin-top:6px">
            Approving generates the Digital Nikahnama and the Marriage Certificate, each with the VDS, and sends both directly to the bride's and groom's OneID Vault. Confirmed with a one-time SMS code; no eKYC needed, it was done at sign-up.
          </p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
            <button class="btn bg" data-act="approve" data-id="${application.id}">
              ${penIconHtml} Approve with eSign &amp; send to OneID Vault
            </button>
            <button class="btn br" data-act="revert" data-id="${application.id}">Revert to applicant</button>
          </div>
        </div>
      `;
    } else if (status === "issued" && application.issued) {
      if (application.vault) {
        actionCardHtml = `
          <div class="card" style="border-left:4px solid var(--g)">
            <div class="chdr">
              <h3>Step 5 · Sent to OneID Vault</h3>
              <span class="chip cg">${dependencies.esc(application.issued.regNo)}</span>
            </div>
            <p>
              Digital Nikahnama and Marriage Certificate (SN ${dependencies.esc(application.cert ? application.cert.sn : "")})
              delivered to the OneID Wallets of ${dependencies.esc(application.f.groom.nameEn)} and
              ${dependencies.esc(application.f.bride.nameEn)} on ${dependencies.fDT(application.vault.at)}
              (Documents Vault › Marriage Certificate).
            </p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
              <button class="btn bp" data-act="pdf" data-id="${application.id}">Nikahnama PDF</button>
              <button class="btn bp" data-act="pdf" data-kind="cert" data-id="${application.id}">Marriage Certificate PDF</button>
              <button class="btn bs" data-act="verifyapp" data-id="${application.id}">Verify</button>
            </div>
          </div>
        `;
      } else {
        const walletIconHtml = dependencies.IC.wallet.replace(
          "<svg",
          '<svg width="16" height="16"',
        );
        const groomLastFourNid = dependencies.esc(
          dependencies.toEn(application.f.groom.nid).slice(-4),
        );
        const brideLastFourNid = dependencies.esc(
          dependencies.toEn(application.f.bride.nid).slice(-4),
        );

        actionCardHtml = `
          <div class="card" style="border-left:4px solid var(--pri)">
            <div class="chdr">
              <h3>Step 5 · Send to Bride &amp; Groom OneID Vault</h3>
              <span class="chip cb">${dependencies.esc(application.issued.regNo)}</span>
            </div>
            <p style="color:var(--tx2)">
              Your eSign is complete. Two documents have been generated, each with a VDS: the <b>Digital Nikahnama</b> and the <b>Marriage Certificate</b>. Send both to the bride's and groom's OneID Wallet, where they appear under Documents Vault › Marriage Certificate.
            </p>
            <div class="irow">
              <span>Groom: ${dependencies.esc(application.f.groom.nameEn)}</span>
              <span>OneID ••••${groomLastFourNid}</span>
            </div>
            <div class="irow">
              <span>Bride: ${dependencies.esc(application.f.bride.nameEn)}</span>
              <span>OneID ••••${brideLastFourNid}</span>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
              <button class="btn bg" data-act="sendvault" data-id="${application.id}">
                ${walletIconHtml} Send to Bride &amp; Groom OneID Vault
              </button>
              <button class="btn bs" data-act="pdf" data-id="${application.id}">Nikahnama PDF</button>
              <button class="btn bs" data-act="pdf" data-kind="cert" data-id="${application.id}">Marriage Certificate PDF</button>
            </div>
          </div>
        `;
      }
    } else if (status === "esign") {
      actionCardHtml = `
        <div class="card">
          <div class="chdr"><h3>Waiting for bride &amp; groom eSign</h3></div>
          ${(["groom", "bride"] as const)
            .map((spouseKey) => {
              const label = spouseKey === "groom" ? "Groom" : "Bride";
              const isSigned = Boolean(application.esign[spouseKey].sign);
              return `
                <div class="irow">
                  <span>${label}: ${dependencies.esc(application.f[spouseKey].nameEn)}</span>
                  <span>${isSigned ? `<span class="chip cg">Signed</span>` : `<span class="chip ca">Pending</span>`}</span>
                </div>
              `;
            })
            .join("")}
        </div>
      `;
    } else if (status === "reverted") {
      actionCardHtml = `
        <div class="card">
          <div class="chdr"><h3>Reverted to applicant</h3></div>
          <p>${dependencies.esc(application.revertReason)}</p>
        </div>
      `;
    }

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
      ${placeActionCardBelowPreview ? "" : actionCardHtml}
      <div class="g2" style="margin-top:14px">
        <div class="card"><div class="chdr"><h3>Summary</h3></div>${dependencies.summaryHTML(application)}</div>
        <div class="card"><div class="chdr"><h3>History</h3></div>${dependencies.histHTML(application)}</div>
      </div>
      <div class="card">
        <div class="chdr"><h3>Digital Nikahnama${placeActionCardBelowPreview ? " (preview)" : ""}</h3></div>
        <div class="dv">${dependencies.docHTML(application)}</div>
      </div>
      ${placeActionCardBelowPreview ? `<div id="approve-step" style="margin-top:14px">${actionCardHtml}</div>` : ""}
      ${certificatePreviewHtml}
    `;
  }

  return { registrarPage, registrarDetail };
}
