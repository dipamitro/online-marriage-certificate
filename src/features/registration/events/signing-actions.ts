import type { AnyDeps } from "../types";

/**
 * Handles Groom/Bride eSign (`esign`), Registrar appraisal acceptance (`accept`),
 * reverting an application (`revert`), Registrar approval with eSign (`approve`),
 * and OneID Vault delivery (`sendvault`).
 */
export function createSigningActions(dependencies: AnyDeps) {
  return function handleSigning(action: string, button: HTMLElement): boolean {
    const applicationId = button.dataset["id"];
    const scrollToTop = () => window.scrollTo(0, 0);

    switch (action) {
      case "ekyc": {
        const application = dependencies.appById(applicationId);
        if (application) {
          dependencies.ekycModal(application, button.dataset["who"]);
        }
        break;
      }

      case "kfill": {
        const nid = button.dataset["n"] ?? "";
        const nidInput = dependencies.$("#k-nid") as HTMLInputElement | null;
        const dobInput = dependencies.$("#k-dob") as HTMLInputElement | null;
        if (nidInput) nidInput.value = nid;
        if (dobInput) {
          dobInput.value = dependencies.PEOPLE[nid] ? dependencies.PEOPLE[nid].dob : "";
        }
        break;
      }

      case "esign": {
        const application = dependencies.appById(applicationId);
        const spouseRole = (button.dataset["who"] ?? "groom") as "groom" | "bride";
        if (!application) break;

        dependencies.otpModal(
          "Accept with eSign",
          `You're signing the marriage registration application ${application.appNo} as the ${spouseRole}.`,
          application.f[spouseRole].mobile,
          async () => {
            const normalizedNid = dependencies.toEn(application.f[spouseRole].nid).trim();
            const userRecord = dependencies.userOf(normalizedNid);
            const personRecord = dependencies.PEOPLE[normalizedNid];

            application.esign[spouseRole].ekyc =
              userRecord && userRecord.ekyc && personRecord
                ? {
                    ...userRecord.ekyc,
                    nameMatch:
                      (application.f[spouseRole].nameEn || "").trim().toLowerCase() ===
                      personRecord.en.toLowerCase(),
                    oneName: personRecord.en,
                  }
                : null;

            application.esign[spouseRole].sign = {
              at: dependencies.now(),
              serial: dependencies.serial(),
            };

            dependencies.hist(
              application,
              application.f[spouseRole].nameEn,
              "Accepted with eSign (identity verified by eKYC at sign-up)",
            );

            // Once both Groom and Bride have signed, forward to the Marriage Registrar for appraisal
            if (application.esign.groom.sign && application.esign.bride.sign) {
              application.status = "appraisal";
              const registrar = dependencies.REGISTRARS[application.f.registrar];
              if (registrar) {
                dependencies.pushMail(
                  registrar.email,
                  dependencies.regName(application.f.registrar),
                  `New application for appraisal: ${application.appNo}`,
                  [
                    `The bride and groom have both eSigned application ${application.appNo} (${dependencies.coupleEn(application)}).`,
                    "Please review and accept it, or revert it to the applicant.",
                  ],
                  { type: "registrar", lic: application.f.registrar, appId: application.id },
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
            scrollToTop();
            dependencies.toast(
              application.status === "appraisal"
                ? "Signed. Both have signed; sent to the registrar."
                : "Signed. Waiting for the other party.",
            );
          },
        );
        break;
      }

      case "accept": {
        const application = dependencies.appById(applicationId);
        if (!application) break;

        application.status = "approval";
        application.reg.acceptedAt = dependencies.now();
        dependencies.hist(
          application,
          dependencies.regName(application.f.registrar),
          "Appraisal complete, application accepted",
        );
        dependencies.save();
        dependencies.render();
        scrollToTop();
        dependencies.toast("Accepted. You can now approve with eSign.");
        break;
      }

      case "revert": {
        const application = dependencies.appById(applicationId);
        if (!application) break;

        const revertModalHtml = `
          <h3>Revert to applicant</h3>
          <p class="sub">
            Explain the confusion or problem. The applicant corrects it and submits again; the bride and groom sign again.
          </p>
          <div class="fg" style="margin-top:12px">
            <label>Reason</label>
            <textarea class="inp" id="m-rs"></textarea>
          </div>
          <p class="err" id="m-err"></p>
          <div class="row">
            <button class="btn bs" data-act="mclose">Cancel</button>
            <button class="btn br" data-act="mok">Revert</button>
          </div>
        `;

        dependencies.modal(revertModalHtml, () => {
          const reasonInput = dependencies.$("#m-rs") as HTMLTextAreaElement | null;
          const revertReason = (reasonInput?.value ?? "").trim();
          if (!revertReason) {
            return "Enter a reason.";
          }

          application.status = "reverted";
          application.revertReason = revertReason;
          dependencies.hist(
            application,
            dependencies.regName(application.f.registrar),
            "Reverted to applicant: " + revertReason,
          );

          const applicantAccount = dependencies.accOf(application.owner);
          dependencies.pushMail(
            applicantAccount.email,
            applicantAccount.name,
            `Your application ${application.appNo} needs correction`,
            [
              `Dear ${applicantAccount.name},`,
              `${dependencies.regName(application.f.registrar)} has reverted your marriage registration application with this note:`,
              revertReason,
              "Please correct it and submit again.",
            ],
            { type: "applicant", uid: application.owner, appId: application.id },
          );

          dependencies.save();
          dependencies.UI.open.registrar = null;
          dependencies.render();
          dependencies.toast("Reverted to applicant");
          return "";
        });
        break;
      }

      case "approve": {
        const application = dependencies.appById(applicationId);
        if (!application) break;

        const registrar = dependencies.REGISTRARS[application.f.registrar];
        const registrarUser = registrar ? dependencies.userOf(registrar.nid) : null;
        application.reg.ekyc =
          registrarUser && registrarUser.ekyc ? { ...registrarUser.ekyc } : null;
        application.reg.acceptedAt = application.reg.acceptedAt || dependencies.now();

        dependencies.otpModal(
          "Approve with eSign",
          `Approving ${application.appNo} generates the Digital Nikahnama and the Marriage Certificate, each with the VDS, and sends both directly to the bride's and groom's OneID Vault.`,
          registrar?.mobile ?? "",
          async () => {
            application.reg.sign = {
              at: dependencies.now(),
              serial: dependencies.serial(),
            };
            await dependencies.issue(application);
            dependencies.sendToVault(application);
            dependencies.save();
            dependencies.render();
            scrollToTop();
            dependencies.toast(
              "Approved with eSign. Nikahnama and Marriage Certificate sent to the bride's and groom's OneID Vault.",
            );
          },
        );
        break;
      }

      case "sendvault": {
        const application = dependencies.appById(applicationId);
        if (!application) break;

        dependencies.sendToVault(application);
        dependencies.save();
        dependencies.render();
        scrollToTop();
        dependencies.toast("Sent to the bride's and groom's OneID Vault");
        break;
      }

      default:
        return false;
    }

    return true;
  };
}
