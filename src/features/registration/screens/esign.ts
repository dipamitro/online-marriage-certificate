import type { AnyDeps, ApplicationRecord } from "../types";

/**
 * Renders the Bride & Groom eSign Portal (`/esign`), allowing spouses to review
 * the Digital Nikahnama and accept it with their electronic signature.
 *
 * Dependencies: `IC`, `PEOPLE`, `STATUS`, `UI`, `appById`, `chip`, `coupleEn`,
 * `docHTML`, `esc`, `fDT`, `flowHTML`, `regName`, `stKey`, `summaryHTML`, `tableHTML`, `userOf`.
 */
export function createScreensEsign(dependencies: AnyDeps) {
  /**
   * Renders a verification badge showing when the user's OneID eKYC was completed.
   */
  function idCard(nid: string): string {
    const user = dependencies.userOf(nid);
    if (!user || !user.ekyc) {
      return "";
    }

    const shieldIconHtml = dependencies.IC.shield.replace(
      "<svg",
      '<svg width="15" height="15" style="vertical-align:-3px"',
    );

    return `
      <div class="irow" style="border:1px solid var(--bdr);border-radius:10px;padding:10px 12px;margin-bottom:6px;background:var(--pril)">
        <span>${shieldIconHtml} Identity verified by OneID eKYC at sign-up</span>
        <span>${dependencies.fDT(user.ekyc.at)} · face match ${user.ekyc.score.toFixed(1)}%</span>
      </div>
    `;
  }

  /**
   * Renders the eSign Requests dashboard or the Signed & Completed table.
   */
  function esignPage(
    signerNid: string,
    allAppsNamingSigner: ApplicationRecord[] = [],
    pendingEsignApps: ApplicationRecord[] = [],
  ): { title: string; sub: string; content: string } {
    const openedApplication: ApplicationRecord | undefined =
      dependencies.UI.open.esign && dependencies.appById(dependencies.UI.open.esign);

    if (openedApplication) {
      return {
        title: "Review & eSign",
        sub: openedApplication.appNo,
        content: esignDetail(signerNid, openedApplication),
      };
    }

    const person = dependencies.PEOPLE[signerNid];
    if (dependencies.UI.page.esign === "done") {
      const completedApps = allAppsNamingSigner.filter((app) => {
        const spouseRole = app.f.groom.nid === signerNid ? "groom" : "bride";
        return Boolean(app.esign[spouseRole].sign);
      });
      return {
        title: "Signed & Completed",
        sub: `${completedApps.length}`,
        content: dependencies.tableHTML(completedApps, "esign", ["reg"]),
      };
    }

    const firstName = dependencies.esc((person?.en ?? signerNid).split(" ")[0]);
    const pendingCardsHtml = pendingEsignApps.length
      ? pendingEsignApps
          .map((app) => {
            const spouseRoleLabel = app.f.groom.nid === signerNid ? "groom" : "bride";
            return `
              <div class="card" style="border-left:4px solid var(--pri)">
                <div class="chdr">
                  <div>
                    <h3>${dependencies.esc(dependencies.coupleEn(app))}</h3>
                    <p style="color:var(--tx3);font-size:12px">
                      ${dependencies.esc(app.appNo)} · Registrar ${dependencies.esc(dependencies.regName(app.f.registrar))} · submitted ${dependencies.fDT(app.submittedAt)}
                    </p>
                  </div>
                  ${dependencies.chip(app)}
                </div>
                <p style="color:var(--tx2)">
                  You are named as the <b>${spouseRoleLabel}</b>. Please review and eSign.
                </p>
                <div style="margin-top:12px">
                  <button class="btn bp" data-act="openapp" data-p="esign" data-id="${app.id}">Review &amp; eSign</button>
                </div>
              </div>
            `;
          })
          .join("")
      : `<div class="card empty">No eSign requests waiting for you.</div>`;

    return {
      title: "eSign Requests",
      sub: "Bride & Groom",
      content: `
        <div class="banner">
          <div>
            <h2>Assalamu Alaikum, ${firstName}</h2>
            <p>Review your marriage registration application, then accept with eSign. Your identity was verified by eKYC when you signed up.</p>
          </div>
          <div class="pills2">
            <span class="gr">OneID account</span>
            <span>NID ••••${signerNid.slice(-4)}</span>
          </div>
        </div>
        ${pendingCardsHtml}
        <div style="margin-top:18px">
          <div class="chdr"><h3>All applications naming you</h3></div>
          ${dependencies.tableHTML(allAppsNamingSigner, "esign", ["reg"])}
        </div>
      `,
    };
  }

  /**
   * Renders the two-step Groom/Bride review & eSign screen for a specific application.
   */
  function esignDetail(signerNid: string, application: ApplicationRecord): string {
    const spouseRole: "groom" | "bride" = application.f.groom.nid === signerNid ? "groom" : "bride";
    const signatureRecord = application.esign[spouseRole];
    const spouseFormInfo = application.f[spouseRole];

    const hasReviewedAndAccepted = Boolean(dependencies.UI.accept || signatureRecord.sign);
    const isApplicationOpenForEsign = application.status === "esign";

    const renderStepRow = (
      stepNumber: number,
      stateClass: string,
      title: string,
      description: string,
      actionHtml?: string,
    ): string => `
      <div class="estep ${stateClass}">
        <div class="en">${stateClass === "done" ? "✓" : stepNumber}</div>
        <div>
          <b>${title}</b>
          <small>${description}</small>
        </div>
        <div>${actionHtml || ""}</div>
      </div>
    `;

    const step1ActionHtml =
      !hasReviewedAndAccepted && isApplicationOpenForEsign
        ? `<div class="rad" style="margin:0"><label><input type="checkbox" data-accept="1"> I have reviewed the information and it is correct</label></div>`
        : "";

    const step2ActionHtml =
      !signatureRecord.sign && isApplicationOpenForEsign
        ? `<button class="btn bg" data-act="esign" data-who="${spouseRole}" data-id="${application.id}" ${hasReviewedAndAccepted ? "" : "disabled"}>eSign</button>`
        : "";

    const stepHeading =
      spouseRole === "groom" ? "Step 2 · Groom eSign (বর)" : "Step 3 · Bride eSign (কনে)";

    return `
      <button class="btn bs" data-act="back" style="margin-bottom:14px">← Back</button>
      <div class="card">
        <div class="chdr"><h3>Progress</h3>${dependencies.chip(application)}</div>
        ${dependencies.flowHTML(application)}
      </div>
      <div class="card">
        <div class="chdr">
          <h3>${stepHeading}</h3>
          ${signatureRecord.sign ? `<span class="chip cg">Signed ${dependencies.fDT(signatureRecord.sign.at)}</span>` : ""}
        </div>
        ${idCard(signerNid)}
        ${
          !isApplicationOpenForEsign && !signatureRecord.sign
            ? `<p class="err">This application isn't open for eSign right now (${dependencies.STATUS[dependencies.stKey(application)]?.[0] ?? ""}).</p>`
            : ""
        }
        ${renderStepRow(
          1,
          hasReviewedAndAccepted ? "done" : "now",
          "Review the information",
          "Read the full Digital Nikahnama preview below.",
          step1ActionHtml,
        )}
        ${renderStepRow(
          2,
          signatureRecord.sign ? "done" : hasReviewedAndAccepted ? "now" : "",
          "Accept with eSign",
          signatureRecord.sign
            ? `Certificate ${signatureRecord.sign.serial}`
            : "Confirmed with a one-time SMS code. No eKYC needed, it was done at sign-up.",
          step2ActionHtml,
        )}
      </div>
      <div class="card">
        <div class="chdr"><h3>Application details</h3></div>
        ${dependencies.summaryHTML(application)}
        <p style="margin-top:12px;color:var(--tx3);font-size:12px">
          Your contact on the application: ${dependencies.esc(spouseFormInfo.mobile)} · ${dependencies.esc(spouseFormInfo.email)}
        </p>
      </div>
      <div class="card">
        <div class="chdr"><h3>Digital Nikahnama (preview)</h3></div>
        <div class="dv">${dependencies.docHTML(application)}</div>
      </div>
    `;
  }

  return { esignPage, idCard, esignDetail };
}
