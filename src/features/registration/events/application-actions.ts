/* eslint-disable prettier/prettier */
import type { AnyDeps } from "../types";

/**
 * Handles Marriage Registration Application form actions:
 * starting a new draft (`newapp`), editing a draft (`editapp`), autofilling demo data (`demofill`),
 * switching form tabs (`gotab`), saving drafts (`savedraft`), and submitting (`submitapp`).
 */
export function createApplicationActions(dependencies: AnyDeps) {
  return function handleApplication(action: string, button: HTMLElement): boolean {
    const applicationId = button.dataset["id"];
    const scrollToTop = () => window.scrollTo(0, 0);

    switch (action) {
      case "newapp":
        dependencies.startDraft(null);
        dependencies.render();
        scrollToTop();
        break;

      case "editapp":
        dependencies.startDraft(dependencies.appById(applicationId));
        dependencies.render();
        scrollToTop();
        break;

      case "demofill": {
        const currentApplicantNid: string | null = dependencies.UI.auth.applicant;
        const currentUser = currentApplicantNid ? dependencies.userOf(currentApplicantNid) : null;
        const currentPerson = currentApplicantNid ? dependencies.PEOPLE[currentApplicantNid] : null;
        const currentEmail =
          currentUser?.email ||
          (currentApplicantNid && typeof dependencies.demoEmail === "function"
            ? dependencies.demoEmail(currentApplicantNid)
            : "");

        dependencies.UI.draft.f = dependencies.demoForm({
          nid: currentApplicantNid,
          email: currentEmail,
          nameEn: currentUser?.name || currentPerson?.en || null,
          nameBn: currentUser?.nameBn || currentPerson?.bn || currentUser?.name || null,
          dob: currentUser?.dob || currentPerson?.dob || null,
          mobile:
            currentUser?.mobile ||
            (currentApplicantNid && typeof dependencies.demoMobile === "function"
              ? dependencies.demoMobile(currentApplicantNid)
              : null),
          gender: currentUser?.gender || currentPerson?.g || null,
          preferredRole: dependencies.UI.draft?.f?.applicantRole || null,
          existingApps: dependencies.S?.apps || [],
        });

        dependencies.UI.errors = null;
        dependencies.render();
        break;
      }

      case "gotab":
        dependencies.UI.tab = Number(button.dataset["t"]);
        dependencies.render();
        scrollToTop();
        break;

      case "pickreg": {
        dependencies.UI.draft.f.registrar = button.dataset["lic"] ?? "";
        const tabBodyEl = dependencies.$("#tabbody") as HTMLElement | null;
        if (tabBodyEl) {
          tabBodyEl.innerHTML = dependencies.tabHTML(0);
        }
        break;
      }

      case "savedraft":
        dependencies.saveDraft(dependencies.UI.draft.status === "reverted" ? "reverted" : "draft");
        dependencies.toast("Draft saved");
        dependencies.render();
        break;

      case "submitapp": {
        const validationErrors: Array<[number, string]> = dependencies.validate(
          dependencies.UI.draft.f,
        );
        dependencies.UI.errors = validationErrors;

        // Verify applicant role consistency with Groom/Bride NIDs
        const draftForm = dependencies.UI.draft.f;
        const currentApplicantNid = dependencies.UI.auth.applicant;
        const groomNid = dependencies.toEn(draftForm.groom.nid).trim();
        const brideNid = dependencies.toEn(draftForm.bride.nid).trim();

        if (draftForm.applicantRole === "বর" && groomNid !== currentApplicantNid) {
          validationErrors.push([
            0,
            "You chose বর (Groom) as applicant, but the groom's NID isn't your NID. Choose প্রতিনিধি (Representative) or correct the groom's NID.",
          ]);
        }
        if (draftForm.applicantRole === "কনে" && brideNid !== currentApplicantNid) {
          validationErrors.push([
            0,
            "You chose কনে (Bride) as applicant, but the bride's NID isn't your NID. Choose প্রতিনিধি (Representative) or correct the bride's NID.",
          ]);
        }
        if (
          draftForm.applicantRole === "প্রতিনিধি" &&
          (groomNid === currentApplicantNid || brideNid === currentApplicantNid)
        ) {
          const matchingRole = groomNid === currentApplicantNid ? "groom" : "bride";
          const matchingRoleLabel = groomNid === currentApplicantNid ? "বর (Groom)" : "কনে (Bride)";
          validationErrors.push([
            0,
            `You are the ${matchingRole} in this application. Choose ${matchingRoleLabel} as applicant.`,
          ]);
        }

        if (validationErrors.length) {
          dependencies.render();
          scrollToTop();
          break;
        }

        if (draftForm.m.pay === "online") {
          const mahrFormatted = dependencies.inr(dependencies.toEn(draftForm.m.mohor));
          const feeFormatted = dependencies.inr(dependencies.fee(draftForm.m.mohor));

          const paymentModalHtml = `
            <h3>Pay registration fee online</h3>
            <p class="sub">Registration fee for mahr of ${mahrFormatted} Tk.</p>
            <div class="sc" style="margin:14px 0">
              <div class="sl">Amount</div>
              <div class="sv">৳${feeFormatted}</div>
              <div class="ss">1.25% up to 4 lakh, then 100 Tk per lakh</div>
            </div>
            <div class="rad">
              <label><input type="radio" name="pm" checked> bKash</label>
              <label><input type="radio" name="pm"> Nagad</label>
              <label><input type="radio" name="pm"> Card</label>
            </div>
            <p class="err" id="m-err"></p>
            <div class="row">
              <button class="btn bs" data-act="mclose">Cancel</button>
              <button class="btn bp" data-act="mok">Pay and submit</button>
            </div>
          `;

          dependencies.modal(paymentModalHtml, () => {
            const savedApplication = dependencies.saveDraft();
            savedApplication.paid = true;
            dependencies.doSubmit(savedApplication);
            return "";
          });
        } else {
          const savedApplication = dependencies.saveDraft();
          savedApplication.paid = false;
          dependencies.doSubmit(savedApplication);
        }
        break;
      }

      case "resendesign": {
        const application = dependencies.appById(applicationId);
        if (application) {
          dependencies.sendInvites(application, true);
          dependencies.save();
          dependencies.render();
          dependencies.toast("Invitation resent");
        }
        break;
      }

      default:
        return false;
    }

    return true;
  };
}
