/* eslint-disable prettier/prettier */
import type { AnyDeps, ApplicationRecord } from "../types";

const LIVENESS_PROMPTS = [
  "Hold your face inside the circle",
  "Blink slowly",
  "Turn your head a little to the left",
  "Matching with your NID photo",
];

/**
 * Provides toast notifications and modal dialogs (eKYC verification, SMS OTP confirmation,
 * and digital signature certificate inspection).
 *
 * Dependencies: `$`, `IC`, `PEOPLE`, `REGISTRARS`, `esc`, `hist`, `lifecycle`,
 * `nidOk`, `now`, `otp`, `regName`, `render`, `save`, `sigDate`, `toEn`.
 */
export function createComponentsDialogs(dependencies: AnyDeps) {
  let toastTimeout: ReturnType<typeof setTimeout> | undefined;
  let modalConfirmHandler: (() => string | Promise<string>) | null = null;

  /**
   * Shows a temporary toast notification at the bottom of the screen.
   */
  function toast(message: string): void {
    const toastEl = dependencies.$("#toast") as HTMLElement | null;
    if (!toastEl || !message) return;

    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = dependencies.lifecycle.timeout(() => toastEl.classList.remove("show"), 1500);
  }

  /**
   * Opens a modal dialog with the given inner HTML and optional confirmation callback.
   */
  function modal(html: string, onConfirm: (() => string | Promise<string>) | null): void {
    const modalEl = dependencies.$("#modal") as HTMLElement | null;
    if (!modalEl) return;

    modalEl.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">${html}</div>`;
    modalEl.hidden = false;
    modalConfirmHandler = onConfirm;

    const firstFocusable = modalEl.querySelector<HTMLElement>("input,textarea,button");
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  /**
   * Closes and clears the currently open modal dialog.
   */
  function closeModal(): void {
    const modalEl = dependencies.$("#modal") as HTMLElement | null;
    if (!modalEl) return;

    modalEl.hidden = true;
    modalEl.innerHTML = "";
    modalConfirmHandler = null;
  }

  /**
   * Opens the OneID eKYC verification modal (NID + DOB + face liveness check)
   * for the Groom, Bride, or Marriage Registrar.
   */
  function ekycModal(application: ApplicationRecord, signerRole: "reg" | "groom" | "bride"): void {
    const isRegistrar = signerRole === "reg";
    const expectedNid = isRegistrar
      ? dependencies.REGISTRARS[application.f.registrar].nid
      : dependencies.toEn(application.f[signerRole].nid).trim();
    const signerDisplayName = isRegistrar
      ? dependencies.regName(application.f.registrar)
      : application.f[signerRole].nameEn || "";

    const modalHtml = `
      <h3>Complete eKYC with OneID</h3>
      <p class="sub">
        ${
          isRegistrar
            ? "Confirm your identity before approving with eSign."
            : "Confirm your identity before you eSign. Your NID and face are checked against the OneID / NID server."
        }
      </p>
      <div class="g2" style="margin-top:14px">
        <div class="fg">
          <label>NID number</label>
          <input class="inp" id="k-nid" inputmode="numeric">
        </div>
        <div class="fg">
          <label>Date of birth</label>
          <input class="inp" type="date" id="k-dob">
        </div>
      </div>
      <button class="btn bs" data-act="kfill" data-n="${expectedNid}" style="font-size:11.5px;min-height:30px">
        Demo: fill ${dependencies.esc(signerDisplayName)}'s details
      </button>
      <p class="err" id="m-err"></p>
      <div class="row">
        <button class="btn bs" data-act="mclose">Cancel</button>
        <button class="btn bp" data-act="mok">Continue to face check</button>
      </div>
    `;

    modal(modalHtml, () => {
      const nidInput = dependencies.$("#k-nid") as HTMLInputElement | null;
      const dobInput = dependencies.$("#k-dob") as HTMLInputElement | null;
      const enteredNid = dependencies.toEn(nidInput?.value ?? "").trim();
      const enteredDob = dobInput?.value ?? "";

      if (!dependencies.nidOk(enteredNid)) {
        return "Enter a 10, 13 or 17-digit NID number.";
      }
      if (!enteredDob) {
        return "Enter your date of birth.";
      }

      const personRecord = dependencies.PEOPLE[enteredNid];
      if (!personRecord) {
        return "No OneID record matches this NID.";
      }
      if (personRecord.dob !== enteredDob) {
        return "The date of birth doesn't match the OneID record.";
      }
      if (enteredNid !== expectedNid) {
        return isRegistrar
          ? "This NID doesn't match the registrar's eSign profile."
          : "This NID doesn't match the one in the application. Ask the applicant to correct it.";
      }

      const dialogContainer = dependencies.$("#modal .dlg") as HTMLElement | null;
      if (dialogContainer) {
        dialogContainer.innerHTML = `
          <h3>Liveness check</h3>
          <div class="cam">${dependencies.IC.face}</div>
          <p id="lt" style="text-align:center;font-weight:600">${LIVENESS_PROMPTS[0]}</p>
          <p class="sub" style="text-align:center">Simulated; the camera isn't used in this prototype.</p>
        `;
      }

      let promptIndex = 0;
      const advanceLivenessStep = () => {
        promptIndex++;
        if (promptIndex < LIVENESS_PROMPTS.length) {
          const promptTextEl = dependencies.$("#lt") as HTMLElement | null;
          if (promptTextEl) {
            promptTextEl.textContent = LIVENESS_PROMPTS[promptIndex] ?? "";
          }
          dependencies.lifecycle.timeout(advanceLivenessStep, 900);
        } else {
          const faceMatchScore = 96 + Math.random() * 3.5;
          if (isRegistrar) {
            application.reg.ekyc = { at: dependencies.now(), score: faceMatchScore };
            dependencies.hist(
              application,
              dependencies.regName(application.f.registrar),
              "Registrar eKYC completed",
            );
          } else {
            const nameMatch =
              (application.f[signerRole].nameEn || "").trim().toLowerCase() ===
              personRecord.en.toLowerCase();
            application.esign[signerRole].ekyc = {
              at: dependencies.now(),
              score: faceMatchScore,
              nameMatch,
              oneName: personRecord.en,
            };
            dependencies.hist(
              application,
              application.f[signerRole].nameEn,
              "eKYC completed with OneID",
            );
          }
          dependencies.save();
          closeModal();
          dependencies.render();
          toast("eKYC verified");
        }
      };

      dependencies.lifecycle.timeout(advanceLivenessStep, 900);
      return "pending";
    });
  }

  /**
   * Opens a 6-digit SMS OTP confirmation modal before applying an electronic signature.
   */
  function otpModal(
    title: string,
    description: string,
    mobileNumber: string,
    onVerified: () => void | Promise<void>,
  ): void {
    const generatedOtpCode = dependencies.otp();
    const lastThreeDigits = dependencies.esc(String(mobileNumber).slice(-3));

    const modalHtml = `
      <h3>${title}</h3>
      <p class="sub">${description}</p>
      <div class="fg" style="margin-top:14px">
        <label>Code sent by SMS to mobile ending ${lastThreeDigits}</label>
        <input class="inp otp" id="m-otp" inputmode="numeric" maxlength="6">
        <div class="demo-code">Demo code: ${generatedOtpCode}</div>
      </div>
      <p class="err" id="m-err"></p>
      <div class="row">
        <button class="btn bs" data-act="mclose">Cancel</button>
        <button class="btn bg" data-act="mok">Sign</button>
      </div>
    `;

    modal(modalHtml, async () => {
      const otpInput = dependencies.$("#m-otp") as HTMLInputElement | null;
      if ((otpInput?.value ?? "").trim() !== generatedOtpCode) {
        return "That code doesn't match.";
      }
      await onVerified();
      return "";
    });
  }

  /**
   * Opens a modal displaying PKI certificate details for a completed Groom, Bride, or Registrar eSign.
   */
  function sigDetail(application: ApplicationRecord, signerRole: "reg" | "groom" | "bride"): void {
    const signatureRecord = signerRole === "reg" ? application.reg : application.esign[signerRole];
    const signerName =
      signerRole === "reg"
        ? dependencies.regName(application.f.registrar)
        : application.f[signerRole].nameEn;

    if (!signatureRecord.sign) return;

    const roleDisplay =
      signerRole === "reg"
        ? `Marriage Registrar (${application.f.registrar})`
        : signerRole === "groom"
          ? "Groom"
          : "Bride";

    const organizationDisplay =
      signerRole === "reg" ? "Law &amp; Justice Division" : "Citizen (OneID)";

    const faceMatchDisplay = signatureRecord.ekyc
      ? `· face match ${signatureRecord.ekyc.score.toFixed(1)}%`
      : "";

    const modalHtml = `
      <h3>Signature details</h3>
      <div class="vres good" style="margin-top:8px">
        <b>✓ Signature is VALID</b>
        <p style="font-size:12.5px;margin-top:4px">
          The document has not been modified since this signature was applied. The signer's certificate chains to a trusted root.
        </p>
      </div>
      <div style="margin-top:12px">
        <div class="irow"><span>Signed by</span><span>${dependencies.esc(signerName)}</span></div>
        <div class="irow"><span>Role</span><span>${roleDisplay}</span></div>
        <div class="irow"><span>Organization</span><span>${organizationDisplay}</span></div>
        <div class="irow"><span>Country code</span><span>BD</span></div>
        <div class="irow"><span>Signing time</span><span>${dependencies.sigDate(signatureRecord.sign.at)}</span></div>
        <div class="irow"><span>Certificate serial</span><span>${dependencies.esc(signatureRecord.sign.serial)}</span></div>
        <div class="irow"><span>Issuer</span><span>Bangladesh eSign CA (demo)</span></div>
        <div class="irow"><span>Identity</span><span>OneID eKYC ${faceMatchDisplay}</span></div>
        <div class="irow"><span>Revocation</span><span>Good (OCSP)</span></div>
      </div>
      <div class="row">
        <button class="btn bp" data-act="mclose">Close</button>
      </div>
    `;

    modal(modalHtml, null);
  }

  return {
    get toastT() {
      return toastTimeout;
    },
    set toastT(value) {
      toastTimeout = value;
    },
    toast,
    get mOk() {
      return modalConfirmHandler;
    },
    set mOk(value) {
      modalConfirmHandler = value;
    },
    modal,
    closeModal,
    LIVE: LIVENESS_PROMPTS,
    ekycModal,
    otpModal,
    sigDetail,
  };
}
