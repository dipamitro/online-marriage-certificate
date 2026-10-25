import type { AnyDeps, ApplicationRecord, EmailMessage } from "../types";

/**
 * Action button labels for emails that contain an interactive portal link.
 */
const EMAIL_LINK_LABELS: Record<string, string> = {
  esign: "Accept invitation & eSign",
  doc: "Open Digital Nikahnama",
  vault: "Open my OneID Wallet",
  registrar: "Open in Registrar Portal",
  applicant: "Open my application",
};

/**
 * Renders the simulated Email Inbox (`/inbox`) and full-page Digital Nikahnama
 * document viewer (`doc`).
 *
 * Dependencies: `S`, `UI`, `appById`, `certHTML`, `coupleEn`, `docHTML`, `esc`, `fDT`.
 */
export function createScreensInbox(dependencies: AnyDeps) {
  /**
   * Renders a single email row inside the inbox sidebar list.
   */
  function renderEmailListItem(
    email: EmailMessage,
    selectedEmail: EmailMessage | undefined,
  ): string {
    const isUnreadClass = email.read ? "" : "unread";
    const isSelectedClass = selectedEmail && selectedEmail.id === email.id ? "sel" : "";

    return `
      <li>
        <button class="${isUnreadClass} ${isSelectedClass}" data-act="mail" data-id="${email.id}">
          <div class="to">${dependencies.esc(email.to)}</div>
          <div class="sj">${dependencies.esc(email.subject)}</div>
          <div class="to">${dependencies.fDT(email.at)}</div>
        </button>
      </li>
    `;
  }

  /**
   * Renders the right-hand reading pane for the currently selected email.
   */
  function renderSelectedEmailPane(selectedEmail: EmailMessage | undefined): string {
    if (!selectedEmail) {
      return `<div class="empty">Pick an email to read it.</div>`;
    }

    const paragraphsHtml = selectedEmail.body
      .map((paragraph) => `<p>${dependencies.esc(paragraph)}</p>`)
      .join("");

    const actionLabel = selectedEmail.link ? EMAIL_LINK_LABELS[selectedEmail.link.type] : undefined;
    const actionButtonHtml = actionLabel
      ? `<div style="margin-top:16px">
           <button class="btn bp" data-act="maillink" data-id="${selectedEmail.id}">${actionLabel}</button>
         </div>`
      : "";

    return `
      <button class="btn bs" data-act="mailback" style="margin-bottom:12px">← Inbox</button>
      <h3>${dependencies.esc(selectedEmail.subject)}</h3>
      <p style="color:var(--tx3);font-size:12px;margin:6px 0 14px">
        To: ${dependencies.esc(selectedEmail.toName)} &lt;${dependencies.esc(selectedEmail.to)}&gt; · ${dependencies.fDT(selectedEmail.at)}
      </p>
      ${paragraphsHtml}
      ${actionButtonHtml}
    `;
  }

  /**
   * Renders the complete Email Inbox screen (`/inbox`).
   */
  function inboxPage(): string {
    const emails: EmailMessage[] = dependencies.S.emails;
    const selectedEmailId: string | null = dependencies.UI.inbox.id;
    const selectedEmail = emails.find((email) => email.id === selectedEmailId);

    const emailListHtml = emails.length
      ? emails.map((email) => renderEmailListItem(email, selectedEmail)).join("")
      : `<li class="empty">No emails yet.</li>`;

    return `
      <div class="banner">
        <div>
          <h2>Email inbox</h2>
          <p>Every email the portal sends, to all addresses (simulated).</p>
        </div>
      </div>
      <div class="inbox ${selectedEmail ? "reading" : ""}">
        <ul class="ml">${emailListHtml}</ul>
        <div class="mr">${renderSelectedEmailPane(selectedEmail)}</div>
      </div>
    `;
  }

  /**
   * Renders the full-page Digital Nikahnama and Marriage Certificate view (`doc`).
   */
  function docPage(): string {
    const application: ApplicationRecord | undefined = dependencies.appById(dependencies.UI.doc);
    if (!application) {
      return `<div class="card">Not found.</div>`;
    }

    const registrationOrAppNumber = application.issued
      ? application.issued.regNo
      : application.appNo;

    const certificateSectionHtml = application.cert
      ? `
        <div class="banner" style="margin-top:18px">
          <div>
            <h2>Marriage Certificate</h2>
            <p>SN ${dependencies.esc(application.cert.sn)}</p>
          </div>
          <button class="btn bp" data-act="pdf" data-kind="cert" data-id="${application.id}">Download PDF</button>
        </div>
        <div class="dv">${dependencies.certHTML(application)}</div>
      `
      : "";

    return `
      <div class="banner">
        <div>
          <h2>Digital Nikahnama</h2>
          <p>${dependencies.esc(registrationOrAppNumber)} · ${dependencies.esc(dependencies.coupleEn(application))}</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn bp" data-act="pdf" data-id="${application.id}">Download PDF</button>
          <button class="btn bs" data-act="verifyapp" data-id="${application.id}">Verify</button>
        </div>
      </div>
      <div class="dv">${dependencies.docHTML(application)}</div>
      ${certificateSectionHtml}
    `;
  }

  return { inboxPage, docPage };
}
