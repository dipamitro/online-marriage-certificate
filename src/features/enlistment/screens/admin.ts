/* eslint-disable prettier/prettier */
import type { EnlApplication, EnlState, EnlUIState, EnlUser, JurNode } from "../types";
import { DOCS, ST } from "../constants/people";
import { LEVELS, LEVEL_EN } from "../constants/jurisdiction";
import { bn, chip, esc, fD, fDT, ini, ageOf } from "../services/applications";
import { pathOf, placeOf } from "../services/jurisdiction";
import { checksFor as runChecksFor, takenWards } from "../validators/enlistment";

export interface AdminScreenDeps {
  $: (s: string) => HTMLElement | null;
  jur: Record<string, JurNode>;
  state: EnlState;
  ui: EnlUIState;
  userBy: (id: string | null | undefined) => EnlUser | null;
  stepsHTML: (a: EnlApplication | null) => string;
  certHTML: (a: EnlApplication) => string;
}

export function createScreensAdmin(deps: AdminScreenDeps) {
  const { $, jur, state, ui, userBy, stepsHTML, certHTML } = deps;

  /* ---------- admin and super admin ---------- */
  function adminDash(): string {
    const c = (st: string): number => state.apps.filter((a) => a.status === st).length;
    const recent = state.apps
      .filter((a) => a.status !== "DRAFT")
      .slice()
      .reverse()
      .slice(0, 6);
    return `<div class="grid4"><div class="stat"><b>${c("SUBMITTED")}</b><span>Awaiting review and approval</span></div><div class="stat"><b>${c("RETURNED")}</b><span>Returned for correction</span></div><div class="stat"><b>${c("ENLISTED")}</b><span>Enlisted registrars</span></div><div class="stat"><b>${c("SUSPENDED") + c("CANCELLED")}</b><span>Suspended or cancelled</span></div></div>
    <div class="card"><div class="ch"><h3>Next step</h3></div>${c("SUBMITTED") ? `<p style="margin-bottom:12px">${c("SUBMITTED")} application${c("SUBMITTED") > 1 ? "s are" : " is"} waiting. Open one to read the full application form and approve it with eSign, return it or reject it.</p><button class="btn bp" data-act="page" data-p="verify">Open review and approval</button>` : `<p class="sub">Nothing is waiting. Browse the registrar directory or maintain the system.</p>`}</div>
    <div class="card"><div class="ch"><h3>Recent applications</h3><button class="btn sm" data-act="page" data-p="all">See all</button></div>${appTable(recent, "No applications yet.")}</div>`;
  }
  function appTable(list: EnlApplication[], emptyMsg: string): string {
    return list.length
      ? `<div class="tw"><table class="t"><thead><tr><th>Application</th><th>Applicant</th><th class="bn">ইউনিয়ন / পৌরসভা · ওয়ার্ড</th><th>Submitted</th><th>Status</th></tr></thead><tbody>${list.map((a) => `<tr class="click" data-act="openapp" data-id="${a.id}" tabindex="0"><td><b>${esc(a.licenceNo || a.appNo)}</b></td><td>${esc(a.p.nameEn)}<br><span class="bn" style="color:var(--tx3);font-size:12px">${esc(a.p.nameBn)}</span></td><td class="bn">${esc(placeOf(jur, a.j.wards))}<br><span style="color:var(--tx3);font-size:12px">${a.j.dist ? esc(jur[a.j.dist]?.name) + ", " + esc(jur[a.j.div]?.name) : ""}</span></td><td>${fD(a.submittedAt)}</td><td>${chip(a.status)}</td></tr>`).join("")}</tbody></table></div>`
      : `<div class="tw"><div class="empty">${emptyMsg}</div></div>`;
  }
  // checksFor handled by validator
  function appDetail(a: EnlApplication, r: string): string {
    const isOfficial = r === "admin" || r === "super",
      isSuper = r === "super";
    const checks = `<ul class="checks">${runChecksFor(a, state.apps, state.settings, userBy)
      .map(
        (c) =>
          `<li class="${c[0]}"><span class="i">${c[0] === "ok" ? "✓" : c[0] === "warn" ? "!" : "✕"}</span><span>${esc(c[1])}</span></li>`,
      )
      .join("")}</ul>`;
    let panel = "";
    if (isOfficial && a.status === "SUBMITTED")
      panel = `<div class="card" style="border-top:4px solid var(--pri)"><div class="ch"><h3>Review and approve</h3>${chip(a.status)}</div><p class="sub" style="margin-bottom:10px">Automatic checks</p>${checks}<p class="hint" style="margin-top:12px">Approving issues the licence, designates the registrar for the wards in section 4, seals it with a VDS and sends it to the registrar's OneID Wallet. Confirmed with a one-time SMS code.</p><div style="display:grid;gap:8px;margin-top:12px"><button class="btn bp" data-act="approve" data-id="${a.id}">Approve with eSign</button><button class="btn" data-act="return" data-id="${a.id}">Return to applicant</button><button class="btn br" data-act="reject" data-id="${a.id}">Reject</button></div></div>`;
    else if (isOfficial && (a.status === "ENLISTED" || a.status === "SUSPENDED"))
      panel = isSuper
        ? `<div class="card"><div class="ch"><h3>Manage registrar</h3>${chip(a.status)}</div><div style="display:grid;gap:8px">${a.status === "ENLISTED" ? `<button class="btn" data-act="suspend" data-id="${a.id}">Suspend</button>` : `<button class="btn bp" data-act="reinstate" data-id="${a.id}">Reinstate</button>`}<button class="btn br" data-act="cancel" data-id="${a.id}">Cancel licence</button></div></div>`
        : `<div class="card"><div class="ch"><h3>Registrar</h3>${chip(a.status)}</div><p class="sub">Only the Super Admin can suspend, reinstate or cancel a licence.</p></div>`;
    else
      panel = `<div class="card"><div class="ch"><h3>Status</h3>${chip(a.status)}</div>${a.returnNote && a.status === "RETURNED" ? `<p>${esc(a.returnNote)}</p>` : ""}${a.rejectNote && a.status === "REJECTED" ? `<p>${esc(a.rejectNote)}</p>` : ""}</div>`;
    return `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button class="btn sm" data-act="back">← Back</button><button class="btn sm" data-act="print">Print application form</button></div>
    <div class="card" style="margin-bottom:14px">${stepsHTML(a)}</div>
    <div class="dlayout"><div>${formHTML(a)}${a.status === "ENLISTED" || a.status === "SUSPENDED" ? `<div class="card" style="margin-top:14px"><div class="ch"><h3>Licence</h3></div>${certHTML(a)}</div>` : ""}</div>
    <aside class="dside">${panel}<div class="card"><div class="ch"><h3>History</h3></div><ul class="hist">${(
      a.history || []
    )
      .slice()
      .reverse()
      .map((h) => `<li><div>${esc(h.text)}<small>${esc(h.by)} · ${fDT(h.at)}</small></div></li>`)
      .join("")}</ul></div></aside></div>`;
  }
  function formHTML(a: EnlApplication): string {
    const u = a.userId ? userBy(a.userId) : null,
      path = a.j.wards.length ? pathOf(jur, a.j.wards[0]) : [];
    const row = (bnL: string, enL: string, v: string): string =>
      `<tr><th><span class="bn">${bnL}</span><small>${enL}</small></th><td>${v || "—"}</td></tr>`;
    const sec = (n: number, bnT: string, enT: string, rows: string): string =>
      `<div class="af-sec"><h4><span class="af-n">${bn(n)}</span><span class="bn">${bnT}</span><small>${enT}</small></h4><table class="af-t">${rows}</table></div>`;
    const stLabel = ST[a.status]?.[0] ?? a.status;
    return `<article class="af" id="af-print"><header class="af-h"><div class="af-gov"><div class="af-emb" aria-hidden="true">GoB</div><div><div class="bn af-g1">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div><div class="bn af-g2">আইন ও বিচার বিভাগ</div><div class="af-g3">Law and Justice Division</div></div></div>
    <div class="af-photo" aria-label="Applicant photograph">${a.docs["photo"] ? `<svg viewBox="0 0 60 72" width="64" height="76"><rect width="60" height="72" fill="#E8EEF8"/><circle cx="30" cy="26" r="13" fill="#B9C7DE"/><path d="M6 72c2-16 12-24 24-24s22 8 24 24z" fill="#B9C7DE"/></svg><span>Photo attached</span>` : `<span>No photo</span>`}</div></header>
    <h2 class="af-title bn">নিকাহ রেজিস্ট্রার লাইসেন্সের জন্য আবেদনপত্র</h2><div class="af-sub">Application for Licence as Marriage Registrar (Nikah Registrar)</div>
    <div class="af-meta"><div><small>Application no.</small><b>${esc(a.appNo)}</b></div><div><small>Submitted</small><b>${fDT(a.submittedAt)}</b></div><div><small>Status</small><b>${stLabel}</b></div>${a.licenceNo ? `<div><small>Licence no.</small><b>${esc(a.licenceNo)}</b></div>` : ""}</div>
    ${sec(1, "ব্যক্তিগত তথ্য", "Personal details", row("নাম (বাংলা)", "Name in Bangla", `<span class="bn">${esc(a.p.nameBn)}</span>`) + row("নাম (ইংরেজি)", "Name in English", esc(a.p.nameEn)) + row("পিতার নাম", "Father's name", esc(a.p.father)) + row("মাতার নাম", "Mother's name", esc(a.p.mother)) + row("জন্ম তারিখ", "Date of birth", `${fD(a.p.dob)} (age ${ageOf(a.p.dob)})`) + row("লিঙ্গ", "Gender", esc(a.p.gender)) + row("জাতীয় পরিচয়পত্র নম্বর", "NID number", "••••••" + esc(String(a.p.nid).slice(-4))))}
    ${sec(2, "যোগাযোগ", "Contact", row("মোবাইল", "Mobile", esc(a.c.mobile)) + row("ইমেইল", "Email", esc(a.c.email)) + row("বর্তমান ঠিকানা", "Present address", `<span class="bn">${esc(a.c.address)}</span>`))}
    ${sec(3, "শিক্ষাগত যোগ্যতা", "Qualification", row("ডিগ্রি", "Degree", esc(a.q.degree)) + row("প্রতিষ্ঠান", "Institution", esc(a.q.institution)) + row("পাসের বছর", "Passing year", esc(a.q.year)) + row("ফলাফল", "Result", esc(a.q.result)))}
    ${sec(
      4,
      "প্রার্থিত অধিক্ষেত্র",
      "Jurisdiction requested",
      LEVELS.slice(0, 4)
        .map((l: string, i: number) =>
          row(l, LEVEL_EN[i] ?? "", path[i] ? `<span class="bn">${esc(path[i]?.name)}</span>` : ""),
        )
        .join("") +
        row(
          LEVELS[4] ?? "",
          LEVEL_EN[4] ?? "",
          `<span class="bn">${esc(a.j.wards.map((w) => jur[w]?.name ?? "").join(", "))}</span>`,
        ),
    )}
    ${sec(5, "কার্যালয়", "Office", row("কার্যালয়ের নাম", "Office name", `<span class="bn">${esc(a.o.name)}</span>`) + row("ঠিকানা", "Address", `<span class="bn">${esc(a.o.address)}</span>`) + row("ফোন", "Phone", esc(a.o.phone)))}
    ${sec(
      6,
      "সংযুক্তি",
      "Attachments",
      DOCS.map(([k, l]) =>
        row(
          "",
          l,
          a.docs[k]
            ? `<span class="af-ok">✓ ${esc(a.docs[k])}</span>`
            : `<span class="af-miss">Not attached</span>`,
        ),
      ).join(""),
    )}
    ${sec(7, "পরিচয় যাচাই", "Identity verification", row("পদ্ধতি", "Method", u && u.ekycAt ? esc(String(u.ekycMethod || "OneID eKYC: NID + face match")) : "Migrated from the existing licence register") + row("যাচাইয়ের তারিখ", "Verified on", u && u.ekycAt ? fDT(u.ekycAt) : "—"))}
    <div class="af-sec"><h4><span class="af-n">${bn(8)}</span><span class="bn">ঘোষণা</span><small>Declaration</small></h4><p class="af-decl">I declare that the information given is true, I am not enlisted as a marriage registrar elsewhere, and I will follow the Muslim Marriages and Divorces (Registration) Act and Rules.</p>
      <div class="af-sign"><div><small>Applicant</small><b>${esc(a.p.nameEn)}</b><span>${a.submittedAt ? "Submitted electronically on " + fDT(a.submittedAt) : "Not submitted"}</span></div><div><small>Declaration accepted</small><b>${a.declare ? "Yes" : "No"}</b></div></div></div>
    <div class="af-off"><h4>For official use</h4><div class="af-offg"><div><small>Decision</small><b>${a.status === "ENLISTED" || a.status === "SUSPENDED" || a.status === "CANCELLED" ? "Approved" : a.status === "REJECTED" ? "Rejected" : a.status === "RETURNED" ? "Returned for correction" : "Pending"}</b></div><div><small>Approved by</small><b>${a.approvedBy ? esc(a.approvedBy) + " (" + esc(a.approverTitle || "") + ")" : "—"}</b></div><div><small>Date</small><b>${a.approvedAt ? fDT(a.approvedAt) : "—"}</b></div><div><small>Licence valid until</small><b>${a.validTo ? fD(a.validTo) : "—"}</b></div></div></div>
  </article>`;
  }

  return {
    adminDash,
    appTable,
    appDetail,
    formHTML,
  };
}
