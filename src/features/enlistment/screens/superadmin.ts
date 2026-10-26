/* eslint-disable prettier/prettier */
import type { EnlState, EnlUIState, JurNode } from "../types";
import { DOCS } from "../constants/people";
import { LEVELS, CCA } from "../constants/jurisdiction";
import { esc, fDT } from "../services/applications";
import { kidsOf, pathOf } from "../services/jurisdiction";

export interface SuperAdminScreenDeps {
  $: (s: string) => HTMLElement | null;
  jur: Record<string, JurNode>;
  state: EnlState;
  ui: EnlUIState;
}

export function createScreensSuperAdmin(deps: SuperAdminScreenDeps) {
  const { $, jur, state, ui } = deps;

  /* ---------- system pages ---------- */
  function jurPage(): string {
    const counts = [0, 1, 2, 3, 4].map(
      (l) => Object.values(jur).filter((n) => n.level === l).length,
    );
    return `<div class="grid4">${LEVELS.map((l, i) => `<div class="stat"><b>${counts[i]}</b><span class="bn">${l}</span></div>`).join("")}</div>
    <div class="card"><div class="ch"><h3>Add a ward</h3></div><p class="sub" style="margin-bottom:12px">New wards appear immediately in the application form and the directory.</p><div class="g3"><div class="fg"><label class="bn">ইউনিয়ন / পৌরসভা</label><select class="inp bn" id="jw-uni">${Object.values(
      jur,
    )
      .filter((n) => n.level === 3)
      .map(
        (n) =>
          `<option value="${n.id}">${esc(n.name === CCA ? (n.parent ? jur[n.parent]?.name : n.name) : n.name + ", " + (n.parent ? jur[n.parent]?.name : ""))}</option>`,
      )
      .join(
        "",
      )}</select></div><div class="fg"><label>Ward name</label><input class="inp bn" id="jw-name" placeholder="ওয়ার্ড ১০"></div><div class="fg"><label>&nbsp;</label><button class="btn bp bfw" data-act="addward">Add ward</button></div></div></div>
    <div class="card"><div class="ch"><h3>Hierarchy</h3></div><div class="tw"><table class="t"><thead><tr>${LEVELS.slice(
      0,
      4,
    )
      .map((l) => `<th class="bn">${l}</th>`)
      .join("")}<th class="bn">ওয়ার্ড</th></tr></thead><tbody>${Object.values(jur)
      .filter((n) => n.level === 3)
      .map((n) => {
        const p = pathOf(jur, n.id);
        return `<tr>${p.map((x) => `<td class="bn">${esc(x.name)}</td>`).join("")}<td>${n.kids.length}</td></tr>`;
      })
      .join("")}</tbody></table></div></div>`;
  }
  function usersPage(r: string): string {
    const rows = state.users
      .map(
        (u) =>
          `<tr><td><b>${esc(u.name)}</b><br><span style="color:var(--tx3);font-size:12px">${esc(u.email)}</span></td><td>${u.role === "super" ? "Super Admin" : u.role === "admin" ? "Admin" : "Applicant"}</td><td>${esc(u.designation || "—")}</td><td>${u.active ? '<span class="chip c-sub">Active</span>' : '<span class="chip c-sus">Disabled</span>'}</td><td>${r === "super" && u.role === "admin" ? `<button class="btn sm" data-act="toggleuser" data-id="${u.id}">${u.active ? "Disable" : "Enable"}</button>` : ""}</td></tr>`,
      )
      .join("");
    return `${r === "super" ? `<div class="card"><div class="ch"><h3>Add an admin</h3></div><div class="g3"><div class="fg"><label>Full name</label><input class="inp" id="nu-name" placeholder="e.g. Shamim Ahmed"></div><div class="fg"><label>Official email</label><input class="inp" id="nu-mail" placeholder="name@lawjustice.gov.bd"></div><div class="fg"><label>Designation</label><input class="inp" id="nu-des" placeholder="Assistant Programmer"></div></div><button class="btn bp" data-act="adduser">Add admin</button></div>` : `<div class="info" style="margin-bottom:14px">Only the Super Admin can add or disable admins.</div>`}
    <div class="card"><div class="ch"><h3>Users and roles</h3></div><div class="tw"><table class="t"><thead><tr><th>User</th><th>Role</th><th>Designation</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <h4 style="margin:18px 0 8px">What each role can do</h4><div class="tw"><table class="t"><thead><tr><th>Action</th><th>Applicant</th><th>Admin</th><th>Super Admin</th></tr></thead><tbody>
    ${[
      ["Apply, edit and resubmit own application", "Yes", "—", "—"],
      ["Review applications, return for correction", "—", "Yes", "Yes"],
      ["Approve with eSign, reject", "—", "Yes", "Yes"],
      ["Suspend, reinstate, cancel registrars", "—", "—", "Yes"],
      ["Registrar directory by hierarchy", "—", "Yes", "Yes"],
      ["Jurisdictions and eligibility settings", "—", "Yes", "Yes"],
      ["Add or disable admins", "—", "—", "Yes"],
    ]
      .map(
        (r2) =>
          `<tr>${r2.map((c, i) => `<td${i ? ' style="text-align:center"' : ""}>${c}</td>`).join("")}</tr>`,
      )
      .join("")}</tbody></table></div></div>`;
  }
  function settingsPage(): string {
    const s = state.settings;
    return `<div class="card"><div class="ch"><h3>Eligibility settings</h3></div><p class="sub" style="margin-bottom:14px">These rules apply to new submissions and to the automatic checks admins see.</p>
    <div class="g3"><div class="fg"><label>Minimum age</label><input class="inp" type="number" id="set-min" value="${s.minAge}"></div><div class="fg"><label>Maximum age</label><input class="inp" type="number" id="set-max" value="${s.maxAge}"></div><div class="fg"><label>More than one registrar per ward</label><select class="inp" id="set-multi"><option value="0" ${!s.multiPerWard ? "selected" : ""}>Not allowed</option><option value="1" ${s.multiPerWard ? "selected" : ""}>Allowed</option></select></div></div>
    <div class="fg"><label>Required documents</label><div class="docs">${DOCS.map(([k, l]) => `<label class="chk"><input type="checkbox" data-reqdoc="${k}" ${s.reqDocs.includes(k) ? "checked" : ""}><span>${l}</span></label>`).join("")}</div></div>
    <button class="btn bp" data-act="savesettings">Save settings</button></div>`;
  }
  function auditPage(): string {
    return `<div class="card"><div class="ch"><h3>Audit log</h3><span class="sub">${state.audit.length} events</span></div><div class="tw"><table class="t"><thead><tr><th>Time</th><th>By</th><th>Action</th></tr></thead><tbody>${state.audit
      .slice(0, 200)
      .map(
        (e) =>
          `<tr><td style="white-space:nowrap">${fDT(e.at)}</td><td>${esc(e.by)}</td><td>${esc(e.text)}</td></tr>`,
      )
      .join("")}</tbody></table></div></div>`;
  }

  return {
    jurPage,
    usersPage,
    settingsPage,
    auditPage,
  };
}
