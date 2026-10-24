import type { AnyDeps, ApplicationRecord, EmailMessage } from "../types";

/** screens/inbox. Dependencies: S, UI, appById, certHTML, coupleEn, docHTML, esc, fDT. */
export function createScreensInbox(dependencies: AnyDeps) {
  function inboxPage(): string {
    const sel: EmailMessage | undefined = dependencies.S.emails.find(
      (m: EmailMessage) => m.id === dependencies.UI.inbox.id,
    );
    const lab: Record<string, string> = {
      esign: "Accept invitation & eSign",
      doc: "Open Digital Nikahnama",
      vault: "Open my OneID Wallet",
      registrar: "Open in Registrar Portal",
      applicant: "Open my application",
    };
    return `<div class="banner"><div><h2>Email inbox</h2><p>Every email the portal sends, to all addresses (simulated).</p></div></div>
    <div class="inbox ${sel ? "reading" : ""}"><ul class="ml">${dependencies.S.emails.length ? dependencies.S.emails.map((m: EmailMessage) => `<li><button class="${m.read ? "" : "unread"} ${sel && sel.id === m.id ? "sel" : ""}" data-act="mail" data-id="${m.id}"><div class="to">${dependencies.esc(m.to)}</div><div class="sj">${dependencies.esc(m.subject)}</div><div class="to">${dependencies.fDT(m.at)}</div></button></li>`).join("") : `<li class="empty">No emails yet.</li>`}</ul>
    <div class="mr">${sel ? `<button class="btn bs" data-act="mailback" style="margin-bottom:12px">← Inbox</button><h3>${dependencies.esc(sel.subject)}</h3><p style="color:var(--tx3);font-size:12px;margin:6px 0 14px">To: ${dependencies.esc(sel.toName)} &lt;${dependencies.esc(sel.to)}&gt; · ${dependencies.fDT(sel.at)}</p>${sel.body.map((p) => `<p>${dependencies.esc(p)}</p>`).join("")}${sel.link && lab[sel.link.type] ? `<div style="margin-top:16px"><button class="btn bp" data-act="maillink" data-id="${sel.id}">${lab[sel.link.type]}</button></div>` : ""}` : `<div class="empty">Pick an email to read it.</div>`}</div></div>`;
  }
  function docPage(): string {
    const a: ApplicationRecord | undefined = dependencies.appById(dependencies.UI.doc);
    if (!a) return `<div class="card">Not found.</div>`;
    return `<div class="banner"><div><h2>Digital Nikahnama</h2><p>${dependencies.esc(a.issued ? a.issued.regNo : a.appNo)} · ${dependencies.esc(dependencies.coupleEn(a))}</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn bp" data-act="pdf" data-id="${a.id}">Download PDF</button><button class="btn bs" data-act="verifyapp" data-id="${a.id}">Verify</button></div></div><div class="dv">${dependencies.docHTML(a)}</div>${a.cert ? `<div class="banner" style="margin-top:18px"><div><h2>Marriage Certificate</h2><p>SN ${dependencies.esc(a.cert.sn)}</p></div><button class="btn bp" data-act="pdf" data-kind="cert" data-id="${a.id}">Download PDF</button></div><div class="dv">${dependencies.certHTML(a)}</div>` : ""}`;
  }
  return { inboxPage, docPage };
}
