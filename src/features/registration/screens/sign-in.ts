import type { AnyDeps } from "../types";

interface RoleMetadata {
  labelEn: string;
  labelBn: string;
  shortLabel: string;
  route: string;
}

interface PortalLoginConfig {
  mark: string;
  title: string;
  subtitle: string;
  headingHtml: string;
  description: string;
  bulletPoints: string[];
  buttonLabel: string;
}

/**
 * Metadata for each dedicated role sign-in route:
 * - `/applicant/sign-in`
 * - `/marriage_resistar/sign-in`
 * - `/admin/sign-in`
 * - `/superadmin/sign-in`
 */
const SIGN_IN_ROLE_META: Record<string, RoleMetadata> = {
  applicant: {
    labelEn: "Marriage certificate applicant",
    labelBn: "বিবাহ নিবন্ধন আবেদনকারী",
    shortLabel: "Applicant",
    route: "/applicant/sign-in",
  },
  registrar: {
    labelEn: "Marriage registrar",
    labelBn: "নিকাহ রেজিস্ট্রার",
    shortLabel: "Marriage Registrar",
    route: "/marriage_resistar/sign-in",
  },
  admin: {
    labelEn: "Admin",
    labelBn: "অ্যাডমিন",
    shortLabel: "Admin",
    route: "/admin/sign-in",
  },
  super: {
    labelEn: "Super Admin",
    labelBn: "সুপার অ্যাডমিন",
    shortLabel: "Super Admin",
    route: "/superadmin/sign-in",
  },
};

/**
 * Configuration for the secondary portal login cards (`applicant`, `esign`, `registrar`).
 */
const PORTAL_LOGIN_CONFIG: Record<"applicant" | "esign" | "registrar", PortalLoginConfig> = {
  applicant: {
    mark: "BD",
    title: "Online Marriage Registration",
    subtitle: "Applicant Portal",
    headingHtml: "Register your marriage, <em>fully online.</em>",
    description:
      "Sign up once with OneID eKYC, then sign in to fill in the marriage registration application. The bride and groom accept it with eSign.",
    bulletPoints: [
      "Sign up once with OneID eKYC (NID + face)",
      "Online application with all Nikahnama details",
      "Bride & groom eSign, no repeat eKYC",
      "Registrar appraisal and approval with eSign",
      "Digital Nikahnama sent to your OneID Vault",
    ],
    buttonLabel: "Sign In",
  },
  esign: {
    mark: "eS",
    title: "Bride & Groom eSign",
    subtitle: "Identity by OneID",
    headingHtml: "Sign up once, <em>then eSign.</em>",
    description:
      "The bride and groom each sign up with OneID eKYC (NID and face check). After that they only review the application and accept it with their electronic signature.",
    bulletPoints: [
      "eKYC once, at sign-up",
      "Review every detail of the application",
      "eSign confirmed by an SMS code",
    ],
    buttonLabel: "Sign In",
  },
  registrar: {
    mark: "MR",
    title: "Marriage Registrar",
    subtitle: "Enlistment and registrar desk",
    headingHtml: "Become a registrar, <em>then serve online.</em>",
    description:
      "Sign up once with OneID eKYC. If you are not enlisted yet, you apply for enlistment for your wards. Once an Admin or the Super Admin approves you with eSign, the same sign-in opens your registrar desk with your marriage requests.",
    bulletPoints: [
      "Sign up once with OneID eKYC",
      "Apply for enlistment, track approval",
      "Appraisal: accept or revert to applicant",
      "Approve with eSign, no repeat eKYC",
      "Query and verification",
    ],
    buttonLabel: "Sign In to Registrar Portal",
  },
};

/**
 * Renders the role-specific Sign-In screens (`/applicant/sign-in`, `/marriage_resistar/sign-in`,
 * `/admin/sign-in`, `/superadmin/sign-in`) and secondary portal login views.
 *
 * Dependencies: `IC`, `PEOPLE`, `S`, `UI`, `esc`, `licOf`.
 */
