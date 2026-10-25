import type { AnyDeps } from "../types";

/**
 * Handles Sign-In form submission (`homesignin`), OneID eKYC sign-up triggers (`homesignup`, `signup`),
 * role route switching (`signinroute`), and demo account autofill (`homedemo`, `sfill`).
 */
export function createAccountActions(dependencies: AnyDeps) {
  return async function handleAccount(action: string, button: HTMLElement): Promise<boolean> {
    switch (action) {
      case "signinroute": {
        const nextRole = button.dataset["role"] || "applicant";
        dependencies.UI.home.role = nextRole;
        dependencies.UI.home.err = "";
        dependencies.UI.home.id = "";
        dependencies.UI.home.pw = "";
        dependencies.UI.portal = "home";
        dependencies.render();
        window.OMRBridge?.onSignInRoleChange?.(nextRole);
        break;
      }

      case "signup":
        dependencies.startOnb(button.dataset["p"]);
        break;

      case "signinnew": {
        dependencies.closeModal();
        const targetPortal = button.dataset["p"] ?? "";
        const nid = button.dataset["n"] ?? "";
        const pendingRedirect =
          dependencies.UI.pending &&
          dependencies.UI.pending.p === targetPortal &&
          dependencies.UI.pending.nid === nid
            ? dependencies.UI.pending
            : null;
        dependencies.doLogin(targetPortal, nid, pendingRedirect ? pendingRedirect.appId : null);
        break;
      }

      case "sfill": {
        const nid = button.dataset["n"] ?? "";
        const nidInput = dependencies.$("#su-nid") as HTMLInputElement | null;
        const dobInput = dependencies.$("#su-dob") as HTMLInputElement | null;
        const mobileInput = dependencies.$("#su-mob") as HTMLInputElement | null;
        const emailInput = dependencies.$("#su-mail") as HTMLInputElement | null;
        const licenceInput = dependencies.$("#su-lic") as HTMLInputElement | null;

        const licenceNo = dependencies.licOf(nid);
        if (nidInput) nidInput.value = nid;
        if (dobInput) dobInput.value = dependencies.PEOPLE[nid]?.dob ?? "";
        if (mobileInput) {
          mobileInput.value = licenceNo
            ? dependencies.REGISTRARS[licenceNo].mobile
            : "017" + nid.slice(-8);
        }
        if (emailInput) {
          emailInput.value = licenceNo
            ? dependencies.REGISTRARS[licenceNo].email
            : (dependencies.PEOPLE[nid]?.en ?? nid)
                .toLowerCase()
                .replace(/[^a-z]+/g, ".")
                .replace(/^\.|\.$/g, "") + "@mail.com";
        }
        if (licenceInput) licenceInput.value = licenceNo || "";
        break;
      }

      case "homesignin":
      case "homesignup": {
        const homeState = dependencies.UI.home;
        if (!homeState.role) {
          homeState.role = "applicant";
        }
        const activeRole: string = homeState.role;

        // 1. Handle clicking "Sign up with OneID eKYC"
        if (action === "homesignup") {
          if (activeRole === "admin" || activeRole === "super") {
            homeState.err = "Official accounts can't sign up here.";
            dependencies.render();
            break;
          }
          dependencies.startOnb(activeRole);
          break;
        }

        // 2. Validate credentials on Sign-In
        const identifierInput = (homeState.id || "").trim().toLowerCase();
        const passwordInput = homeState.pw || "";

        if (!identifierInput || !passwordInput) {
          homeState.err =
            activeRole === "admin" || activeRole === "super"
              ? "Enter your official email and password."
              : "Enter your email or mobile and your password.";
          dependencies.render();
          break;
        }

        // 3. Official Admin / Super Admin sign-in
        if (activeRole === "admin" || activeRole === "super") {
          const expectedOfficialEmail =
            activeRole === "super"
              ? "rafiqul.islam@lawjustice.gov.bd"
              : "farhana.akter@lawjustice.gov.bd";

          if (identifierInput !== expectedOfficialEmail) {
            homeState.err =
              "This email isn't a registered " +
              (activeRole === "super" ? "Super Admin" : "Admin") +
              " account.";
            dependencies.render();
            break;
          }

          homeState.id = "";
          homeState.pw = "";
          homeState.err = "";
          dependencies.UI.portal = "enl";
          window.ENLBridge?.signIn(activeRole);
          dependencies.render();
          window.scrollTo(0, 0);
          dependencies.toast("Signed in");
          break;
        }

        // 4. Citizen Applicant or Marriage Registrar sign-in (matches email, mobile, or NID)
        const allowedUserRoles =
          activeRole === "applicant"
            ? ["Applicant"]
            : ["Marriage Registrar", "Registrar applicant"];

        const digitsOnly = identifierInput.replace(/\D/g, "");
        const normalizedMobile = digitsOnly.length === 10 ? "0" + digitsOnly : digitsOnly;

        const matchedNid = Object.keys(dependencies.S.users).find((nid) => {
          const userRecord = dependencies.S.users[nid];
          if (!allowedUserRoles.includes(userRecord.role)) return false;

          const emailMatches = (userRecord.email || "").toLowerCase() === identifierInput;
          const mobileMatches =
            Boolean(normalizedMobile) &&
            ((userRecord.mobile || "") === normalizedMobile ||
              (userRecord.mobile || "") === identifierInput.replace(/\s+/g, ""));
          const nidMatches = nid === identifierInput;

          return emailMatches || mobileMatches || nidMatches;
        });

        if (!matchedNid) {
          homeState.err =
            "No " +
            (activeRole === "applicant" ? "applicant" : "registrar") +
            " OneID account matches this email or mobile. Check it, or sign up.";
          dependencies.render();
          break;
        }

        const matchedUser = dependencies.S.users[matchedNid];
        if (matchedUser?.password && matchedUser.password !== passwordInput) {
          homeState.err = "Incorrect password for this account. Please try again.";
          dependencies.render();
          break;
        }

        homeState.id = "";
        homeState.pw = "";
        homeState.err = "";
        dependencies.UI.portal = activeRole;
        dependencies.doLogin(activeRole, matchedNid);
        break;
      }

      case "homedemo": {
        const demoEmail = button.dataset["v"] ?? "";
        dependencies.UI.home.id = demoEmail;
        const matchedNid = Object.keys(dependencies.S.users).find(
          (nid) =>
            (dependencies.S.users[nid].email || "").toLowerCase() === demoEmail.toLowerCase(),
        );
        const savedPassword = matchedNid ? dependencies.S.users[matchedNid]?.password : "";
        dependencies.UI.home.pw = savedPassword || "demo-pass";
        dependencies.UI.home.err = "";
        dependencies.render();
        break;
      }

      default:
        return false;
    }

    return true;
  };
}
