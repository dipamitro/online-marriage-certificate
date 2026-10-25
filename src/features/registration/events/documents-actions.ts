import type { AnyDeps } from "../types";

/** Documents commands, isolated from other portal actions. */
export function createDocumentsActions(dependencies: AnyDeps) {
  return function handleDocuments(act: string, b: HTMLElement): boolean | Promise<boolean> {
    const id = b.dataset["id"];
    const top = () => window.scrollTo(0, 0);
    switch (act) {
      case "pdf":
      case "verifyapp":
      case "verify":
      case "vsample":
      case "vsamplec":
      case "vtamper":
        return (async () => {
          if (act === "pdf") {
            const a = dependencies.appById(id);
            if (a) await dependencies.downloadPdf(a, b.dataset["kind"]);
          } else if (act === "verifyapp") {
            const a = dependencies.appById(id);
            if (a) {
              dependencies.UI.portal = "verify";
              dependencies.UI.verify.input = a.vds;
              await dependencies.runVerify();
              top();
            }
          } else if (act === "verify") {
            await dependencies.runVerify();
          } else if (act === "vsample") {
            const a = dependencies.appById(id);
            if (a) {
              dependencies.UI.verify.input = a.vds;
              await dependencies.runVerify();
            }
          } else if (act === "vsamplec") {
            const a = dependencies.appById(id);
            if (a?.cert) {
              dependencies.UI.verify.input = a.cert.vds;
              await dependencies.runVerify();
            }
          } else if (act === "vtamper") {
            const a = dependencies.appById(id);
            if (a) {
              const f = a.vds.split("|");
              f[5] = (f[5] ?? "") + " Begum";
              dependencies.UI.verify.input = f.join("|");
              await dependencies.runVerify();
            }
          }
          return true;
        })();
      case "sigdetail": {
        const a = dependencies.appById(id);
        if (a) dependencies.sigDetail(a, b.dataset["k"]);
        break;
      }
      default:
        return false;
    }
    return true;
  };
}
