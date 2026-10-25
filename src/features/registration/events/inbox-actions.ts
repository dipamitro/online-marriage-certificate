import type { AnyDeps, ApplicationRecord, EmailMessage } from "../types";

/**
 * Handles Email Inbox actions: selecting an email (`mail`), returning to the inbox list (`mailback`),
 * and following actionable deep-links inside an email (`maillink`).
 */
export function createInboxActions(dependencies: AnyDeps) {
  return async function handleInbox(action: string, button: HTMLElement): Promise<boolean> {
    const emailId = button.dataset["id"];
    const scrollToTop = () => window.scrollTo(0, 0);

    switch (action) {
      case "mail": {
        const emailMessage: EmailMessage | undefined = dependencies.S.emails.find(
          (item: EmailMessage) => item.id === emailId,
        );
        if (emailMessage) {
          emailMessage.read = true;
          dependencies.UI.inbox.id = emailId ?? null;
          dependencies.save();
          dependencies.render();
        }
        break;
      }

      case "mailback":
        dependencies.UI.inbox.id = null;
        dependencies.render();
        break;

      case "maillink": {
        const emailMessage: EmailMessage | undefined = dependencies.S.emails.find(
          (item: EmailMessage) => item.id === emailId,
        );
        if (!emailMessage) break;

        const emailLink = emailMessage.link;

        // 1. eSign invitation link or OneID Wallet delivery link
        if (emailLink.type === "esign" || emailLink.type === "vault") {
          const targetPortal = emailLink.type === "esign" ? "applicant" : "wallet";
          const targetAppId =
            emailLink.type === "esign"
              ? (
                  dependencies.S.apps.find(
                    (app: ApplicationRecord) =>
                      app.status === "esign" &&
                      (dependencies.toEn(app.f.groom.nid) === emailLink.nid ||
                        dependencies.toEn(app.f.bride.nid) === emailLink.nid),
                  ) || {}
                ).id
              : emailLink.appId;

          const targetNid = emailLink.nid ?? "";
          dependencies.UI.portal = targetPortal;
          dependencies.UI.login[targetPortal] = targetNid;

          if (dependencies.userOf(targetNid)) {
            dependencies.doLogin(targetPortal, targetNid, targetAppId, emailLink.type === "esign");
          } else {
            const personDisplayName = dependencies.esc(
              dependencies.PEOPLE[targetNid] ? dependencies.PEOPLE[targetNid].en : "You",
            );
            const postSignupDestination =
              targetPortal === "applicant"
                ? "eSign the application from My eSign"
                : "open your wallet";

            dependencies.UI.auth[targetPortal] = null;
            dependencies.UI.pending = {
              p: targetPortal,
              nid: targetNid,
              appId: targetAppId,
              esign: emailLink.type === "esign",
              msg: `<b>${personDisplayName}</b>, you don't have an account yet. Please <b>sign up with OneID eKYC</b> first. After that you can ${postSignupDestination} without doing eKYC again.`,
            };
            dependencies.render();
            scrollToTop();
          }
          break;
        }

        // 2. Document preview, Registrar desk, or Applicant detail link
        if (emailLink.type === "doc") {
          dependencies.UI.portal = "doc";
          dependencies.UI.doc = emailLink.appId ?? null;
        } else if (emailLink.type === "registrar" && emailLink.lic) {
          dependencies.UI.portal = "registrar";
          dependencies.doLogin(
            "registrar",
            dependencies.REGISTRARS[emailLink.lic].nid,
            emailLink.appId,
          );
          break;
        } else {
          dependencies.UI.portal = "applicant";
          dependencies.UI.auth.applicant = emailLink.uid ?? null;
          dependencies.UI.open.applicant = emailLink.appId ?? null;
        }

        dependencies.UI.accept = false;
        dependencies.render();
        scrollToTop();
        break;
      }

      default:
        return false;
    }

    return true;
  };
}
