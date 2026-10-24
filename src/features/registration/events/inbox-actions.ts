import type { AnyDeps, ApplicationRecord, EmailMessage } from "../types";

/** Inbox commands, isolated from other portal actions. */
export function createInboxActions(dependencies: AnyDeps) {
  return async function handleInbox(act: string, b: HTMLElement): Promise<boolean> {
    const id = b.dataset["id"];
    const top = () => window.scrollTo(0, 0);
    switch (act) {
      case "mail": {
        const m: EmailMessage | undefined = dependencies.S.emails.find(
          (x: EmailMessage) => x.id === id,
        );
        if (m) {
          m.read = true;
          dependencies.UI.inbox.id = id ?? null;
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
        const msg: EmailMessage | undefined = dependencies.S.emails.find(
          (x: EmailMessage) => x.id === id,
        );
        if (!msg) break;
        const L = msg.link;
        if (L.type === "esign" || L.type === "vault") {
          const P2 = L.type === "esign" ? "applicant" : "wallet";
          const appId =
            L.type === "esign"
              ? (
                  dependencies.S.apps.find(
                    (x: ApplicationRecord) =>
                      x.status === "esign" &&
                      (dependencies.toEn(x.f.groom.nid) === L.nid ||
                        dependencies.toEn(x.f.bride.nid) === L.nid),
                  ) || {}
                ).id
              : L.appId;
          const targetNid = L.nid ?? "";
          dependencies.UI.portal = P2;
          dependencies.UI.login[P2] = targetNid;
          if (dependencies.userOf(targetNid))
            dependencies.doLogin(P2, targetNid, appId, L.type === "esign");
          else {
            dependencies.UI.auth[P2] = null;
            dependencies.UI.pending = {
              p: P2,
              nid: targetNid,
              appId,
              esign: L.type === "esign",
              msg: `<b>${dependencies.esc(dependencies.PEOPLE[targetNid] ? dependencies.PEOPLE[targetNid].en : "You")}</b>, you don't have an account yet. Please <b>sign up with OneID eKYC</b> first. After that you can ${P2 === "applicant" ? "eSign the application from My eSign" : "open your wallet"} without doing eKYC again.`,
            };
            dependencies.render();
            window.scrollTo(0, 0);
          }
          break;
        }
        if (L.type === "doc") {
          dependencies.UI.portal = "doc";
          dependencies.UI.doc = L.appId ?? null;
        } else if (L.type === "registrar" && L.lic) {
          dependencies.UI.portal = "registrar";
          dependencies.doLogin("registrar", dependencies.REGISTRARS[L.lic].nid, L.appId);
          break;
        } else {
          dependencies.UI.portal = "applicant";
          dependencies.UI.auth.applicant = L.uid ?? null;
          dependencies.UI.open.applicant = L.appId ?? null;
        }
        dependencies.UI.accept = false;
        dependencies.render();
        top();
        break;
      }
      default:
        return false;
    }
    return true;
  };
}
