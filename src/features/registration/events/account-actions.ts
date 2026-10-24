import type { AnyDeps } from "../types";

/** Account commands, isolated from other portal actions. */
export function createAccountActions(dependencies: AnyDeps) {
  return async function handleAccount(act: string, b: HTMLElement): Promise<boolean> {
    switch (act) {
      case "signinroute": {
        const nextRole = b.dataset["role"] || "applicant";
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
        dependencies.startOnb(b.dataset["p"]);
        break;
      case "signinnew": {
        dependencies.closeModal();
        const pp = b.dataset["p"] ?? "",
          n = b.dataset["n"] ?? "",
          pend =
            dependencies.UI.pending &&
            dependencies.UI.pending.p === pp &&
            dependencies.UI.pending.nid === n
              ? dependencies.UI.pending
              : null;
        dependencies.doLogin(pp, n, pend ? pend.appId : null);
        break;
      }
      case "sfill": {
        const n = b.dataset["n"] ?? "";
        const nidInput = dependencies.$("#su-nid") as HTMLInputElement | null,
          dobInput = dependencies.$("#su-dob") as HTMLInputElement | null,
          mobInput = dependencies.$("#su-mob") as HTMLInputElement | null,
          mailInput = dependencies.$("#su-mail") as HTMLInputElement | null,
          licInput = dependencies.$("#su-lic") as HTMLInputElement | null;
        const lic = dependencies.licOf(n);
        if (nidInput) nidInput.value = n;
        if (dobInput) dobInput.value = dependencies.PEOPLE[n]?.dob ?? "";
        if (mobInput)
          mobInput.value = lic ? dependencies.REGISTRARS[lic].mobile : "017" + n.slice(-8);
        if (mailInput)
          mailInput.value = lic
            ? dependencies.REGISTRARS[lic].email
            : (dependencies.PEOPLE[n]?.en ?? n)
                .toLowerCase()
                .replace(/[^a-z]+/g, ".")
                .replace(/^\.|\.$/g, "") + "@mail.com";
        if (licInput) licInput.value = lic || "";
        break;
      }
      case "homesignin":
      case "homesignup": {
        const H = dependencies.UI.home;
        if (!H.role) H.role = "applicant";
        const rr: string = H.role;
        if (act === "homesignup") {
          if (rr === "admin" || rr === "super") {
            H.err = "Official accounts can't sign up here.";
            dependencies.render();
            break;
          }
          dependencies.startOnb(rr);
          break;
        }
        const idv = (H.id || "").trim().toLowerCase(),
          pwv = H.pw || "";
        if (!idv || !pwv) {
          H.err =
            rr === "admin" || rr === "super"
              ? "Enter your official email and password."
              : "Enter your email or mobile and your password.";
          dependencies.render();
          break;
        }
        if (rr === "admin" || rr === "super") {
          const ok =
            rr === "super" ? "rafiqul.islam@lawjustice.gov.bd" : "farhana.akter@lawjustice.gov.bd";
          if (idv !== ok) {
            H.err =
              "This email isn't a registered " +
              (rr === "super" ? "Super Admin" : "Admin") +
              " account.";
            dependencies.render();
            break;
          }
          H.id = "";
          H.pw = "";
          H.err = "";
          dependencies.UI.portal = "enl";
          window.ENLBridge?.signIn(rr);
          dependencies.render();
          window.scrollTo(0, 0);
          dependencies.toast("Signed in");
          break;
        }
        const okRoles =
          rr === "applicant" ? ["Applicant"] : ["Marriage Registrar", "Registrar applicant"];
        const digitsOnly = idv.replace(/\D/g, "");
        const normalizedMobile = digitsOnly.length === 10 ? "0" + digitsOnly : digitsOnly;
        const nid = Object.keys(dependencies.S.users).find((n) => {
          const u = dependencies.S.users[n];
          if (!okRoles.includes(u.role)) return false;
          const emailMatch = (u.email || "").toLowerCase() === idv;
          const mobileMatch =
            Boolean(normalizedMobile) &&
            ((u.mobile || "") === normalizedMobile || (u.mobile || "") === idv.replace(/\s+/g, ""));
          const nidMatch = n === idv;
          return emailMatch || mobileMatch || nidMatch;
        });
        if (!nid) {
          H.err =
            "No " +
            (rr === "applicant" ? "applicant" : "registrar") +
            " OneID account matches this email or mobile. Check it, or sign up.";
          dependencies.render();
          break;
        }
        const matchedUser = dependencies.S.users[nid];
        if (matchedUser?.password && matchedUser.password !== pwv) {
          H.err = "Incorrect password for this account. Please try again.";
          dependencies.render();
          break;
        }
        H.id = "";
        H.pw = "";
        H.err = "";
        dependencies.UI.portal = rr;
        dependencies.doLogin(rr, nid);
        break;
      }
      case "homedemo": {
        const val = b.dataset["v"] ?? "";
        dependencies.UI.home.id = val;
        const matchedNid = Object.keys(dependencies.S.users).find(
          (n) => (dependencies.S.users[n].email || "").toLowerCase() === val.toLowerCase(),
        );
        const savedPw = matchedNid ? dependencies.S.users[matchedNid]?.password : "";
        dependencies.UI.home.pw = savedPw || "demo-pass";
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
