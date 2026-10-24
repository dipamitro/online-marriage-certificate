import type { AnyDeps, ApplicationRecord } from "../types";

/** screens/applicant. Dependencies: IC, STATUS, STEPS, UI, appById, certHTML, chip, docHTML, esc, esignPage, fDT, flowHTML, formPage, histHTML, stepDone, stepSub, summaryHTML, tableHTML. */
export function createScreensApplicant(dependencies: AnyDeps) {
  function applicantPage(
    acc: { id: string; name: string; email: string; role: string },
    mine: ApplicationRecord[],
  ): { title: string; sub: string; content: string } {
    const pg = dependencies.UI.page.applicant,
      open: ApplicationRecord | undefined =
        dependencies.UI.open.applicant && dependencies.appById(dependencies.UI.open.applicant);
    if (pg !== "new" && (pg === "esignreq" || pg === "esigndone" || dependencies.UI.open.esign)) {
      dependencies.UI.page.esign = pg === "esigndone" ? "done" : "dash";
      return dependencies.esignPage(acc.id, dependencies.UI._mineE, dependencies.UI._pendE);
    }
    if (pg === "new" && dependencies.UI.draft)
      return {
        title: "New Application",
        sub: "বিবাহ নিবন্ধনের আবেদন",
        content: dependencies.formPage(),
      };
    if (open)
      return {
        title: "Application " + open.appNo,
        sub: dependencies.STATUS[open.status]?.[0] ?? "",
        content: applicantDetail(open),
      };
    if (pg === "track")
      return {
        title: "Track Applications",
        sub: `${mine.length} total`,
        content: dependencies.tableHTML(mine, "applicant", []),
      };
    const c = (st: string[]) => mine.filter((a) => st.includes(a.status)).length;
    const nudge =
      dependencies.UI._pendE && dependencies.UI._pendE.length
        ? `<div class="card" style="border-left:4px solid var(--pri);margin-bottom:14px;display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3>You have ${dependencies.UI._pendE.length} eSign request${dependencies.UI._pendE.length > 1 ? "s" : ""}</h3><p style="color:var(--tx2);font-size:13px">A marriage registration application names you as the bride or groom.</p></div><button class="btn bp" data-act="page" data-pg="esignreq">Go to My eSign</button></div>`
        : "";
    return {
      title: "Dashboard",
      sub: "Applicant Portal",
      content:
        nudge +
        `<div class="banner"><div><h2>Welcome, ${dependencies.esc(acc.name.split(" ")[0])}</h2><p>Online Marriage Registration · Applicant Portal</p></div><div class="pills2"><span>${dependencies.esc(acc.role)}</span><span class="gr">OneID account</span></div></div>
    <div class="sg"><div class="sc"><div class="sl">Applications</div><div class="sv">${mine.length}</div><div class="ss">Total</div></div><div class="sc am"><div class="sl">Awaiting eSign</div><div class="sv">${c(["esign"])}</div><div class="ss">Bride &amp; groom</div></div><div class="sc pu"><div class="sl">With registrar</div><div class="sv">${c(["appraisal", "approval"])}</div><div class="ss">Appraisal or approval</div></div><div class="sc gr"><div class="sl">Issued</div><div class="sv">${c(["issued"])}</div><div class="ss">Digital Nikahnama</div></div></div>
    <div class="g2"><div class="card"><div class="chdr"><h3>Marriage registration</h3></div><p style="color:var(--tx2);margin-bottom:14px">Bride, groom or a representative fills in the application. After submitting, the bride and groom receive an email to complete eKYC and accept with eSign.</p><button class="btn bp bfw" data-act="newapp">${dependencies.IC.plus.replace("<svg", '<svg width="15" height="15"')} New marriage registration application</button></div>
    <div class="card"><div class="chdr"><h3>Process</h3></div>${(() => {
      const pool: ApplicationRecord[] = [
        ...mine,
        ...(dependencies.UI._mineE || []).filter((x: ApplicationRecord) => !mine.includes(x)),
      ].sort((p, q) =>
        String(q.submittedAt || q.createdAt || "").localeCompare(
          String(p.submittedAt || p.createdAt || ""),
        ),
      );
      const la = pool.find((x) => x.status !== "draft") || pool[0];
      return (
        (la
          ? `<p style="font-size:12px;color:var(--tx3);margin:-6px 0 6px">Latest application: ${dependencies.esc(la.appNo)}</p>`
          : "") +
        dependencies.STEPS.map(
          (s: [string, string, string], i: number) =>
            `<div class="irow"><span>${i + 1}. ${s[0]}</span><span style="color:${la && dependencies.stepDone(la, i) ? "var(--pri)" : "var(--tx3)"}">${la ? dependencies.stepSub(la, i) : s[1]}</span></div>`,
        ).join("")
      );
    })()}</div></div>
    <div style="margin-top:18px"><div class="chdr"><h3>My applications</h3></div>${dependencies.tableHTML(mine, "applicant", ["reg"])}</div>`,
    };
  }
  function applicantDetail(a: ApplicationRecord): string {
    const canEdit = ["draft", "reverted"].includes(a.status);
    return `<button class="btn bs" data-act="back" style="margin-bottom:14px">← Back</button>
    <div class="card"><div class="chdr"><h3>Progress</h3>${dependencies.chip(a)}</div>${dependencies.flowHTML(a)}</div>
    ${a.status === "reverted" ? `<div class="card" style="border-left:4px solid var(--r)"><div class="chdr"><h3>Reverted by the registrar</h3></div><p>${dependencies.esc(a.revertReason)}</p><div style="margin-top:12px"><button class="btn bp" data-act="editapp" data-id="${a.id}">Edit and resubmit</button></div></div>` : ""}
    ${a.status === "draft" ? `<div class="card"><div class="chdr"><h3>Draft</h3></div><button class="btn bp" data-act="editapp" data-id="${a.id}">Continue editing</button></div>` : ""}
    ${a.status === "esign" ? `<div class="card"><div class="chdr"><h3>Waiting for bride &amp; groom eSign</h3></div>${(["groom", "bride"] as const).map((k) => `<div class="irow"><span>${k === "groom" ? "Groom" : "Bride"}: ${dependencies.esc(a.f[k].nameEn)} (${dependencies.esc(a.f[k].email)})</span><span>${a.esign[k].sign ? `<span class="chip cg">eSigned</span>` : `<span class="chip ca">Pending</span>`}</span></div>`).join("")}<div style="margin-top:12px"><button class="btn bs" data-act="resendesign" data-id="${a.id}">Resend eSign emails</button></div></div>` : ""}
    ${a.status === "issued" && a.issued ? `<div class="card"><div class="chdr"><h3>${a.vault ? "Sent to OneID Vault" : "Approved by the registrar"}</h3>${dependencies.chip(a)}</div><p>Registration ${dependencies.esc(a.issued.regNo)} · ${a.vault ? `delivered to the bride's and groom's OneID Wallet on ${dependencies.fDT(a.vault.at)}` : "the registrar will now send it to the bride's and groom's OneID Vault"}.</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn bp" data-act="pdf" data-id="${a.id}">Nikahnama PDF</button>${a.cert ? `<button class="btn bp" data-act="pdf" data-kind="cert" data-id="${a.id}">Marriage Certificate PDF</button>` : ""}<button class="btn bs" data-act="verifyapp" data-id="${a.id}">Verify</button></div></div>` : ""}
    <div class="g2" style="margin-top:14px"><div class="card"><div class="chdr"><h3>Summary</h3></div>${dependencies.summaryHTML(a)}</div><div class="card"><div class="chdr"><h3>History</h3></div>${dependencies.histHTML(a)}</div></div>
    <div class="card"><div class="chdr"><h3>Digital Nikahnama ${a.status === "issued" ? "" : "(preview)"}</h3>${canEdit ? `<button class="btn bs" data-act="editapp" data-id="${a.id}">Edit</button>` : ""}</div><div class="dv">${dependencies.docHTML(a)}</div></div>${a.cert ? `<div class="card"><div class="chdr"><h3>Marriage Certificate</h3><span class="chip cb">SN ${dependencies.esc(a.cert.sn)}</span></div><div class="dv">${dependencies.certHTML(a)}</div></div>` : ""}`;
  }
  return { applicantPage, applicantDetail };
}
