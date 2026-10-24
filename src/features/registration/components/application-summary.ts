import type { AnyDeps, ApplicationRecord } from "../types";

/** components/application-summary. Dependencies: IC, STEPS, chip, coupleEn, esc, fD, fDT, fee, inr, regName, toEn. */
export function createComponentsApplicationSummary(dependencies: AnyDeps) {
  function stepDone(a: ApplicationRecord, i: number): boolean {
    const st = a.status,
      act = st !== "draft" && st !== "reverted";
    return i === 0
      ? act
      : i === 1
        ? !!(act && a.esign.groom.sign)
        : i === 2
          ? !!(act && a.esign.bride.sign)
          : i === 3
            ? st === "issued"
            : !!a.vault;
  }
  function stepSub(a: ApplicationRecord, i: number): string {
    const st = a.status;
    if (i === 0)
      return st === "reverted"
        ? "Reverted, edit needed"
        : st === "draft"
          ? "Draft, not submitted"
          : "Submitted";
    if (i === 1 || i === 2)
      return stepDone(a, i)
        ? "eKYC certificate issued"
        : "Awaiting " + (i === 1 ? "groom" : "bride") + " eSign";
    if (i === 3) return st === "issued" ? "Approved with eSign" : "Awaiting registrar approval";
    return a.vault ? "Sent to OneID Vault" : "Automatic on approval";
  }
  function flowHTML(a: ApplicationRecord): string {
    const st = a.status,
      past = ["appraisal", "approval", "issued"].includes(st),
      es = st === "esign";
    const states = [
      st === "reverted" ? "bad" : st === "draft" ? "now" : "done",
      a.esign.groom.sign && (es || past) ? "done" : es ? "now" : "",
      a.esign.bride.sign && (es || past) ? "done" : es ? "now" : "",
      st === "issued" ? "done" : st === "appraisal" || st === "approval" ? "now" : "",
      a.vault ? "done" : st === "issued" ? "now" : "",
    ];
    const sub = (i: number) => stepSub(a, i);
    return `<div class="flow">${dependencies.STEPS.map((s: [string, string, string], i: number) => `<div class="fs ${states[i]}"><div class="ic">${states[i] === "done" ? dependencies.IC.check : s[2]}</div><div><b>${s[0]}</b><small>${sub(i)}</small></div></div>`).join("")}</div>`;
  }
  const flagsHTML = (list: Array<[string, string]>): string =>
    `<ul class="flags">${list.map((x) => `<li class="${x[0]}"><span class="i">${x[0] === "ok" ? "✓" : x[0] === "warn" ? "!" : "✕"}</span><span>${dependencies.esc(x[1])}</span></li>`).join("")}</ul>`;
  const histHTML = (a: ApplicationRecord): string =>
    `<ul class="hist">${(a.history || [])
      .slice()
      .reverse()
      .map(
        (h) =>
          `<li><div><b>${dependencies.esc(h.text)}</b><small>${dependencies.esc(h.by)} · ${dependencies.fDT(h.at)}</small></div></li>`,
      )
      .join("")}</ul>`;
  function summaryHTML(a: ApplicationRecord): string {
    const f = a.f;
    return `<dl class="kv"><div><dt>Groom</dt><dd>${dependencies.esc(f.groom.nameEn)} <span class="bn" style="color:var(--tx3)">${dependencies.esc(f.groom.nameBn)}</span></dd></div><div><dt>Bride</dt><dd>${dependencies.esc(f.bride.nameEn)} <span class="bn" style="color:var(--tx3)">${dependencies.esc(f.bride.nameBn)}</span></dd></div>
  <div><dt>Registrar</dt><dd>${f.registrar ? dependencies.esc(dependencies.regName(f.registrar)) + " (" + f.registrar + ")" : "—"}</dd></div><div><dt>Registration date</dt><dd>${dependencies.fD(f.m.regDate)} ${dependencies.esc(f.m.regTime)}</dd></div>
  <div><dt>Mohor</dt><dd>${dependencies.inr(dependencies.toEn(f.m.mohor))} Tk</dd></div><div><dt>Registration fee</dt><dd>${dependencies.inr(dependencies.fee(f.m.mohor))} Tk (${f.m.pay}${f.m.pay === "online" ? (a.paid ? ", paid" : ", unpaid") : ""})</dd></div></dl>`;
  }
  function tableHTML(rows: ApplicationRecord[], portal: string, cols: string[]): string {
    if (!rows.length) return `<div class="tw"><div class="empty">Nothing here yet.</div></div>`;
    return `<div class="tw"><table class="tbl"><thead><tr><th>Application</th><th>Groom &amp; Bride</th>${cols.includes("reg") ? "<th>Registrar</th>" : ""}<th>Submitted</th><th>Status</th></tr></thead><tbody>
    ${rows.map((a) => `<tr class="rowlink" data-act="openapp" data-p="${portal}" data-id="${a.id}" tabindex="0"><td><b>${dependencies.esc(a.issued ? a.issued.regNo : a.appNo)}</b></td><td>${dependencies.esc(dependencies.coupleEn(a))}</td>${cols.includes("reg") ? `<td>${a.f.registrar ? dependencies.esc(dependencies.regName(a.f.registrar)) : "—"}</td>` : ""}<td>${a.submittedAt ? dependencies.fDT(a.submittedAt) : "Not submitted"}</td><td>${dependencies.chip(a)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  return { stepDone, stepSub, flowHTML, flagsHTML, histHTML, summaryHTML, tableHTML };
}