export function createScreensSignIn(dependencies: AnyDeps) {
  /**
   * Renders the primary role-based Sign-In card for the current route role.
   */
  function roleHome(): string {
    const homeState = dependencies.UI.home;
    if (!homeState.role) {
      homeState.role = "applicant";
    }

    const activeRole: string = homeState.role;
    const isOfficialRole = activeRole === "admin" || activeRole === "super";
    const roleMeta = SIGN_IN_ROLE_META[activeRole] ?? SIGN_IN_ROLE_META["applicant"]!;

    const roleBannerHtml = `
      <div style="margin-bottom:14px;padding:10px 12px;border-radius:10px;background:var(--bg2,#F4F6FA);border:1px solid var(--bd,#E2E8F0);font-size:13px">
        <b>${dependencies.esc(roleMeta.labelEn)}</b>
        <span class="bn" style="color:var(--tx2)">(${dependencies.esc(roleMeta.labelBn)})</span>
      </div>
    `;

    const identifierFieldHtml = `
      <label class="gx-l">
        ${isOfficialRole ? "Official email" : "Email or mobile (OneID)"}
        <input
          class="gx-in"
          data-homeid="1"
          autocomplete="username"
          value="${dependencies.esc(homeState.id || "")}"
          placeholder="${isOfficialRole ? "name@lawjustice.gov.bd" : "you@mail.com or 01XXXXXXXXX"}"
        >
      </label>
    `;

    const signUpOrOfficialNoteHtml = isOfficialRole
      ? `<p class="gx-note">Official accounts are created by the Super Admin. A one-time code is sent to your registered mobile.</p>`
      : `<button type="button" class="gx-btn2" data-act="homesignup">
           ${activeRole === "registrar" ? "Sign up with OneID eKYC to apply for enlistment" : "Sign up with OneID eKYC"}
         </button>`;

    return `
      <div class="gx gx-only">
        <main class="gx-solo">
          <form class="gx-card" onsubmit="return false">
            <div class="gx-head">
              <div class="gx-emb">GoB</div>
              <div>
                <div class="gx-g1">অনলাইন বিবাহ নিবন্ধন</div>
                <h2>Sign in · ${dependencies.esc(roleMeta.shortLabel)}</h2>
              </div>
            </div>
            ${roleBannerHtml}
            ${homeState.err ? `<p class="gx-err" role="alert">${dependencies.esc(homeState.err)}</p>` : ""}
            ${identifierFieldHtml}
            <label class="gx-l">
              Password
              <input
                class="gx-in"
                type="password"
                data-homepw="1"
                autocomplete="current-password"
                value="${dependencies.esc(homeState.pw || "")}"
                placeholder="Enter your password"
              >
            </label>
            <div class="gx-row">
              <label class="gx-chk"><input type="checkbox">Keep me signed in</label>
              <button class="link" type="button">Forgot password?</button>
            </div>
            <button type="button" class="gx-btn" data-act="homesignin">
              ${isOfficialRole ? "Sign in" : "Sign in with OneID"}
            </button>
            ${signUpOrOfficialNoteHtml}
          </form>
          <p class="gx-foot2">
            Checking a document?
            <button class="link" data-act="portal" data-p="verify">Verify a Nikahnama or certificate</button>
          </p>
        </main>
      </div>
    `;
  }

  /**
   * Renders the "Sign up with OneID eKYC" call-to-action section inside secondary login cards.
   */
  function signupBox(portalKey: string): string {
    const userIconHtml = dependencies.IC.user.replace("<svg", '<svg width="16" height="16"');
    const buttonText =
      portalKey === "registrar"
        ? "Sign up with OneID eKYC to apply for enlistment"
        : "Sign up with OneID eKYC";

    return `
      <div class="or">New here?</div>
      <button class="btn bs bfw" data-act="signup" data-p="${portalKey}">
        ${userIconHtml} ${buttonText}
      </button>
      <p style="font-size:11.5px;color:var(--tx3);text-align:center;margin-top:8px">
        Don't have an account? Sign up: email, phone, OTP, password, then eKYC (NID scan + face). You won't need eKYC again to eSign.
      </p>
    `;
  }

  /**
   * Renders the account `<select>` dropdown for secondary portal login screens.
   */
  function userOptions(portalKey: string): string {
    const userNids = Object.keys(dependencies.S.users);

    if (!userNids.includes(dependencies.UI.login[portalKey])) {
      dependencies.UI.login[portalKey] = userNids[0] || "";
    }

    if (!userNids.length) {
      return `<p class="feebox">No accounts yet. Sign up first.</p>`;
    }

    const optionsHtml = userNids
      .map((nid) => {
        const isSelected = dependencies.UI.login[portalKey] === nid ? "selected" : "";
        const displayName = dependencies.esc(
          dependencies.PEOPLE[nid]?.en ?? dependencies.S.users[nid]?.name ?? nid,
        );
        const licenceNumber = dependencies.licOf(nid);
        const suffix =
          portalKey === "registrar"
            ? licenceNumber
              ? ` · enlisted ${licenceNumber}`
              : " · not enlisted"
            : ` (NID ••••${nid.slice(-4)})`;

        return `<option value="${nid}" ${isSelected}>${displayName}${suffix}</option>`;
      })
      .join("");

    return `<select class="inp" data-login="${portalKey}">${optionsHtml}</select>`;
  }

  /**
   * Renders the two-column login card for `applicant`, `esign`, or `registrar` portals
   * when accessed directly without an active session.
   */
  function loginPage(portalKey: string): string {
    const pendingRedirect =
      dependencies.UI.pending && dependencies.UI.pending.p === portalKey
        ? dependencies.UI.pending
        : null;

    const config = PORTAL_LOGIN_CONFIG[portalKey as "applicant" | "esign" | "registrar"];
    if (!config) {
      return "";
    }

    const bulletListHtml = config.bulletPoints.map((item) => `<li>${item}</li>`).join("");

    return `
      <div class="login">
        <div class="lcard">
          <div class="lleft">
            <h1>${config.headingHtml}</h1>
            <p>${config.description}</p>
            <ul>${bulletListHtml}</ul>
          </div>
          <div class="lright">
            <div class="brandrow">
              <div class="mark">${config.mark}</div>
              <div>
                <b>${config.title}</b>
                <span>${config.subtitle}</span>
              </div>
            </div>
            <h2>Sign in</h2>
            <p class="sub">Government of the People's Republic of Bangladesh</p>
            ${pendingRedirect ? `<div class="feebox" style="margin-bottom:12px">${pendingRedirect.msg}</div>` : ""}
            <div class="fg">
              <label>
                ${portalKey === "registrar" ? "Registrar account" : "OneID account"}
                <span style="font-weight:400;color:var(--tx3)">(signed-up users)</span>
              </label>
              ${userOptions(portalKey)}
            </div>
            <div class="fg">
              <label>Password</label>
              <input class="inp" type="password" value="demo-pass" readonly>
            </div>
            <button class="btn bp bfw" data-act="login" data-p="${portalKey}">${config.buttonLabel}</button>
            ${signupBox(portalKey)}
            <p style="font-size:11px;color:var(--tx3);text-align:center;margin-top:14px">
              Prototype · OneID, eKYC, eSign, email and SMS are simulated
            </p>
          </div>
        </div>
      </div>
    `;
  }

  return { roleHome, signupBox, userOptions, loginPage };
}
