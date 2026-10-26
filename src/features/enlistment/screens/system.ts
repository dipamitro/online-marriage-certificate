/* eslint-disable prettier/prettier */
import type { EnlState, EnlUIState, JurNode } from "../types";
import { ST } from "../constants/people";
import { chip, esc, bn } from "../services/applications";
import { pathOf, placeOf, under, roots } from "../services/jurisdiction";
import { CCA, LEVELS } from "../constants/jurisdiction";

export interface SystemScreenDeps {
  $: (s: string) => HTMLElement | null;
  jur: Record<string, JurNode>;
  state: EnlState;
  ui: EnlUIState;
}

export function createScreensSystem(deps: SystemScreenDeps) {
  const { $, jur, state, ui } = deps;

  function countUnder(nodeId: string, st: string): number {
    return state.apps.filter(
      (a) =>
        (st === "ALL"
          ? ["ENLISTED", "SUSPENDED", "CANCELLED"].includes(a.status)
          : a.status === st) && a.j.wards.some((w) => under(jur, w, nodeId)),
    ).length;
  }
  function treeHTML(id: string, depth: number): string {
    const n = jur[id];
    if (!n) return "";
    const open = ui.dirOpen[id],
      c = countUnder(id, ui.dirSt);
    const kids = n.kids;
    return `<div><button class="tn ${ui.dirNode === id ? "on" : ""}" style="padding-left:${8 + depth * 14}px" data-act="dirsel" data-id="${id}"><span class="tg" data-act="dirtog" data-id="${id}">${kids.length && n.level < 4 ? (open ? "▾" : "▸") : "·"}</span>${esc(n.name === CCA ? n.name : n.name)}<span class="ct ${c ? "" : "z"}">${bn(c)}</span></button>${open && n.level < 4 ? kids.map((k) => treeHTML(k, depth + 1)).join("") : ""}</div>`;
  }
  function directoryPage(): string {
    const node = ui.dirNode ? jur[ui.dirNode] : undefined;
    const q = ui.dirQ.trim().toLowerCase();
    const list = state.apps
      .filter((a) =>
        ui.dirSt === "ALL"
          ? ["ENLISTED", "SUSPENDED", "CANCELLED"].includes(a.status)
          : a.status === ui.dirSt,
      )
      .filter((a) => !node || a.j.wards.some((w) => under(jur, w, node.id)))
      .filter(
        (a) =>
          !q ||
          (
            a.p.nameEn +
            " " +
            a.p.nameBn +
            " " +
            (a.licenceNo || "") +
            " " +
            a.c.mobile +
            " " +
            a.o.address
          )
            .toLowerCase()
            .includes(q),
      );
    const crumbs: JurNode[] = node ? pathOf(jur, node.id) : [];
    const rows = list
      .map((a) => {
        const p = pathOf(jur, a.j.wards[0]);
        return `<tr class="click" data-act="openapp" data-id="${a.id}" tabindex="0"><td><b>${esc(a.p.nameEn)}</b><br><span class="bn" style="color:var(--tx3);font-size:12px">${esc(a.p.nameBn)}</span></td><td class="nw">${esc(a.licenceNo)}</td><td class="bn">${esc(p[0]?.name)}</td><td class="bn">${esc(p[1]?.name)}</td><td class="bn">${esc(p[2]?.name)}</td><td class="bn">${esc(p[3]?.name)}</td><td class="bn">${esc(a.j.wards.map((w) => (jur[w]?.name ?? "").replace("ওয়ার্ড ", "")).join(", "))}</td><td>${esc(a.c.mobile)}</td><td>${chip(a.status)}</td></tr>`;
      })
      .join("");
    return `<div class="dir"><div class="tree" aria-label="Jurisdiction hierarchy"><button class="tn ${!node ? "on" : ""}" data-act="dirsel" data-id=""><span class="tg">◆</span>সমগ্র বাংলাদেশ<span class="ct">${bn(countUnder("__none", ui.dirSt) || state.apps.filter((a) => (ui.dirSt === "ALL" ? ["ENLISTED", "SUSPENDED", "CANCELLED"].includes(a.status) : a.status === ui.dirSt)).length)}</span></button>${roots(
      jur,
    )
      .map((n) => treeHTML(n.id, 0))
      .join("")}</div>
    <div><div class="card" style="padding:14px 16px"><div class="bc"><button data-act="dirsel" data-id="">সমগ্র বাংলাদেশ</button>${crumbs.map((n) => `<span>›</span><button data-act="dirsel" data-id="${n.id}">${esc(n.name)}</button>`).join("")}</div>
      <div class="levels">${LEVELS.map((l: string, i: number) => `<span class="chip ${node && node.level === i ? "c-sub" : "c-dr"} bn">${l}</span>`).join("")}</div>
      <div class="toolbar"><input class="inp" data-dirq="1" placeholder="Search name, licence, mobile or office" value="${esc(ui.dirQ)}"><select class="inp" data-dirst="1">${[
        ["ENLISTED", "Enlisted"],
        ["SUSPENDED", "Suspended"],
        ["CANCELLED", "Cancelled"],
        ["ALL", "All statuses"],
      ]
        .map(([v, l]) => `<option value="${v}" ${ui.dirSt === v ? "selected" : ""}>${l}</option>`)
        .join(
          "",
        )}</select><span class="sub" style="align-self:center">${list.length} registrar${list.length === 1 ? "" : "s"}${node ? " in " + esc(node.name) : ""}</span></div></div>
      <div class="tw" style="margin-top:12px">${list.length ? `<table class="t"><thead><tr><th>Name</th><th>Licence</th><th class="bn">বিভাগ</th><th class="bn">জেলা</th><th class="bn">উপজেলা / সিটি কর্পোরেশন</th><th class="bn">ইউনিয়ন / পৌরসভা</th><th class="bn">ওয়ার্ড</th><th>Mobile</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>` : `<div class="empty">No registrars match this area and filter.</div>`}</div></div></div>`;
  }

  return {
    countUnder,
    treeHTML,
    directoryPage,
  };
}
