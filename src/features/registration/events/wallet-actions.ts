import type { AnyDeps, EmailMessage } from "../types";

/** Wallet commands, isolated from other portal actions. */
export function createWalletActions(dependencies: AnyDeps) {
  return async function handleWallet(act: string, b: HTMLElement): Promise<boolean> {
    const id = b.dataset["id"] ?? null;
    const top = () => window.scrollTo(0, 0);
    switch (act) {
      case "openwallet": {
        const nid = b.dataset["nid"] ?? "";
        dependencies.UI.portal = "wallet";
        dependencies.UI.auth.wallet = nid;
        dependencies.UI.login.wallet = nid;
        dependencies.UI.wallet = { cat: "marriage", doc: null, sb: false };
        dependencies.markSeen(nid);
        dependencies.render();
        top();
        break;
      }
      case "wnav":
        if (["vault", "home"].includes(b.dataset["k"] ?? "")) {
          dependencies.UI.wallet = { cat: null, doc: null, sb: false };
          dependencies.render();
        } else dependencies.toast("Demo: only Document Vaults is active in this prototype");
        break;
      case "wcat":
        dependencies.UI.wallet.cat = b.dataset["k"] || null;
        dependencies.UI.wallet.doc = null;
        dependencies.UI.wallet.sb = false;
        if (b.dataset["k"] === "marriage" && dependencies.UI.auth.wallet) {
          dependencies.markSeen(dependencies.UI.auth.wallet);
        }
        dependencies.render();
        top();
        break;
      case "wview":
        dependencies.UI.wallet.doc = id;
        dependencies.UI.wallet.kind = b.dataset["kind"] || "nk";
        dependencies.render();
        top();
        break;
      case "wverc": {
        const a = dependencies.appById(id);
        if (a?.cert) {
          dependencies.UI.portal = "verify";
          dependencies.UI.verify.input = a.cert.vds;
          await dependencies.runVerify();
          top();
        }
        break;
      }
      case "wsb":
        dependencies.UI.wallet.sb = !dependencies.UI.wallet.sb;
        dependencies.render();
        break;
      case "wnote": {
        const n = dependencies.S.emails.filter(
          (m: EmailMessage) =>
            m.link.type === "vault" && m.link.nid === dependencies.UI.auth.wallet,
        ).length;
        dependencies.toast(
          n ? `${n} marriage certificate notification${n > 1 ? "s" : ""}` : "No new notifications",
        );
        break;
      }
      case "wdemo":
        dependencies.toast("Demo document: only Marriage Certificate is live in this prototype");
        break;
      default:
        return false;
    }
    return true;
  };
}
