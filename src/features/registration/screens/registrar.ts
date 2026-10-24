import type { AnyDeps, ApplicationRecord } from "../types";

/** screens/registrar. Dependencies: IC, REGISTRARS, STATUS, UI, appById, appraisalChecks, certHTML, chip, docHTML, esc, fDT, flagsHTML, flowHTML, histHTML, idCard, regName, summaryHTML, tableHTML, toEn. */
export function createScreensRegistrar(dependencies: AnyDeps) {
  function registrarPage(
    lic: string,
    mine: ApplicationRecord[],
  ): { title: string; sub: string; content: string } {
    const open: ApplicationRecord | undefined =
        dependencies.UI.open.registrar && dependencies.appById(dependencies.UI.open.registrar),
      pg: string = dependencies.UI.page.registrar;
    if (open)
      return {
        title: "Application " + open.appNo,
        sub: dependencies.STATUS[open.status]?.[0] ?? "",
        content: registrarDetail(lic, open),
      };
    const by = (st: string) => mine.filter((a) => a.status === st);
    const map: Record<string, [string, string]> = {
      appraisal: ["Review & Approve", "Approve with eSign or revert"],
      approval: ["Approval with eSign", "eKYC, then eSign"],
      esign: ["Awaiting Bride & Groom eSign", "Not yet with you"],
      reverted: ["Reverted", "Sent back to applicant"],
      issued: ["Issued", "Digital Nikahnama generated"],
    };
    if (map[pg])
      return {
        title: map[pg][0],
        sub: map[pg][1],
        content: dependencies.tableHTML(
          pg === "appraisal"
            ? mine.filter((a) => ["appraisal", "approval"].includes(a.status))
            : by(pg),
          "registrar",
          [],
        ),
      };
    if (pg === "profile") {
      const R = dependencies.REGISTRARS[lic];
      return {
        title: "eSign Profile",
        sub: lic,
        content: `<div class="g2"><div class="card"><div class="chdr"><h3>Registrar</h3><span class="chip cg">Enlisted</span></div><div class="irow"><span>Name</span><span>${dependencies.esc(dependencies.regName(lic))}</span></div><div class="irow"><span>Licence</span><span>${lic}</span></div><div class="irow"><span>Jurisdiction</span><span class="bn">${dependencies.esc(R.wards.join(", "))}, ${dependencies.esc(R.uni === "সিটি কর্পোরেশন এলাকা" ? R.upz : R.uni)}</span></div><div class="irow"><span>Office</span><span class="bn">${dependencies.esc(R.office)}</span></div><div class="irow"><span>Email</span><span>${dependencies.esc(R.email)}</span></div></div>
      <div class="card"><div class="chdr"><h3>eSign certificate</h3><span class="chip cg">Valid</span></div><div class="irow"><span>Organization</span><span>Law &amp; Justice Division</span></div><div class="irow"><span>Country code</span><span>BD</span></div><div class="irow"><span>Issuer</span><span>Bangladesh eSign CA (demo)</span></div><div class="irow"><span>Approval rule</span><span>eKYC before every approval eSign</span></div></div></div>`,
      };
    }
    return {
      title: "Dashboard",
      sub: "Marriage Registrar Portal",
      content: `<div class="banner"><div><h2>Marriage Registrar Desk</h2><p>${dependencies.esc(dependencies.regName(lic))} · ${lic}</p></div><div class="pills2"><span class="go">Licensed Registrar</span><span class="gr">eSign Profile Active</span></div></div>
    <div class="sg"><div class="sc am"><div class="sl">Ready to approve</div><div class="sv">${by("appraisal").length + by("approval").length}</div><div class="ss">Bride &amp; groom signed</div></div><div class="sc pu"><div class="sl">Awaiting eSign</div><div class="sv">${by("esign").length}</div><div class="ss">Bride &amp; groom</div></div><div class="sc gr"><div class="sl">Issued</div><div class="sv">${by("issued").length}</div><div class="ss">Nikahnama generated</div></div></div>
    <div class="chdr"><h3>Needs your action</h3></div>${dependencies.tableHTML(
      mine.filter((a) => ["appraisal", "approval"].includes(a.status)),
      "registrar",
      [],
    )}
    <div class="chdr" style="margin-top:18px"><h3>All applications</h3></div>${dependencies.tableHTML(mine, "registrar", [])}`,
    };
  }
  function registrarDetail(_lic: string, a: ApplicationRecord): string {
    const below = a.status === "appraisal" || a.status === "approval";
    const s = a.status;
    let action = "";
    if (s === "appraisal" || s === "approval")
      action = `<div class="card" style="border-left:4px solid var(--pri)"><div class="chdr"><h3>Step 4 · Registrar Approval with eSign</h3><span class="chip cb">Bride &amp; groom signed</span></div><p style="color:var(--tx2);margin-bottom:12px">Review all information, then approve with your eSign to complete the registration. If there is any confusion or problem, revert it to the applicant.</p>${dependencies.flagsHTML(dependencies.appraisalChecks(a))}<div style="margin-top:14px">${dependencies.idCard(dependencies.REGISTRARS[a.f.registrar].nid)}</div>
    <p style="font-size:12.5px;color:var(--tx3);margin-top:6px">Approving generates the Digital Nikahnama and the Marriage Certificate, each with the VDS, and sends both directly to the bride's and groom's OneID Vault. Confirmed with a one-time SMS code; no eKYC needed, it was done at sign-up.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn bg" data-act="approve" data-id="${a.id}">${dependencies.IC.pen.replace("<svg", '<svg width="16" height="16"')} Approve with eSign &amp; send to OneID Vault</button><button class="btn br" data-act="revert" data-id="${a.id}">Revert to applicant</button></div></div>`;
    else if (s === "issued" && a.issued)
      action = a.vault
        ? `<div class="card" style="border-left:4px solid var(--g)"><div class="chdr"><h3>Step 5 · Sent to OneID Vault</h3><span class="chip cg">${dependencies.esc(a.issued.regNo)}</span></div><p>Digital Nikahnama and Marriage Certificate (SN ${dependencies.esc(a.cert ? a.cert.sn : "")}) delivered to the OneID Wallets of ${dependencies.esc(a.f.groom.nameEn)} and ${dependencies.esc(a.f.bride.nameEn)} on ${dependencies.fDT(a.vault.at)} (Documents Vault › Marriage Certificate).</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn bp" data-act="pdf" data-id="${a.id}">Nikahnama PDF</button><button class="btn bp" data-act="pdf" data-kind="cert" data-id="${a.id}">Marriage Certificate PDF</button><button class="btn bs" data-act="verifyapp" data-id="${a.id}">Verify</button></div></div>`
        : `<div class="card" style="border-left:4px solid var(--pri)"><div class="chdr"><h3>Step 5 · Send to Bride &amp; Groom OneID Vault</h3><span class="chip cb">${dependencies.esc(a.issued.regNo)}</span></div><p style="color:var(--tx2)">Your eSign is complete. Two documents have been generated, each with a VDS: the <b>Digital Nikahnama</b> and the <b>Marriage Certificate</b>. Send both to the bride's and groom's OneID Wallet, where they appear under Documents Vault › Marriage Certificate.</p>
      <div class="irow"><span>Groom: ${dependencies.esc(a.f.groom.nameEn)}</span><span>OneID ••••${dependencies.esc(dependencies.toEn(a.f.groom.nid).slice(-4))}</span></div><div class="irow"><span>Bride: ${dependencies.esc(a.f.bride.nameEn)}</span><span>OneID ••••${dependencies.esc(dependencies.toEn(a.f.bride.nid).slice(-4))}</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn bg" data-act="sendvault" data-id="${a.id}">${dependencies.IC.wallet.replace("<svg", '<svg width="16" height="16"')} Send to Bride &amp; Groom OneID Vault</button><button class="btn bs" data-act="pdf" data-id="${a.id}">Nikahnama PDF</button><button class="btn bs" data-act="pdf" data-kind="cert" data-id="${a.id}">Marriage Certificate PDF</button></div></div>`;
    else if (s === "esign")
      action = `<div class="card"><div class="chdr"><h3>Waiting for bride &amp; groom eSign</h3></div>${(["groom", "bride"] as const).map((k) => `<div class="irow"><span>${k === "groom" ? "Groom" : "Bride"}: ${dependencies.esc(a.f[k].nameEn)}</span><span>${a.esign[k].sign ? `<span class="chip cg">Signed</span>` : `<span class="chip ca">Pending</span>`}</span></div>`).join("")}</div>`;
    else if (s === "reverted")
      action = `<div class="card"><div class="chdr"><h3>Reverted to applicant</h3></div><p>${dependencies.esc(a.revertReason)}</p></div>`;
    return `<button class="btn bs" data-act="back" style="margin-bottom:14px">← Back</button>
    <div class="card"><div class="chdr"><h3>Progress</h3>${dependencies.chip(a)}</div>${dependencies.flowHTML(a)}</div>${below ? "" : action}
    <div class="g2" style="margin-top:14px"><div class="card"><div class="chdr"><h3>Summary</h3></div>${dependencies.summaryHTML(a)}</div><div class="card"><div class="chdr"><h3>History</h3></div>${dependencies.histHTML(a)}</div></div>
    <div class="card"><div class="chdr"><h3>Digital Nikahnama${below ? " (preview)" : ""}</h3></div><div class="dv">${dependencies.docHTML(a)}</div></div>${below ? `<div id="approve-step" style="margin-top:14px">${action}</div>` : ""}${a.cert ? `<div class="card"><div class="chdr"><h3>Marriage Certificate</h3><span class="chip cb">SN ${dependencies.esc(a.cert.sn)}</span></div><div class="dv">${dependencies.certHTML(a)}</div></div>` : ""}`;
  }
  return { registrarPage, registrarDetail };
}
