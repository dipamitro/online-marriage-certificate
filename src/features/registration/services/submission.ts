import type { AnyDeps, ApplicationRecord, ApplicationStatus } from "../types";

/** services/submission. Dependencies: S, UI, accOf, appById, blankForm, clone, fee, hist, inr, now, pushMail, render, save, toEn, toast, today, userOf. */
export function createServicesSubmission(dependencies: AnyDeps) {
  function startDraft(a: ApplicationRecord | null | undefined): void {
    dependencies.UI.draft = a
      ? dependencies.clone(a)
      : {
          id: "",
          appNo: "",
          owner: dependencies.UI.auth.applicant ?? "",
          status: "draft",
          f: dependencies.blankForm(),
          esign: { groom: { ekyc: null, sign: null }, bride: { ekyc: null, sign: null } },
          reg: { ekyc: null, sign: null, acceptedAt: null },
          history: [],
          issued: null,
          vds: "",
        };
    dependencies.UI.tab = 0;
    dependencies.UI.errors = null;
    dependencies.UI.page.applicant = "new";
    dependencies.UI.open.applicant = null;
  }
  function saveDraft(status?: ApplicationStatus): ApplicationRecord {
    let a: ApplicationRecord | undefined =
      dependencies.UI.draft.id && dependencies.appById(dependencies.UI.draft.id);
    if (!a) {
      dependencies.S.seq.app++;
      a = {
        id: "a" + Date.now(),
        appNo: `APP-${dependencies.today().slice(0, 4)}-${dependencies.S.seq.app}`,
        owner: dependencies.UI.auth.applicant,
        createdAt: dependencies.now(),
        status: "draft",
        f: dependencies.clone(dependencies.UI.draft.f),
        history: [],
        esign: { groom: { ekyc: null, sign: null }, bride: { ekyc: null, sign: null } },
        reg: { ekyc: null, sign: null, acceptedAt: null },
        issued: null,
        vds: "",
        paid: false,
      };
      dependencies.S.apps.unshift(a);
      dependencies.hist(
        a,
        dependencies.accOf(dependencies.UI.auth.applicant).name,
        "Draft created",
      );
    }
    a.f = dependencies.clone(dependencies.UI.draft.f);
    if (status) a.status = status;
    dependencies.UI.draft.id = a.id;
    dependencies.UI.draft.appNo = a.appNo;
    dependencies.save();
    return a;
  }
  function esignTargets(a: ApplicationRecord): Array<"groom" | "bride"> {
    return (["groom", "bride"] as const).filter(
      (k) => dependencies.toEn(a.f[k].nid).trim() !== a.owner,
    );
  }
  function sendInvites(a: ApplicationRecord, reminder?: boolean): void {
    esignTargets(a)
      .filter((k) => !a.esign[k].sign)
      .forEach((k) => {
        const n = dependencies.toEn(a.f[k].nid).trim(),
          has = !!dependencies.userOf(n),
          by = dependencies.accOf(a.owner).name;
        dependencies.pushMail(
          a.f[k].email,
          a.f[k].nameEn,
          (reminder ? "Reminder: " : "") +
            (has
              ? "Please eSign your marriage registration application"
              : "eKYC invitation: create your OneID account and eSign your marriage registration"),
          [
            `Dear ${a.f[k].nameEn},`,
            `${by} has submitted a marriage registration application (${a.appNo}) naming you as the ${k === "groom" ? "groom" : "bride"}.`,
            has
              ? "Open the link, sign in to the Applicant Portal and go to My eSign › eSign Requests to review and eSign the application."
              : "Open this invitation link to sign up with OneID: confirm your email and phone, set a password and complete eKYC (NID scan and face check). This is done only once. You'll then land in My eSign to review and eSign the application.",
          ],
          { type: "esign", nid: n, invite: !has },
        );
      });
  }
  function doSubmit(a: ApplicationRecord): void {
    a.status = "esign";
    a.submittedAt = dependencies.now();
    a.revertReason = "";
    a.esign = { groom: { ekyc: null, sign: null }, bride: { ekyc: null, sign: null } };
    a.reg = { ekyc: null, sign: null, acceptedAt: null };
    dependencies.hist(
      a,
      dependencies.accOf(dependencies.UI.auth.applicant).name,
      "Application submitted" +
        (a.f.m.pay === "online"
          ? `, fee ${dependencies.inr(dependencies.fee(a.f.m.mohor))} Tk paid online`
          : ""),
    );
    sendInvites(a);
    dependencies.save();
    dependencies.UI.draft = null;
    const mineK = (["groom", "bride"] as const).find(
      (k) => dependencies.toEn(a.f[k].nid).trim() === a.owner,
    );
    if (mineK) {
      dependencies.UI.page.applicant = "esignreq";
      dependencies.UI.open.applicant = null;
      dependencies.UI.open.esign = a.id;
    } else {
      dependencies.UI.page.applicant = "dash";
      dependencies.UI.open.applicant = a.id;
    }
    dependencies.render();
    window.scrollTo(0, 0);
    dependencies.toast("Application submitted");
  }
  return { startDraft, saveDraft, esignTargets, sendInvites, doSubmit };
}
