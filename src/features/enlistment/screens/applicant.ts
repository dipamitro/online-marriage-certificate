/* eslint-disable prettier/prettier */
import type { EnlApplication, EnlState, EnlUIState, EnlUser, JurNode } from "../types";
import { DOCS, ST } from "../constants/people";
import { LEVELS } from "../constants/jurisdiction";
import { ageOf, bn, esc, fD, fDT, ini, now, chip, clone, today } from "../services/applications";
import { kidsOf, pathOf, placeOf, roots } from "../services/jurisdiction";
import { takenWards, validateEnlistment } from "../validators/enlistment";

export interface ApplicantScreenDeps {
  $: (s: string) => HTMLElement | null;
  jur: Record<string, JurNode>;
  state: EnlState;
  ui: EnlUIState;
  currentUser: (r: string) => EnlUser | null;
  save: () => void;
  render: () => void;
  toast: (m: string) => void;
  certHTML: (a: EnlApplication) => string;
  appById: (id: string | null | undefined) => EnlApplication | undefined;
  blankApp: (u: EnlUser) => EnlApplication;
}

export function createScreensApplicant(deps: ApplicantScreenDeps) {
  const { $, jur, state, ui, currentUser, save, render, toast, certHTML, appById, blankApp } = deps;

  /* ---------- applicant ---------- */
  const myApp = (): EnlApplication | null => {
    const u = currentUser("applicant");
    if (!u) return null;
    return state.apps.filter((a) => a.userId === u.id).slice(-1)[0] || null;
  };
  function stepsHTML(a: EnlApplication | null): string {
    const s = a ? a.status : "DRAFT";
    const idxMap: Record<string, number> = {
      DRAFT: 0,
      RETURNED: 0,
      SUBMITTED: 1,
      FORWARDED: 1,
      ENLISTED: 3,
      REJECTED: 2,
      SUSPENDED: 3,
      CANCELLED: 3,
    };
    const idx = idxMap[s] ?? 0;
    const lab: Array<[string, string]> = [
      [
        "Submit application",
        s === "RETURNED"
          ? "Returned, fix and resubmit"
          : s === "DRAFT"
            ? "Not submitted yet"
            : "Submitted",
      ],
      [
        "Review and approval with eSign",
        s === "REJECTED"
          ? "Rejected"
          : idx > 1
            ? "Approved by " + (a?.approverTitle || "official")
            : idx === 1
              ? "With Admin / Super Admin"
              : "Waiting",
      ],
      ["Licence issued", idx >= 3 ? "Sent to OneID Wallet" : "Waiting"],
    ];
    return `<div class="steps" style="grid-template-columns:repeat(3,1fr)">${lab
      .map((l, i) => {
        const bad = (s === "REJECTED" && i === 1) || (s === "RETURNED" && i === 0);
        const done = !bad && (i < idx || (idx >= 3 && i === 2));
        return `<div class="st ${bad ? "bad" : done ? "done" : i === idx ? "now" : ""}"><i>${done ? "✓" : i + 1}</i><b>${l[0]}</b><small>${l[1]}</small></div>`;
      })
      .join("")}</div>`;
  }
  function applicantDash(): string {
    const u = currentUser("applicant"),
      a = myApp();
    let action = "";
    if (!a)
      action = `<div class="card"><div class="ch"><h3>Start your application</h3></div><p class="sub" style="margin-bottom:12px">Your identity is already verified by OneID eKYC (${fD(u?.ekycAt)}). Fill in your qualifications, the wards you want to serve, your office and documents, then submit.</p><button class="btn bp" data-act="newapp">Start application</button></div>`;
    else if (a.status === "DRAFT")
      action = `<div class="card"><div class="ch"><h3>Your application is a draft</h3>${chip(a.status)}</div><button class="btn bp" data-act="page" data-p="apply">Continue application</button></div>`;
    else if (a.status === "RETURNED")
      action = `<div class="card" style="border-left:4px solid #EA580C"><div class="ch"><h3>Returned for correction</h3>${chip(a.status)}</div><p style="margin-bottom:12px">${esc(a.returnNote)}</p><button class="btn bp" data-act="page" data-p="apply">Fix and resubmit</button></div>`;
    else if (a.status === "ENLISTED")
      action = `<div class="card" style="border-left:4px solid var(--pri)"><div class="ch"><h3>You are an enlisted marriage registrar</h3>${chip(a.status)}</div><div class="kv"><div><dt>Licence number</dt><dd>${esc(a.licenceNo)}</dd></div><div><dt>Wards</dt><dd class="bn">${esc(placeOf(jur, a.j.wards))}</dd></div><div><dt>Valid until</dt><dd>${fD(a.validTo)}</dd></div></div><div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn bp" data-act="opendesk">Open registrar desk</button><button class="btn" data-act="page" data-p="licence">View licence</button></div></div>`;
    else if (a.status === "REJECTED")
      action = `<div class="card"><div class="ch"><h3>Application rejected</h3>${chip(a.status)}</div><p>${esc(a.rejectNote || "")}</p></div>`;
    else
      action = `<div class="card"><div class="ch"><h3>Application ${esc(a.appNo)}</h3>${chip(a.status)}</div><p class="sub">An Admin or the Super Admin is reviewing your application. When it is approved with eSign, your licence goes to your OneID Wallet.</p><div style="margin-top:12px"><button class="btn" data-act="viewmine">View application</button></div></div>`;
    return `<div class="card"><div class="ch"><h3>Assalamu Alaikum, ${esc(u?.name)}</h3><span class="chip c-sub">eKYC verified</span></div>${stepsHTML(a)}</div>${action}
    ${
      a && a.history && a.history.length
        ? `<div class="card"><div class="ch"><h3>History</h3></div><ul class="hist">${a.history
            .slice()
            .reverse()
            .map(
              (h) => `<li><div>${esc(h.text)}<small>${esc(h.by)} · ${fDT(h.at)}</small></div></li>`,
            )
            .join("")}</ul></div>`
        : ""
    }`;
  }
  function fld(
    label: string,
    path: string,
    o: { en?: string; area?: number; ro?: number; type?: string; ph?: string; hint?: string } = {},
  ): string {
    const v =
      path
        .split(".")
        .reduce<unknown>((x, k) => (x == null ? x : (x as Record<string, unknown>)[k]), ui.draft) ??
      "";
    return `<div class="fg"><label>${label}${o.en ? ` <span class="en">${o.en}</span>` : ""}</label>${o.area ? `<textarea class="inp" data-b="${path}">${esc(v)}</textarea>` : `<input class="inp" data-b="${path}" value="${esc(v)}" ${o.ro ? "readonly" : ""} ${o.type ? `type="${o.type}"` : ""} ${o.ph ? `placeholder="${esc(o.ph)}"` : ""}>`}${o.hint ? `<div class="hint">${o.hint}</div>` : ""}</div>`;
  }
  function selJ(
    label: string,
    key: "div" | "dist" | "upz" | "uni",
    level: number,
    parentId?: string,
  ): string {
    const opts =
      parentId || level === 0 ? (level === 0 ? roots(jur) : kidsOf(jur, parentId, level)) : [];
    const v = ui.draft?.j[key] ?? "";
    return `<div class="fg"><label class="bn">${label}</label><select class="inp bn" data-j="${key}" ${!opts.length ? "disabled" : ""}><option value="">নির্বাচন করুন</option>${opts.map((n) => `<option value="${n.id}" ${v === n.id ? "selected" : ""}>${esc(n.name)}</option>`).join("")}</select></div>`;
  }
  // takenWards handled by validator
  function applyPage(): string {
    const a = myApp();
    if (
      a &&
      ["SUBMITTED", "FORWARDED", "ENLISTED", "REJECTED", "SUSPENDED", "CANCELLED"].includes(
        a.status,
      )
    ) {
      const stLabel = ST[a.status]?.[0]?.toLowerCase() ?? a.status.toLowerCase();
      return `<div class="info">Your application ${esc(a.appNo)} is ${stLabel} and can't be edited now.</div><div style="margin-top:12px"><button class="btn" data-act="viewmine">View application</button></div>`;
    }
    const u = currentUser("applicant");
    if (!ui.draft && u) ui.draft = a ? clone(a) : blankApp(u);
    const d = ui.draft;
    if (!d) return "";
    const taken = takenWards(state.apps, d.id),
      wardsOpts = d.j.uni ? kidsOf(jur, d.j.uni, 4) : [];
    const errs = ui.errs || [];
    return `<div class="card"><div class="ch"><div><h3>Marriage registrar enlistment application</h3><p class="sub">${d.appNo ? esc(d.appNo) + " · " : ""}Your personal details come from OneID eKYC and can't be changed here.</p></div><button class="btn sm" data-act="demofill">Fill with demo data</button></div>
    ${d.status === "RETURNED" && d.returnNote ? `<div class="err"><b>Returned by admin:</b> ${esc(d.returnNote)}</div>` : ""}
    ${errs.length ? `<div class="err" role="alert"><b>Fix ${errs.length} item${errs.length > 1 ? "s" : ""} before submitting:</b><ul>${errs.map((e) => `<li>${esc(e)}</li>`).join("")}</ul></div>` : ""}
    <div class="fsec"><h4>Personal details<small>From OneID eKYC</small></h4><div class="g2">${fld("Name (Bangla)", "p.nameBn", { ro: 1 })}${fld("Name (English)", "p.nameEn", { ro: 1 })}${fld("Father's name", "p.father", { ro: 1 })}${fld("Mother's name", "p.mother", { ro: 1 })}${fld("Date of birth", "p.dob", { ro: 1, hint: `Age ${ageOf(d.p.dob)} years` })}${fld("NID number", "p.nid", { ro: 1 })}</div></div>
    <div class="fsec"><h4>Contact<small>Used for all notices</small></h4><div class="g2">${fld("Mobile", "c.mobile")}${fld("Email", "c.email", { type: "email" })}</div>${fld("Present address", "c.address", { area: 1 })}</div>
    <div class="fsec"><h4>Qualification<small>As required by the licensing rules</small></h4><div class="g2"><div class="fg"><label>Degree</label><select class="inp" data-b="q.degree"><option value="">Select</option>${["Kamil", "Fazil", "Masters (Islamic Studies)", "Other equivalent"].map((o) => `<option ${d.q.degree === o ? "selected" : ""}>${o}</option>`).join("")}</select></div>${fld("Institution", "q.institution")}${fld("Passing year", "q.year", { ph: "e.g. 2008" })}${fld("Result", "q.result", { ph: "e.g. First class" })}</div></div>
    <div class="fsec"><h4 class="bn">অধিক্ষেত্র<small>Jurisdiction you want to serve</small></h4><div><div class="g2">${selJ("বিভাগ", "div", 0)}${selJ("জেলা", "dist", 1, d.j.div)}${selJ("উপজেলা / সিটি কর্পোরেশন", "upz", 2, d.j.dist)}${selJ("ইউনিয়ন / পৌরসভা", "uni", 3, d.j.upz)}</div>
      <div class="fg"><label class="bn">ওয়ার্ড <span class="en">(choose one or more)</span></label>${wardsOpts.length ? `<div class="wards">${wardsOpts.map((w) => `<label class="bn ${taken[w.id] && !state.settings.multiPerWard ? "taken" : ""}" title="${taken[w.id] ? "Already served by " + esc(taken[w.id]) : ""}"><input type="checkbox" data-ward="${w.id}" ${d.j.wards.includes(w.id) ? "checked" : ""}>${esc(w.name)}${taken[w.id] ? " · নেওয়া" : ""}</label>`).join("")}</div><div class="hint">Wards marked নেওয়া already have an enlisted registrar.</div>` : `<div class="hint">Select a union or pourashava to see its wards.</div>`}</div></div></div>
    <div class="fsec"><h4>Office<small>Where marriages will be registered</small></h4><div class="g2">${fld("Office name", "o.name", { ph: "e.g. Genda Kazi Office" })}${fld("Office phone", "o.phone")}</div>${fld("Office address", "o.address", { area: 1 })}</div>
    <div class="fsec"><h4>Documents<small>PDF or image, up to 5 MB each</small></h4><div class="docs">${DOCS.filter(
      (x) => state.settings.reqDocs.includes(x[0]),
    )
      .map(
        ([k, l]) =>
          `<div class="doc"><div><b>${l}</b><small>${d.docs[k] ? esc(d.docs[k]) : "Not uploaded"}</small></div>${d.docs[k] ? `<span class="ok">✓ Uploaded <button class="btn sm" data-act="rmdoc" data-k="${k}">Remove</button></span>` : `<button class="btn sm" data-act="updoc" data-k="${k}">Upload</button>`}</div>`,
      )
      .join("")}</div></div>
    <div class="fsec"><h4>Declaration</h4><label class="chk"><input type="checkbox" data-decl="1" ${d.declare ? "checked" : ""}><span>I declare that the information given is true, I am not enlisted as a marriage registrar elsewhere, and I will follow the Muslim Marriages and Divorces (Registration) Act and Rules.</span></label></div>
    <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:6px"><button class="btn" data-act="savedraft">Save draft</button><button class="btn bp" data-act="submit">Submit application</button></div></div>`;
  }
  // validate handled by validator
  function saveDraft(): EnlApplication | null {
    const d = ui.draft;
    if (!d) return null;
    let a = d.id ? appById(d.id) : undefined;
    if (!a) {
      state.seq.app++;
      d.id = "a" + state.seq.app;
      d.appNo = "ENL-" + today().slice(0, 4) + "-" + state.seq.app;
      a = clone(d);
      state.apps.push(a);
    } else Object.assign(a, clone(d));
    save();
    return a;
  }
  function licencePage(): string {
    const a = myApp();
    if (!a || !["ENLISTED", "SUSPENDED"].includes(a.status))
      return `<div class="card empty">Your licence appears here after the Super Admin approves your application.</div>`;
    return `<div class="card"><div class="ch"><h3>Marriage registrar licence</h3>${chip(a.status)}</div>${certHTML(a)}<p class="hint" style="text-align:center;margin-top:10px">This licence is also in your OneID Wallet under Documents Vault.</p></div>`;
  }

  return {
    myApp,
    stepsHTML,
    applicantDash,
    applyPage,
    saveDraft,
    licencePage,
    fld,
    selJ,
  };
}
