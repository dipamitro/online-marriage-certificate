import type { AnyDeps } from "../types";

/** Documents commands, isolated from other portal actions. */
export function createDocumentsActions(dependencies: AnyDeps) {
  return async function handleDocuments(act: string, b: HTMLElement): Promise<boolean> {
    const id = b.dataset["id"];
    const top = () => window.scrollTo(0, 0);
    switch (act) {
      case "pdf": {
        const a = dependencies.appById(id);
        if (a) await dependencies.downloadPdf(a, b.dataset["kind"]);
        break;
      }
      case "verifyapp": {
        const a = dependencies.appById(id);
        if (a) {
          dependencies.UI.portal = "verify";
          dependencies.UI.verify.input = a.vds;
          await dependencies.runVerify();
          top();
        }
        break;
      }
      case "sigdetail": {
        const a = dependencies.appById(id);
        if (a) dependencies.sigDetail(a, b.dataset["k"]);
        break;
      }
      case "verify":
        await dependencies.runVerify();
        break;
      case "vsample": {
        const a = dependencies.appById(id);
        if (a) {
          dependencies.UI.verify.input = a.vds;
          await dependencies.runVerify();
        }
        break;
      }
      case "vsamplec": {
        const a = dependencies.appById(id);
        if (a?.cert) {
          dependencies.UI.verify.input = a.cert.vds;
          await dependencies.runVerify();
        }
        break;
      }
      case "vtamper": {
        const a = dependencies.appById(id);
        if (a) {
          const f = a.vds.split("|");
          f[5] = (f[5] ?? "") + " Begum";
          dependencies.UI.verify.input = f.join("|");
          await dependencies.runVerify();
        }
        break;
      }
      default:
        return false;
    }
    return true;
  };
}
