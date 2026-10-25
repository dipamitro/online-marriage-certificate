import { createLifecycle } from "./state/lifecycle";
import { browserStorage } from "./state/browser-storage";
import { createUtilsFormatting } from "./utils/formatting";
import { createComponentsSymbols } from "./components/symbols";
import { createServicesReferenceDirectory } from "./services/reference-directory";
import { createConstantsFormOptions } from "./constants/form-options";
import { createServicesFees } from "./services/fees";
import { createServicesForms } from "./services/forms";
import { createServicesContacts } from "./services/contacts";
import { createServicesBridge } from "./services/bridge";
import { createStateStore } from "./state/store";
import { createServicesDigitalSeal } from "./services/digital-seal";
import { createConstantsStatus } from "./constants/status";
import { createServicesApplications } from "./services/applications";
import { createValidatorsRegistration } from "./validators/registration";
import { createServicesIssuance } from "./services/issuance";
import { createServicesExistingFixtures } from "./services/existing-fixtures";
import { createServicesPdf } from "./services/pdf";
import { createComponentsNikahnama } from "./components/nikahnama";
import { createComponentsFormFields } from "./components/form-fields";
import { createScreensApplicationForm } from "./screens/application-form";
import { createComponentsApplicationSummary } from "./components/application-summary";
import { createScreensPortalShell } from "./screens/portal-shell";
import { createScreensSignIn } from "./screens/sign-in";
import { createScreensAccountShell } from "./screens/account-shell";
import { createScreensApplicant } from "./screens/applicant";
import { createScreensEsign } from "./screens/esign";
import { createScreensRegistrar } from "./screens/registrar";
import { createScreensVerification } from "./screens/verification";
import { createScreensInbox } from "./screens/inbox";
import { createComponentsMarriageCertificate } from "./components/marriage-certificate";
import { createScreensWallet } from "./screens/wallet";
import { createComponentsIdentityDocuments } from "./components/identity-documents";
import { createServicesOnboarding } from "./services/onboarding";
import { createScreensOnboarding } from "./screens/onboarding";
import { createServicesOnboardingProgress } from "./services/onboarding-progress";
import { createEventsOnboardingActions } from "./events/onboarding-actions";
import { createServicesSignIn } from "./services/sign-in";
import { createScreensLegacySignup } from "./screens/legacy-signup";
import { createComponentsDialogs } from "./components/dialogs";
import { createEventsFormEvents } from "./events/form-events";
import { createServicesSubmission } from "./services/submission";
import { createEventsActions } from "./events/actions";
import type { AnyDeps, ApplicationRecord, RegistrationController } from "./types";

export interface BootRegistrationOptions {
  initialPortal?: string;
  initialSignInRole?: string;
  initialEnlRole?: "applicant" | "admin" | "super";
}

