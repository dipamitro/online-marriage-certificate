import type { AnyDeps } from "../types";

/** Application commands, isolated from other portal actions. */
export function createApplicationActions(dependencies: AnyDeps) {
  return async function handleApplication(act: string, b: HTMLElement): Promise<boolean> {
    const id = b.dataset["id"];
    const top = () => window.scrollTo(0, 0);
    switch (act) {
      case "newapp":
        dependencies.startDraft(null);
        dependencies.render();
        top();
        break;
      case "editapp":
        dependencies.startDraft(dependencies.appById(id));
        dependencies.render();
        top();
        break;
      case "demofill":
        dependencies.UI.draft.f = dependencies.demoForm();
        {
          const me: string | null = dependencies.UI.auth.applicant;
          const myUser = me ? dependencies.userOf(me) : null;
          const myPerson = me ? dependencies.PEOPLE[me] : null;
          if (me && me !== "5555555555" && me !== dependencies.UI.draft.f.bride.nid && myUser) {
            dependencies.UI.draft.f.groom = {
              ...dependencies.UI.draft.f.groom,
              nameEn: myUser.name || myPerson?.en || dependencies.UI.draft.f.groom.nameEn,
              nameBn:
                myUser.nameBn ||
                myPerson?.bn ||
                myUser.name ||
                dependencies.UI.draft.f.groom.nameBn,
              nid: me,
              dob: myUser.dob || myPerson?.dob || dependencies.UI.draft.f.groom.dob,
              email: myUser.email || dependencies.UI.draft.f.groom.email,
              mobile: myUser.mobile || dependencies.UI.draft.f.groom.mobile,
            };
          }
          dependencies.UI.draft.f.applicantRole =
            dependencies.toEn(dependencies.UI.draft.f.groom.nid) === me
              ? "বর"
              : dependencies.toEn(dependencies.UI.draft.f.bride.nid) === me
                ? "কনে"
                : "প্রতিনিধি";
        }
        dependencies.UI.errors = null;
        dependencies.render();
        dependencies.toast("All 7 sections filled with demo data");
        break;
      case "gotab":
        dependencies.UI.tab = Number(b.dataset["t"]);
        dependencies.render();
        top();
        break;
      case "pickreg": {
        dependencies.UI.draft.f.registrar = b.dataset["lic"] ?? "";
        const tabBody = dependencies.$("#tabbody") as HTMLElement | null;
        if (tabBody) tabBody.innerHTML = dependencies.tabHTML(0);
        break;
      }
      case "savedraft":
        dependencies.saveDraft(dependencies.UI.draft.status === "reverted" ? "reverted" : "draft");
        dependencies.toast("Draft saved");
        dependencies.render();
        break;
      case "submitapp": {
        const errs: Array<[number, string]> = dependencies.validate(dependencies.UI.draft.f);
        dependencies.UI.errors = errs;
        {
          const f0 = dependencies.UI.draft.f,
            me = dependencies.UI.auth.applicant,
            g = dependencies.toEn(f0.groom.nid).trim(),
            br = dependencies.toEn(f0.bride.nid).trim();
          if (f0.applicantRole === "বর" && g !== me)
            errs.push([
              0,
              "You chose বর (Groom) as applicant, but the groom's NID isn't your NID. Choose প্রতিনিধি (Representative) or correct the groom's NID.",
            ]);
          if (f0.applicantRole === "কনে" && br !== me)
            errs.push([
              0,
              "You chose কনে (Bride) as applicant, but the bride's NID isn't your NID. Choose প্রতিনিধি (Representative) or correct the bride's NID.",
            ]);
          if (f0.applicantRole === "প্রতিনিধি" && (g === me || br === me))
            errs.push([
              0,
              `You are the ${g === me ? "groom" : "bride"} in this application. Choose ${g === me ? "বর (Groom)" : "কনে (Bride)"} as applicant.`,
            ]);
        }
        if (errs.length) {
          dependencies.render();
          top();
          break;
        }
        const f = dependencies.UI.draft.f;
        if (f.m.pay === "online") {
          dependencies.modal(
            `<h3>Pay registration fee online</h3><p class="sub">Registration fee for mahr of ${dependencies.inr(dependencies.toEn(f.m.mohor))} Tk.</p><div class="sc" style="margin:14px 0"><div class="sl">Amount</div><div class="sv">৳${dependencies.inr(dependencies.fee(f.m.mohor))}</div><div class="ss">1.25% up to 4 lakh, then 100 Tk per lakh</div></div><div class="rad"><label><input type="radio" name="pm" checked> bKash</label><label><input type="radio" name="pm"> Nagad</label><label><input type="radio" name="pm"> Card</label></div><p class="err" id="m-err"></p><div class="row"><button class="btn bs" data-act="mclose">Cancel</button><button class="btn bp" data-act="mok">Pay and submit</button></div>`,
            () => {
              const a = dependencies.saveDraft();
              a.paid = true;
              dependencies.doSubmit(a);
              return "";
            },
          );
        } else {
          const a = dependencies.saveDraft();
          a.paid = false;
          dependencies.doSubmit(a);
        }
        break;
      }
      case "resendesign": {
        const a = dependencies.appById(id);
        if (a) {
          dependencies.sendInvites(a, true);
          dependencies.save();
          dependencies.render();
          dependencies.toast("Invitation emails sent again");
        }
        break;
      }
      default:
        return false;
    }
    return true;
  };
}
