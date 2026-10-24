import { beforeEach, describe, expect, it } from "vitest";
import { bootEnlistment } from "@/legacy/enlistment-engine";
import { bootRegistration } from "@/legacy/registration-engine";
import { createUtilsFormatting } from "./utils/formatting";
import { createServicesForms } from "./services/forms";
import { createServicesFees } from "./services/fees";
import { createValidatorsRegistration } from "./validators/registration";

const formatting = createUtilsFormatting({});
const fees = createServicesFees(formatting);
const dependencies = {
  ...formatting,
  ...fees,
  today: () => "2026-10-24",
  activeMarriage: () => null,
  C17OPTS: ["one", "two"],
};
const forms = createServicesForms(dependencies);
const validator = createValidatorsRegistration(dependencies);
const validForm = () => ({ ...forms.demoForm(), applicantRole: "প্রতিনিধি" });

function mountPortalDom() {
  document.body.innerHTML = `
    <div id="pills" role="navigation" aria-label="Portals"></div>
    <div id="root"></div>
    <div class="modal" id="modal" hidden></div>
    <div id="toast" role="status"></div>
    <div id="eroot" hidden></div>
    <div class="modal" id="emodal" hidden></div>
    <div id="etoast" role="status"></div>
    <div id="pdfStage" aria-hidden="true"></div>
    <div id="onb" hidden></div>
  `;
}

describe("Existing registration rules", () => {
  it("retains the first fee tier and upper-tier ceiling", () => {
    expect(fees.fee("400000")).toBe(5000);
    expect(fees.fee("400001")).toBe(5100);
    expect(fees.fee("৫০০০০০")).toBe(5100);
    expect(fees.fee("500001")).toBe(5200);
  });
  it("accepts an existing complete application", () => {
    expect(validator.validate(validForm())).toEqual([]);
  });
  it("retains groom age 21 and bride age 18 boundaries", () => {
    const form = validForm();
    form.groom.dob = "2005-10-24";
    form.bride.dob = "2008-10-24";
    expect(validator.validate(form)).toEqual([]);
    form.groom.dob = "2005-10-25";
    expect(validator.validate(form).some(([tab]) => tab === 1)).toBe(true);
    form.groom.dob = "2005-10-24";
    form.bride.dob = "2008-10-25";
    expect(validator.validate(form).some(([tab]) => tab === 2)).toBe(true);
  });
  it("rejects duplicate spouse identities", () => {
    const form = validForm();
    form.bride.nid = form.groom.nid;
    expect(validator.validate(form).some(([tab]) => tab === 2)).toBe(true);
  });
  it("requires permission for an existing wife", () => {
    const form = validForm();
    form.groom.marital = "বিবাহিত";
    form.m.c21 = "yes";
    expect(validator.validate(form).some(([tab]) => tab === 6)).toBe(true);
    form.m.permNo = "123";
    form.m.permDate = "2026-10-23";
    expect(validator.validate(form)).toEqual([]);
  });
  it("rejects registration dates before today", () => {
    const form = validForm();
    form.m.regDate = "2026-10-23";
    expect(validator.validate(form).some(([tab]) => tab === 6)).toBe(true);
  });
  it("creates independent blank nested forms", () => {
    const first = forms.blankForm(),
      second = forms.blankForm();
    first.groom.addr.houseBn = "changed";
    expect(second.groom.addr.houseBn).toBe("");
    expect(first.bride.addr.houseBn).toBe("");
  });
});

