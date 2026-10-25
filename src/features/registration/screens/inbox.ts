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
 * Renders the per-user Email Inbox (`/inbox`) with Email + Password Sign-In
 * and the full-page Digital Nikahnama document viewer (`doc`).
 *
 * Dependencies: `S`, `UI`, `appById`, `certHTML`, `coupleEn`, `docHTML`, `esc`, `fDT`.
 */
export function createScreensInbox(dependencies: AnyDeps) {
  /**
   * Collects unique email accounts (from sent emails and registered users)
   * so users can see which inboxes have messages during demo/testing.
   */
  function getAvailableEmailAccounts(): Array<{
    email: string;
    name: string;
    unreadCount: number;
    totalCount: number;
  }> {
    const accountMap = new Map<
      string,
      { email: string; name: string; unreadCount: number; totalCount: number }
    >();

    // 1. Include registered OneID users from S.users
    const usersRecord = dependencies.S.users || {};
    Object.keys(usersRecord).forEach((nid) => {
      const user = usersRecord[nid];
      const normalizedEmail = String(user?.email || "")
        .trim()
        .toLowerCase();
      if (!normalizedEmail) return;
      if (!accountMap.has(normalizedEmail)) {
        accountMap.set(normalizedEmail, {
          email: normalizedEmail,
          name: user.name || normalizedEmail,
          unreadCount: 0,
          totalCount: 0,
        });
      }
    });

    // 2. Include all recipients in S.emails and count their messages
    const allEmails: EmailMessage[] = dependencies.S.emails || [];
    allEmails.forEach((message) => {
      const normalizedEmail = String(message.to || "")
        .trim()
        .toLowerCase();
      if (!normalizedEmail) return;
      const existing = accountMap.get(normalizedEmail);
      if (existing) {
        existing.totalCount += 1;
        if (!message.read) existing.unreadCount += 1;
        if (!existing.name && message.toName) existing.name = message.toName;
      } else {
        accountMap.set(normalizedEmail, {
          email: normalizedEmail,
          name: message.toName || normalizedEmail,
          unreadCount: message.read ? 0 : 1,
          totalCount: 1,
        });
      }
    });

    return Array.from(accountMap.values()).sort((first, second) => {
      if (second.unreadCount !== first.unreadCount) {
        return second.unreadCount - first.unreadCount;
      }
      return second.totalCount - first.totalCount;
    });
  }

  /**
   * Renders the Email Sign-In screen when no email account is currently signed in (`!UI.inbox.auth`).
   */
  function renderEmailLoginScreen(): string {
    const inboxState = dependencies.UI.inbox;
    const availableAccounts = getAvailableEmailAccounts();

    const accountChipsHtml = availableAccounts.length
      ? `
        <div class="gx-demo" aria-label="Email accounts with messages">
          <span>Quick fill inbox:</span>
          ${availableAccounts
            .map((account) => {
              const badgeText = account.unreadCount
                ? ` (${account.unreadCount} new)`
                : account.totalCount
                  ? ` (${account.totalCount})`
                  : "";
              return `
                <button
                  type="button"
                  class="gx-chip"
                  data-act="maildemo"
                  data-email="${dependencies.esc(account.email)}"
                >
                  ${dependencies.esc(account.email)}${dependencies.esc(badgeText)}
                </button>
              `;
            })
            .join("")}
        </div>
      `
      : "";

    return `
      <div class="gx gx-only">
        <main class="gx-solo">
          <form class="gx-card" onsubmit="return false">
            <div class="gx-head">
              <div class="gx-emb">📧</div>
              <div>
                <div class="gx-g1">ইমেইল ইনবক্স · Citizen &amp; Registrar Webmail</div>
                <h2>Sign in to Email</h2>
              </div>
            </div>
            <div style="margin-bottom:14px;padding:10px 12px;border-radius:10px;background:var(--bg2,#F4F6FA);border:1px solid var(--bd,#E2E8F0);font-size:13px">
              Sign in with your <b>email address</b> and <b>password</b> to view only the emails sent to you.
            </div>
            ${inboxState.err ? `<p class="gx-err" role="alert">${dependencies.esc(inboxState.err)}</p>` : ""}
            <label class="gx-l">
              Email address
              <input
                class="gx-in"
                type="email"
                data-mailid="1"
                autocomplete="username"
                value="${dependencies.esc(inboxState.emailInput || "")}"
                placeholder="you@mail.com"
              >
            </label>
            <label class="gx-l">
              Password
              <input
                class="gx-in"
                type="password"
                data-mailpw="1"
                autocomplete="current-password"
                value="${dependencies.esc(inboxState.passwordInput || "")}"
                placeholder="Enter your password"
              >
            </label>
            <button type="button" class="gx-btn" data-act="maillogin">
              Sign in to Email
            </button>
          </form>
          ${accountChipsHtml}
        </main>
      </div>
    `;
  }

  /**
   * Renders a single email row inside the user's personal inbox sidebar list.
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
   * Renders the Email Inbox screen (`/inbox`).
   * - If not signed in (`!UI.inbox.auth`), shows the Email Sign-In screen.
   * - Once signed in, displays only emails addressed to `UI.inbox.auth`.
   */
  function inboxPage(): string {
    const signedInEmail = dependencies.UI.inbox.auth?.trim().toLowerCase() || "";
    if (!signedInEmail) {
      return renderEmailLoginScreen();
    }

    const allEmails: EmailMessage[] = dependencies.S.emails || [];
    const myEmails = allEmails.filter(
      (email) =>
        String(email.to || "")
          .trim()
          .toLowerCase() === signedInEmail,
    );

    const selectedEmailId: string | null = dependencies.UI.inbox.id;
    const selectedEmail = myEmails.find((email) => email.id === selectedEmailId);

    const emailListHtml = myEmails.length
      ? myEmails.map((email) => renderEmailListItem(email, selectedEmail)).join("")
      : `<li class="empty">No emails for ${dependencies.esc(signedInEmail)} yet.</li>`;

    return `
      <div class="banner">
        <div>
          <h2>Email inbox · ${dependencies.esc(signedInEmail)}</h2>
          <p>Showing only emails sent to ${dependencies.esc(signedInEmail)} (${myEmails.length} total).</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <button class="btn bs" data-act="maillogout">Switch email / Sign out</button>
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
