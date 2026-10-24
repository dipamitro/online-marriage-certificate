import type { AnyDeps } from "../types";

/** Signing commands, isolated from other portal actions. */
export function createSigningActions(dependencies: AnyDeps) {
  return async function handleSigning(act: string, b: HTMLElement): Promise<boolean> {
    const id = b.dataset["id"];
    const top = () => window.scrollTo(0, 0);
    switch (act) {
      case "ekyc": {
        const a = dependencies.appById(id);
        if (a) dependencies.ekycModal(a, b.dataset["who"]);
        break;
      }
      case "kfill": {
        const n = b.dataset["n"] ?? "";
        const nidEl = dependencies.$("#k-nid") as HTMLInputElement | null,
          dobEl = dependencies.$("#k-dob") as HTMLInputElement | null;
        if (nidEl) nidEl.value = n;
        if (dobEl) dobEl.value = dependencies.PEOPLE[n] ? dependencies.PEOPLE[n].dob : "";
        break;
      }
      case "esign": {
        const a = dependencies.appById(id),
          k = (b.dataset["who"] ?? "groom") as "groom" | "bride";
        if (!a) break;
        dependencies.otpModal(
          "Accept with eSign",
          `You're signing the marriage registration application ${a.appNo} as the ${k}.`,
          a.f[k].mobile,
          async () => {
            const nidNorm = dependencies.toEn(a.f[k].nid).trim();
            const U = dependencies.userOf(nidNorm),
              O = dependencies.PEOPLE[nidNorm];
            a.esign[k].ekyc =
              U && U.ekyc && O
                ? {
                    ...U.ekyc,
                    nameMatch: (a.f[k].nameEn || "").trim().toLowerCase() === O.en.toLowerCase(),
                    oneName: O.en,
                  }
                : null;
            a.esign[k].sign = { at: dependencies.now(), serial: dependencies.serial() };
            dependencies.hist(
              a,
              a.f[k].nameEn,
              "Accepted with eSign (identity verified by eKYC at sign-up)",
            );
            if (a.esign.groom.sign && a.esign.bride.sign) {
              a.status = "appraisal";
              const R = dependencies.REGISTRARS[a.f.registrar];
              if (R) {
                dependencies.pushMail(
                  R.email,
                  dependencies.regName(a.f.registrar),
                  `New application for appraisal: ${a.appNo}`,
                  [
                    `The bride and groom have both eSigned application ${a.appNo} (${dependencies.coupleEn(a)}).`,
                    "Please review and accept it, or revert it to the applicant.",
                  ],
                  { type: "registrar", lic: a.f.registrar, appId: a.id },
                );
              }
            }
            dependencies.UI.accept = false;
            if (dependencies.UI.portal === "applicant") {
              dependencies.UI.open.esign = null;
              dependencies.UI.open.applicant = null;
              dependencies.UI.page.applicant = "dash";
            }
            dependencies.save();
            dependencies.render();
            window.scrollTo(0, 0);
            dependencies.toast(
              a.status === "appraisal"
                ? "Signed. Both have signed; sent to the registrar."
                : "Signed. Waiting for the other party.",
            );
          },
        );
        break;
      }
      case "accept": {
        const a = dependencies.appById(id);
        if (!a) break;
        a.status = "approval";
        a.reg.acceptedAt = dependencies.now();
        dependencies.hist(
          a,
          dependencies.regName(a.f.registrar),
          "Appraisal complete, application accepted",
        );
        dependencies.save();
        dependencies.render();
        top();
        dependencies.toast("Accepted. You can now approve with eSign.");
        break;
      }
      case "revert": {
        const a = dependencies.appById(id);
        if (!a) break;
        dependencies.modal(
          `<h3>Revert to applicant</h3><p class="sub">Explain the confusion or problem. The applicant corrects it and submits again; the bride and groom sign again.</p><div class="fg" style="margin-top:12px"><label>Reason</label><textarea class="inp" id="m-rs"></textarea></div><p class="err" id="m-err"></p><div class="row"><button class="btn bs" data-act="mclose">Cancel</button><button class="btn br" data-act="mok">Revert</button></div>`,
          () => {
            const rsEl = dependencies.$("#m-rs") as HTMLTextAreaElement | null;
            const t = (rsEl?.value ?? "").trim();
            if (!t) return "Enter a reason.";
            a.status = "reverted";
            a.revertReason = t;
            dependencies.hist(
              a,
              dependencies.regName(a.f.registrar),
              "Reverted to applicant: " + t,
            );
            const acc = dependencies.accOf(a.owner);
            dependencies.pushMail(
              acc.email,
              acc.name,
              `Your application ${a.appNo} needs correction`,
              [
                `Dear ${acc.name},`,
                `${dependencies.regName(a.f.registrar)} has reverted your marriage registration application with this note:`,
                t,
                "Please correct it and submit again.",
              ],
              { type: "applicant", uid: a.owner, appId: a.id },
            );
            dependencies.save();
            dependencies.UI.open.registrar = null;
            dependencies.render();
            dependencies.toast("Reverted to applicant");
            return "";
          },
        );
        break;
      }
      case "approve": {
        const a = dependencies.appById(id);
        if (!a) break;
        const R = dependencies.REGISTRARS[a.f.registrar];
        const RU = R ? dependencies.userOf(R.nid) : null;
        a.reg.ekyc = RU && RU.ekyc ? { ...RU.ekyc } : null;
        a.reg.acceptedAt = a.reg.acceptedAt || dependencies.now();
        dependencies.otpModal(
          "Approve with eSign",
          `Approving ${a.appNo} generates the Digital Nikahnama and the Marriage Certificate, each with the VDS, and sends both directly to the bride's and groom's OneID Vault.`,
          R?.mobile ?? "",
          async () => {
            a.reg.sign = { at: dependencies.now(), serial: dependencies.serial() };
            await dependencies.issue(a);
            dependencies.sendToVault(a);
            dependencies.save();
            dependencies.render();
            top();
            dependencies.toast(
              "Approved with eSign. Nikahnama and Marriage Certificate sent to the bride's and groom's OneID Vault.",
            );
          },
        );
        break;
      }
      case "sendvault": {
        const a = dependencies.appById(id);
        if (!a) break;
        dependencies.sendToVault(a);
        dependencies.save();
        dependencies.render();
        top();
        dependencies.toast("Sent to the bride's and groom's OneID Vault");
        break;
      }
      default:
        return false;
    }
    return true;
  };
}