describe("Portal boot and lifecycle integration", () => {
  beforeEach(() => {
    localStorage.clear();
    mountPortalDom();
    bootEnlistment();
  });

  it("renders synchronously on boot without waiting for async ready", async () => {
    const controller = bootRegistration({ initialPortal: "verify" });

    // Immediate synchronous check before awaiting controller.ready
    expect(window.OMRBridge).toBeDefined();
    expect(window.OMRBridge?.getPortal?.()).toBe("verify");
    expect(document.querySelector("#root")?.innerHTML).toContain(
      "Verify a Nikahnama or Marriage Certificate",
    );
    expect(document.querySelector("#pills")?.innerHTML).toContain("OneID Wallet");

    await controller.ready;
    controller.dispose();
    expect(window.OMRBridge).toBeUndefined();
  });

  it("renders role-specific sign-in without the legacy role select dropdown", async () => {
    const controller = bootRegistration({
      initialPortal: "home",
      initialSignInRole: "registrar",
    });
    await controller.ready;

    const rootHtml = document.querySelector("#root")?.innerHTML ?? "";
    expect(rootHtml).not.toContain('data-homerole="1"');
    expect(rootHtml).toContain("Sign up with OneID eKYC to apply for enlistment");

    window.OMRBridge?.setSignInRole?.("applicant");
    const applicantHtml = document.querySelector("#root")?.innerHTML ?? "";
    expect(applicantHtml).toContain("Sign up with OneID eKYC");
    expect(applicantHtml).not.toContain("to apply for enlistment");

    controller.dispose();
  });

  it("preserves newly signed-up enlistment applicant on /enlistment and routes /admin and /superadmin separately", async () => {
    const firstController = bootRegistration({
      initialPortal: "home",
      initialSignInRole: "registrar",
    });
    await firstController.ready;

    // Simulate a newly signed-up registrar applicant synced via OneID eKYC
    window.ENLBridge?.syncUser?.({
      nid: "1996888999",
      name: "Tariq Mahmud",
      nameBn: "তারিক মাহমুদ",
      dob: "1992-04-10",
      email: "tariq.mahmud@mail.com",
      mobile: "01711888999",
      ekycAt: "2026-10-24T10:00:00",
    });
    firstController.dispose();

    // Remount on /enlistment route
    const enlController = bootRegistration({
      initialPortal: "enl",
      initialEnlRole: "applicant",
    });
    await enlController.ready;

    const erootHtml = document.querySelector("#eroot")?.innerHTML ?? "";
    expect(erootHtml).toContain("Assalamu Alaikum, Tariq Mahmud");
    expect(erootHtml).toContain("Start application");
    enlController.dispose();

    // Remount on /admin route
    const adminController = bootRegistration({
      initialPortal: "enl",
      initialEnlRole: "admin",
    });
    await adminController.ready;
    expect(document.querySelector("#eroot")?.innerHTML).toContain("Farhana Akter");
    expect(window.ENLBridge?.getRole?.()).toBe("admin");
    adminController.dispose();

    // Remount on /superadmin route
    const superController = bootRegistration({
      initialPortal: "enl",
      initialEnlRole: "super",
    });
    await superController.ready;
    expect(document.querySelector("#eroot")?.innerHTML).toContain("Md. Rafiqul Islam");
    expect(window.ENLBridge?.getRole?.()).toBe("super");
    superController.dispose();
  });

  it("boots registration, publishes OMRBridge, renders home screen, and cleans up on dispose", async () => {
    const controller = bootRegistration();
    await controller.ready;

    expect(window.OMRBridge).toBeDefined();
    expect(document.querySelector("#root")?.innerHTML).toContain("Sign in");
    expect(document.querySelector("#pills")?.innerHTML).toContain("OneID Wallet");

    controller.dispose();
    expect(window.OMRBridge).toBeUndefined();
  });

  it("navigates across portals and verifies seeded Nikahnama VDS seal", async () => {
    const controller = bootRegistration();
    await controller.ready;

    const verifyTab = document.querySelector('[data-act="portal"][data-p="verify"]');
    verifyTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(document.querySelector("#root")?.innerHTML).toContain(
      "Verify a Nikahnama or Marriage Certificate",
    );

    const sampleBtn = document.querySelector('[data-act="vsample"]');
    sampleBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 50));

    expect(document.querySelector("#root")?.innerHTML).toContain("Genuine and unchanged");
    controller.dispose();
  });
});