/** Compose isolated modules only after the portal DOM has mounted. */
export function bootRegistration(options?: BootRegistrationOptions): RegistrationController {
  const lifecycle = createLifecycle();
  const runtime: AnyDeps = {
    lifecycle,
    ls: browserStorage,
    $: (selector: string) => document.querySelector<HTMLElement>(selector),
  };
  const dependencies = (names: string[]): AnyDeps =>
    Object.defineProperties(
      {},
      Object.fromEntries(
        names.map((name) => [
          name,
          {
            get: () => runtime[name],
            set: (value: unknown) => {
              runtime[name] = value;
            },
          },
        ]),
      ),
    );
  const install = (module: Record<string, unknown>): void => {
    Object.defineProperties(runtime, Object.getOwnPropertyDescriptors(module));
  };

  install(createUtilsFormatting(dependencies([])));
  install(createComponentsSymbols(dependencies([])));
  install(createServicesReferenceDirectory(dependencies(["S"])));
  install(createConstantsFormOptions(dependencies(["IC"])));
  install(createServicesFees(dependencies(["toEn"])));
  install(createServicesForms(dependencies(["today", "addDays", "C17OPTS"])));
  install(createServicesContacts(dependencies(["licOf", "REGISTRARS", "PEOPLE"])));
  install(createStateStore(dependencies(["ls"])));
  install(createServicesDigitalSeal(dependencies(["ls", "KEYS"])));
  install(createConstantsStatus(dependencies([])));
  install(createServicesApplications(dependencies(["S", "now"])));
  install(
    createValidatorsRegistration(
      dependencies([
        "nidOk",
        "mobOk",
        "mailOk",
        "today",
        "ageAt",
        "toEn",
        "activeMarriage",
        "inr",
        "fee",
      ]),
    ),
  );
  install(
    createServicesIssuance(
      dependencies(["S", "now", "pad", "toEn", "signP", "hist", "regName", "pushMail"]),
    ),
  );
  install(
    createServicesExistingFixtures(
      dependencies([
        "S",
        "PEOPLE",
        "licOf",
        "REGISTRARS",
        "demoEmail",
        "demoMobile",
        "addDays",
        "today",
        "demoForm",
        "serial",
        "hist",
        "issue",
        "issueSync",
        "sealIssued",
        "sendToVault",
        "pushMail",
        "save",
      ]),
    ),
  );
  install(
    createServicesPdf(
      dependencies(["toast", "$", "certHTML", "docHTML", "hydrateQR", "lifecycle"]),
    ),
  );
  install(
    createComponentsNikahnama(
      dependencies([
        "esc",
        "bn",
        "toEn",
        "today",
        "ageAt",
        "bnDate",
        "tkBn",
        "fee",
        "sigDate",
        "regName",
        "fDT",
        "SEAL",
        "regNameBn",
      ]),
    ),
  );
  install(createComponentsFormFields(dependencies(["UI", "getP", "esc", "DIST"])));
  install(
    createScreensApplicationForm(
      dependencies([
        "D",
        "LOC",
        "REGISTRARS",
        "sel",
        "REG_TYPES",
        "esc",
        "radio",
        "regNameBn",
        "bn",
        "personHTML",
        "MARITAL_G",
        "MARITAL_B",
        "YN",
        "fee",
        "toEn",
        "fld",
        "C17OPTS",
        "inr",
        "UI",
        "TABS",
      ]),
    ),
  );
  install(
    createComponentsApplicationSummary(
      dependencies([
        "STEPS",
        "IC",
        "esc",
        "fDT",
        "regName",
        "fD",
        "inr",
        "toEn",
        "fee",
        "coupleEn",
        "chip",
      ]),
    ),
  );
  install(
    createScreensPortalShell(
      dependencies([
        "rebuildFromEnl",
        "UI",
        "S",
        "$",
        "roleHome",
        "verifyPage",
        "inboxPage",
        "docPage",
        "walletShell",
        "walletLogin",
        "loginPage",
        "shell",
        "hydrateQR",
      ]),
    ),
  );
  install(createScreensSignIn(dependencies(["UI", "S", "licOf", "esc", "IC", "PEOPLE"])));
  install(
    createScreensAccountShell(
      dependencies([
        "UI",
        "accOf",
        "S",
        "toEn",
        "IC",
        "applicantPage",
        "PEOPLE",
        "esignPage",
        "regName",
        "registrarPage",
        "ini",
        "esc",
      ]),
    ),
  );
  install(
    createScreensApplicant(
      dependencies([
        "UI",
        "appById",
        "esignPage",
        "formPage",
        "STATUS",
        "tableHTML",
        "esc",
        "IC",
        "STEPS",
        "stepDone",
        "stepSub",
        "chip",
        "flowHTML",
        "fDT",
        "summaryHTML",
        "histHTML",
        "docHTML",
        "certHTML",
      ]),
    ),
  );
  install(
    createScreensEsign(
      dependencies([
        "UI",
        "appById",
        "PEOPLE",
        "tableHTML",
        "esc",
        "coupleEn",
        "regName",
        "fDT",
        "chip",
        "userOf",
        "IC",
        "flowHTML",
        "STATUS",
        "stKey",
        "summaryHTML",
        "docHTML",
      ]),
    ),
  );
  install(
    createScreensRegistrar(
      dependencies([
        "UI",
        "appById",
        "STATUS",
        "tableHTML",
        "REGISTRARS",
        "esc",
        "regName",
        "flagsHTML",
        "appraisalChecks",
        "idCard",
        "IC",
        "fDT",
        "toEn",
        "chip",
        "flowHTML",
        "summaryHTML",
        "histHTML",
        "docHTML",
        "certHTML",
      ]),
    ),
  );
  install(
    createScreensVerification(dependencies(["UI", "S", "esc", "fD", "regName", "render", "verP"])),
  );
  install(
    createScreensInbox(
      dependencies(["S", "UI", "esc", "fDT", "appById", "coupleEn", "docHTML", "certHTML"]),
    ),
  );
  install(
    createComponentsMarriageCertificate(
      dependencies(["toEn", "REGISTRARS", "esc", "today", "regName", "sigDate"]),
    ),
  );
  install(
    createScreensWallet(
      dependencies([
        "S",
        "toEn",
        "save",
        "UI",
        "userOptions",
        "signupBox",
        "PEOPLE",
        "IC",
        "ini",
        "esc",
        "appById",
        "coupleEn",
        "fD",
        "certHTML",
        "docHTML",
        "fDT",
        "regName",
        "addDays",
        "today",
      ]),
    ),
  );
  install(
    createComponentsIdentityDocuments(
      dependencies(["addDays", "today", "PEOPLE", "obSplit", "esc", "fD", "userOf"]),
    ),
  );
  install(
    createServicesOnboarding(
      dependencies([
        "UI",
        "userOf",
        "otp",
        "renderOnb",
        "PEOPLE",
        "licOf",
        "demoEmail",
        "demoMobile",
      ]),
    ),
  );
  install(
    createScreensOnboarding(
      dependencies([
        "PEOPLE",
        "bn",
        "esc",
        "fD",
        "OB_IC",
        "UI",
        "OB_ORDER",
        "obCands",
        "walletLogo",
        "passCard",
        "passNo",
        "passExp",
      ]),
    ),
  );
  install(
    createServicesOnboardingProgress(
      dependencies([
        "$",
        "UI",
        "onbHTML",
        "obSplit",
        "PEOPLE",
        "obGo",
        "S",
        "licOf",
        "toEn",
        "now",
        "save",
        "doLogin",
        "lifecycle",
      ]),
    ),
  );
  install(createServicesSignIn(dependencies(["licOf", "UI", "render", "toast", "markSeen"])));
  install(
    createScreensLegacySignup(
      dependencies([
        "REGISTRARS",
        "userOf",
        "UI",
        "modal",
        "PEOPLE",
        "esc",
        "toEn",
        "$",
        "nidOk",
        "ageAt",
        "mobOk",
        "mailOk",
        "IC",
        "LIVE",
        "S",
        "now",
        "save",
        "lifecycle",
      ]),
    ),
  );
  install(
    createComponentsDialogs(
      dependencies([
        "$",
        "REGISTRARS",
        "toEn",
        "regName",
        "esc",
        "nidOk",
        "PEOPLE",
        "IC",
        "now",
        "hist",
        "save",
        "render",
        "otp",
        "sigDate",
        "lifecycle",
      ]),
    ),
  );
  install(
    createServicesSubmission(
      dependencies([
        "UI",
        "clone",
        "blankForm",
        "appById",
        "S",
        "today",
        "now",
        "hist",
        "accOf",
        "save",
        "toEn",
        "userOf",
        "pushMail",
        "inr",
        "fee",
        "render",
        "toast",
      ]),
    ),
  );
  install(
    createServicesBridge(
      dependencies([
        "S",
        "PEOPLE",
        "demoEmail",
        "demoMobile",
        "pushMail",
        "save",
        "UI",
        "render",
        "rebuildFromEnl",
        "doLogin",
      ]),
    ),
  );
  install(
    createEventsOnboardingActions(
      dependencies([
        "UI",
        "obBack",
        "renderOnb",
        "obFillPerson",
        "toEn",
        "mailOk",
        "REGISTRARS",
        "userOf",
        "otp",
        "obGo",
        "toast",
        "obCands",
        "obSplit",
        "PEOPLE",
        "nidOk",
        "ageAt",
      ]),
    ),
  );
  install(
    createEventsFormEvents(
      dependencies([
        "UI",
        "$",
        "setP",
        "toEn",
        "fee",
        "bn",
        "inr",
        "render",
        "tabHTML",
        "closeModal",
        "lifecycle",
      ]),
    ),
  );
  install(
    createEventsActions(
      dependencies([
        "obAction",
        "UI",
        "render",
        "userOf",
        "toast",
        "doLogin",
        "REGISTRARS",
        "startDraft",
        "appById",
        "demoForm",
        "demoEmail",
        "demoMobile",
        "toEn",
        "$",
        "tabHTML",
        "saveDraft",
        "validate",
        "modal",
        "inr",
        "fee",
        "doSubmit",
        "sendInvites",
        "save",
        "ekycModal",
        "PEOPLE",
        "otpModal",
        "now",
        "serial",
        "hist",
        "pushMail",
        "regName",
        "coupleEn",
        "accOf",
        "issue",
        "sendToVault",
        "markSeen",
        "runVerify",
        "S",
        "downloadPdf",
        "sigDetail",
        "esc",
        "startOnb",
        "closeModal",
        "licOf",
        "mOk",
        "ls",
        "STORE",
        "lifecycle",
        "rebuildFromEnl",
        "seed",
      ]),
    ),
  );

  const currentBridge = window.OMRBridge;
  let syncError: unknown = null;

  try {
    if (options?.initialPortal) {
      runtime["UI"].portal = options.initialPortal;
    }
    if (options?.initialSignInRole) {
      runtime["UI"].home.role = options.initialSignInRole;
      runtime["UI"].home.err = "";
    }
    runtime["rebuildFromEnl"]();
    const stored = runtime["readState"]();
    if (stored) {
      runtime["S"] = stored;
    } else {
      runtime["seedSync"]();
    }
    runtime["rebuildFromEnl"]();
    if (runtime["UI"].portal === "enl") {
      const enlRole = options?.initialEnlRole || window.ENLBridge?.getRole?.() || "applicant";
      if (enlRole === "admin" || enlRole === "super") {
        window.ENLBridge?.signIn(enlRole);
      } else {
        window.ENLBridge?.show("applicant");
      }
    }
    runtime["render"]();
  } catch (err) {
    syncError = err;
  }

  const ready = (async () => {
    if (syncError) {
      throw syncError;
    }
    await window.ENLBridge?.init();
    if (lifecycle.disposed) return;
    await runtime["initKeys"]();
    if (lifecycle.disposed) return;
    runtime["rebuildFromEnl"]();
    if (!runtime["S"]) {
      const stored = runtime["readState"]();
      if (stored) runtime["S"] = stored;
      else await runtime["seed"]();
    } else {
      let sealedAny = false;
      for (const a of runtime["S"].apps as ApplicationRecord[]) {
        if (a.status === "issued" && (!a.vds || a.vds.endsWith("|S:UNSIGNED"))) {
          await runtime["sealIssued"](a);
          sealedAny = true;
        }
      }
      if (sealedAny) runtime["save"]();
    }
    if (lifecycle.disposed) return;
    if (runtime["UI"].portal === "enl") {
      window.ENLBridge?.render();
    }
    runtime["render"]();
    runtime["dlCap"]();
  })();

  return {
    ready,
    error: syncError,
    dispose() {
      lifecycle.dispose();
      if (window.OMRBridge === currentBridge) delete window.OMRBridge;
    },
  };
}
