import type { AnyDeps, ApplicationRecord } from "../types";

/** screens/esign. Dependencies: IC, PEOPLE, STATUS, UI, appById, chip, coupleEn, docHTML, esc, fDT, flowHTML, regName, stKey, summaryHTML, tableHTML, userOf. */
export function createScreensEsign(dependencies: AnyDeps) {
  function esignPage(
    who: string,
    mine: ApplicationRecord[] = [],
    pend: ApplicationRecord[] = [],
  ): { title: string; sub: string; content: string } {
    const open: ApplicationRecord | undefined =
      dependencies.UI.open.esign && dependencies.appById(dependencies.UI.open.esign);
    if (open) return { title: "Review & eSign", sub: open.appNo, content: esignDetail(who, open) };
    const P = dependencies.PEOPLE[who];
    if (dependencies.UI.page.esign === "done") {
      const done = mine.filter((a) => a.esign[a.f.groom.nid === who ? "groom" : "bride"].sign);
      return {
        title: "Signed & Completed",
        sub: `${done.length}`,
        content: dependencies.tableHTML(done, "esign", ["reg"]),
      };
    }
    return {
      title: "eSign Requests",
      sub: "Bride & Groom",
      content: `<div class="banner"><div><h2>Assalamu Alaikum, ${dependencies.esc((P?.en ?? who).split(" ")[0])}</h2><p>Review your marriage registration application, then accept with eSign. Your identity was verified by eKYC when you signed up.</p></div><div class="pills2"><span class="gr">OneID account</span><span>NID ••••${who.slice(-4)}</span></div></div>
    ${pend.length ? pend.map((a) => `<div class="card" style="border-left:4px solid var(--pri)"><div class="chdr"><div><h3>${dependencies.esc(dependencies.coupleEn(a))}</h3><p style="color:var(--tx3);font-size:12px">${dependencies.esc(a.appNo)} · Registrar ${dependencies.esc(dependencies.regName(a.f.registrar))} · submitted ${dependencies.fDT(a.submittedAt)}</p></div>${dependencies.chip(a)}</div><p style="color:var(--tx2)">You are named as the <b>${a.f.groom.nid === who ? "groom" : "bride"}</b>. Please review and eSign.</p><div style="margin-top:12px"><button class="btn bp" data-act="openapp" data-p="esign" data-id="${a.id}">Review &amp; eSign</button></div></div>`).join("") : `<div class="card empty">No eSign requests waiting for you.</div>`}
    <div style="margin-top:18px"><div class="chdr"><h3>All applications naming you</h3></div>${dependencies.tableHTML(mine, "esign", ["reg"])}</div>`,
    };
  }
  function idCard(nid: string): string {
    const u = dependencies.userOf(nid);
    return u && u.ekyc
      ? `<div class="irow" style="border:1px solid var(--bdr);border-radius:10px;padding:10px 12px;margin-bottom:6px;background:var(--pril)"><span>${dependencies.IC.shield.replace("<svg", '<svg width="15" height="15" style="vertical-align:-3px"')} Identity verified by OneID eKYC at sign-up</span><span>${dependencies.fDT(u.ekyc.at)} · face match ${u.ekyc.score.toFixed(1)}%</span></div>`
      : "";
  }
  function esignDetail(who: string, a: ApplicationRecord): string {
    const k = a.f.groom.nid === who ? "groom" : "bride",
      rec = a.esign[k],
      me = a.f[k];
    const accepted = !!dependencies.UI.accept || !!rec.sign;
    const canAct = a.status === "esign";
    const step = (n: number, state: string, title: string, desc: string, action?: string) =>
      `<div class="estep ${state}"><div class="en">${state === "done" ? "✓" : n}</div><div><b>${title}</b><small>${desc}</small></div><div>${action || ""}</div></div>`;
    return `<button class="btn bs" data-act="back" style="margin-bottom:14px">← Back</button>
    <div class="card"><div class="chdr"><h3>Progress</h3>${dependencies.chip(a)}</div>${dependencies.flowHTML(a)}</div>
    <div class="card"><div class="chdr"><h3>${k === "groom" ? "Step 2 · Groom eSign (বর)" : "Step 3 · Bride eSign (কনে)"}</h3>${rec.sign ? `<span class="chip cg">Signed ${dependencies.fDT(rec.sign.at)}</span>` : ""}</div>
      ${idCard(who)}
      ${!canAct && !rec.sign ? `<p class="err">This application isn't open for eSign right now (${dependencies.STATUS[dependencies.stKey(a)]?.[0] ?? ""}).</p>` : ""}
      ${step(1, accepted ? "done" : "now", "Review the information", "Read the full Digital Nikahnama preview below.", !accepted && canAct ? `<div class="rad" style="margin:0"><label><input type="checkbox" data-accept="1"> I have reviewed the information and it is correct</label></div>` : "")}
      ${step(2, rec.sign ? "done" : accepted ? "now" : "", "Accept with eSign", rec.sign ? `Certificate ${rec.sign.serial}` : "Confirmed with a one-time SMS code. No eKYC needed, it was done at sign-up.", !rec.sign && canAct ? `<button class="btn bg" data-act="esign" data-who="${k}" data-id="${a.id}" ${accepted ? "" : "disabled"}>eSign</button>` : "")}
    </div>
    <div class="card"><div class="chdr"><h3>Application details</h3></div>${dependencies.summaryHTML(a)}<p style="margin-top:12px;color:var(--tx3);font-size:12px">Your contact on the application: ${dependencies.esc(me.mobile)} · ${dependencies.esc(me.email)}</p></div>
    <div class="card"><div class="chdr"><h3>Digital Nikahnama (preview)</h3></div><div class="dv">${dependencies.docHTML(a)}</div></div>`;
  }
  return { esignPage, idCard, esignDetail };
}
