import type { AnyDeps } from "../types";

/** screens/sign-in. Dependencies: IC, PEOPLE, S, UI, esc, licOf. */
export function createScreensSignIn(dependencies: AnyDeps) {
  const ROLE_META: Record<
    string,
    { labelEn: string; labelBn: string; shortLabel: string; route: string }
  > = {
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

  function roleHome(): string {
    const H = dependencies.UI.home;
    if (!H.role) H.role = "applicant";
    const role: string = H.role,
      official = role === "admin" || role === "super",
      meta = ROLE_META[role] ?? ROLE_META["applicant"]!;
    const accts =
      role === "applicant"
        ? Object.keys(dependencies.S.users).filter(
            (n) => dependencies.S.users[n].role === "Applicant",
          )
        : role === "registrar"
          ? Object.keys(dependencies.S.users).filter((n) =>
              ["Marriage Registrar", "Registrar applicant"].includes(dependencies.S.users[n].role),
            )
          : [];
    const demoIds: string[] = official
      ? [role === "super" ? "rafiqul.islam@lawjustice.gov.bd" : "farhana.akter@lawjustice.gov.bd"]
      : accts
          .slice()
          .sort((x, y) => {
            // Put newly created custom accounts (with password) first, then enlisted registrars
            const xCustom = dependencies.S.users[x]?.password ? 1 : 0;
            const yCustom = dependencies.S.users[y]?.password ? 1 : 0;
            if (xCustom !== yCustom) return yCustom - xCustom;
            return (dependencies.licOf(y) ? 1 : 0) - (dependencies.licOf(x) ? 1 : 0);
          })
          .slice(0, 6)
          .map((n) => dependencies.S.users[n].email);

    const roleTabs = `<nav class="gx-demo" style="margin-top:0;margin-bottom:14px;justify-content:flex-start" aria-label="Sign-in portals">${Object.entries(
      ROLE_META,
    )
      .map(
        ([k, m]) =>
          `<button type="button" class="gx-chip ${role === k ? "on" : ""}" style="${role === k ? "background:var(--pri);color:#fff;border-color:var(--pri);font-weight:600" : ""}" data-act="signinroute" data-role="${k}">${dependencies.esc(m.shortLabel)}</button>`,
      )
      .join("")}</nav>`;

    const roleBanner = `<div style="margin-bottom:14px;padding:10px 12px;border-radius:10px;background:var(--bg2,#F4F6FA);border:1px solid var(--bd,#E2E8F0);font-size:13px"><b>${dependencies.esc(meta.labelEn)}</b> <span class="bn" style="color:var(--tx2)">(${dependencies.esc(meta.labelBn)})</span></div>`;

    const idField = `<label class="gx-l">${official ? "Official email" : "Email or mobile (OneID)"}<input class="gx-in" data-homeid="1" autocomplete="username" value="${dependencies.esc(H.id || "")}" placeholder="${official ? "name@lawjustice.gov.bd" : "you@mail.com or 01XXXXXXXXX"}"></label>`;
    return `<div class="gx gx-only"><main class="gx-solo"><form class="gx-card" onsubmit="return false">
      <div class="gx-head"><div class="gx-emb">GoB</div><div><div class="gx-g1">অনলাইন বিবাহ নিবন্ধন</div><h2>Sign in · ${dependencies.esc(meta.shortLabel)}</h2></div></div>
     
      ${roleBanner}
      ${H.err ? `<p class="gx-err" role="alert">${dependencies.esc(H.err)}</p>` : ""}
      ${idField}
      <label class="gx-l">Password<input class="gx-in" type="password" data-homepw="1" autocomplete="current-password" value="${dependencies.esc(H.pw || "")}" placeholder="Enter your password"></label>
      <div class="gx-row"><label class="gx-chk"><input type="checkbox">Keep me signed in</label><button class="link" type="button">Forgot password?</button></div>
      <button type="button" class="gx-btn" data-act="homesignin">${official ? "Sign in" : "Sign in with OneID"}</button>
      ${official ? `<p class="gx-note">Official accounts are created by the Super Admin. A one-time code is sent to your registered mobile.</p>` : `<button type="button" class="gx-btn2" data-act="homesignup">${role === "registrar" ? "Sign up with OneID eKYC to apply for enlistment" : "Sign up with OneID eKYC"}</button>`}
    </form>
   
    <p class="gx-foot2">Checking a document? <button class="link" data-act="portal" data-p="verify">Verify a Nikahnama or certificate</button></p></main></div>`;
  }
  function signupBox(p: string): string {
    return `<div class="or">New here?</div><button class="btn bs bfw" data-act="signup" data-p="${p}">${dependencies.IC.user.replace("<svg", '<svg width="16" height="16"')} ${p === "registrar" ? "Sign up with OneID eKYC to apply for enlistment" : "Sign up with OneID eKYC"}</button><p style="font-size:11.5px;color:var(--tx3);text-align:center;margin-top:8px">Don't have an account? Sign up: email, phone, OTP, password, then eKYC (NID scan + face). You won't need eKYC again to eSign.</p>`;
  }
  function userOptions(p: string): string {
    const list = Object.keys(dependencies.S.users);

    if (!list.includes(dependencies.UI.login[p])) dependencies.UI.login[p] = list[0] || "";
    return list.length
      ? `<select class="inp" data-login="${p}">${list.map((n) => `<option value="${n}" ${dependencies.UI.login[p] === n ? "selected" : ""}>${dependencies.esc(dependencies.PEOPLE[n]?.en ?? dependencies.S.users[n]?.name ?? n)}${p === "registrar" ? (dependencies.licOf(n) ? " · enlisted " + dependencies.licOf(n) : " · not enlisted") : " (NID ••••" + n.slice(-4) + ")"}</option>`).join("")}</select>`
      : `<p class="feebox">No accounts yet. Sign up first.</p>`;
  }
  function loginPage(p: string): string {
    const pend =
      dependencies.UI.pending && dependencies.UI.pending.p === p ? dependencies.UI.pending : null;
    const cfg = {
      applicant: {
        mark: "BD",
        t: "Online Marriage Registration",
        s: "Applicant Portal",
        h: "Register your marriage, <em>fully online.</em>",
        d: "Sign up once with OneID eKYC, then sign in to fill in the marriage registration application. The bride and groom accept it with eSign.",
        li: [
          "Sign up once with OneID eKYC (NID + face)",
          "Online application with all Nikahnama details",
          "Bride & groom eSign, no repeat eKYC",
          "Registrar appraisal and approval with eSign",
          "Digital Nikahnama sent to your OneID Vault",
        ],
        btn: "Sign In",
      },
      esign: {
        mark: "eS",
        t: "Bride & Groom eSign",
        s: "Identity by OneID",
        h: "Sign up once, <em>then eSign.</em>",
        d: "The bride and groom each sign up with OneID eKYC (NID and face check). After that they only review the application and accept it with their electronic signature.",
        li: [
          "eKYC once, at sign-up",
          "Review every detail of the application",
          "eSign confirmed by an SMS code",
        ],
        btn: "Sign In",
      },
      registrar: {
        mark: "MR",
        t: "Marriage Registrar",
        s: "Enlistment and registrar desk",
        h: "Become a registrar, <em>then serve online.</em>",
        d: "Sign up once with OneID eKYC. If you are not enlisted yet, you apply for enlistment for your wards. Once an Admin or the Super Admin approves you with eSign, the same sign-in opens your registrar desk with your marriage requests.",
        li: [
          "Sign up once with OneID eKYC",
          "Apply for enlistment, track approval",
          "Appraisal: accept or revert to applicant",
          "Approve with eSign, no repeat eKYC",
          "Query and verification",
        ],
        btn: "Sign In to Registrar Portal",
      },
    }[p as "applicant" | "esign" | "registrar"];
    if (!cfg) return "";
    return `<div class="login"><div class="lcard"><div class="lleft"><h1>${cfg.h}</h1><p>${cfg.d}</p><ul>${cfg.li.map((x) => `<li>${x}</li>`).join("")}</ul></div>
    <div class="lright"><div class="brandrow"><div class="mark">${cfg.mark}</div><div><b>${cfg.t}</b><span>${cfg.s}</span></div></div><h2>Sign in</h2><p class="sub">Government of the People's Republic of Bangladesh</p>
    ${pend ? `<div class="feebox" style="margin-bottom:12px">${pend.msg}</div>` : ""}
    <div class="fg"><label>${p === "registrar" ? "Registrar account" : "OneID account"} <span style="font-weight:400;color:var(--tx3)">(signed-up users)</span></label>${userOptions(p)}</div><div class="fg"><label>Password</label><input class="inp" type="password" value="demo-pass" readonly></div>
    <button class="btn bp bfw" data-act="login" data-p="${p}">${cfg.btn}</button>${signupBox(p)}
    <p style="font-size:11px;color:var(--tx3);text-align:center;margin-top:14px">Prototype · OneID, eKYC, eSign, email and SMS are simulated</p></div></div></div>`;
  }
  return { roleHome, signupBox, userOptions, loginPage };
}
