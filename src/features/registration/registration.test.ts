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
    expect(document.querySelector("#pills")?.innerHTML).toBe("");
    expect((document.querySelector("#pills") as HTMLElement | null)?.hidden).toBe(true);

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
    const adminHtml = document.querySelector("#eroot")?.innerHTML ?? "";
    expect(adminHtml).toContain("Farhana Akter");
    expect(adminHtml).toContain("↺ Reset demo");
    expect(window.ENLBridge?.getRole?.()).toBe("admin");
    adminController.dispose();

    // Remount on /superadmin route
    const superController = bootRegistration({
      initialPortal: "enl",
      initialEnlRole: "super",
    });
    await superController.ready;
    const superHtml = document.querySelector("#eroot")?.innerHTML ?? "";
    expect(superHtml).toContain("Md. Rafiqul Islam");
    expect(superHtml).toContain("↺ Reset demo");
    expect(window.ENLBridge?.getRole?.()).toBe("super");
    superController.dispose();
  });

  it("boots registration, publishes OMRBridge, renders home screen, and cleans up on dispose", async () => {
    const controller = bootRegistration();
    await controller.ready;

    expect(window.OMRBridge).toBeDefined();
    expect(document.querySelector("#root")?.innerHTML).toContain("Sign in");
    expect(document.querySelector("#pills")?.innerHTML).toBe("");

    controller.dispose();
    expect(window.OMRBridge).toBeUndefined();
  });

  it("navigates across portals and verifies seeded Nikahnama VDS seal", async () => {
    const controller = bootRegistration();
    await controller.ready;

    window.OMRBridge?.setPortal?.("verify");
    expect(document.querySelector("#root")?.innerHTML).toContain(
      "Verify a Nikahnama or Marriage Certificate",
    );

    const sampleBtn = document.querySelector('[data-act="vsample"]');
    sampleBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 50));

    expect(document.querySelector("#root")?.innerHTML).toContain("Genuine and unchanged");
    controller.dispose();
  });

  it("requires email login on /inbox and filters emails to only the signed-in email address", async () => {
    const controller = bootRegistration({ initialPortal: "inbox" });
    await controller.ready;

    // 1. Before signing in, shows Email Sign-In screen
    const loginHtml = document.querySelector("#root")?.innerHTML ?? "";
    expect(loginHtml).toContain("Sign in to Email");
    expect(loginHtml).toContain('data-act="maillogin"');

    // 2. Send two emails to different addresses via OMRBridge
    window.OMRBridge?.mail("alice@mail.com", "Alice", "Alice Secret Invitation", ["Hello Alice"]);
    window.OMRBridge?.mail("bob@mail.com", "Bob", "Bob Private Certificate", ["Hello Bob"]);

    // 3. Sign in as alice@mail.com
    const emailInput = document.querySelector<HTMLInputElement>('[data-mailid="1"]');
    const passwordInput = document.querySelector<HTMLInputElement>('[data-mailpw="1"]');
    if (emailInput && passwordInput) {
      emailInput.value = "alice@mail.com";
      emailInput.dispatchEvent(new Event("input", { bubbles: true }));
      passwordInput.value = "demo-pass";
      passwordInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const loginBtn = document.querySelector('[data-act="maillogin"]');
    loginBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const aliceInboxHtml = document.querySelector("#root")?.innerHTML ?? "";
    expect(aliceInboxHtml).toContain("Email inbox · alice@mail.com");
    expect(aliceInboxHtml).toContain("Alice Secret Invitation");
    expect(aliceInboxHtml).not.toContain("Bob Private Certificate");

    // 4. Switch email / sign out and sign in as bob@mail.com
    const logoutBtn = document.querySelector('[data-act="maillogout"]');
    logoutBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(document.querySelector("#root")?.innerHTML).toContain("Sign in to Email");

    const bobChip = document.querySelector('[data-act="maildemo"][data-email="bob@mail.com"]');
    bobChip?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document
      .querySelector('[data-act="maillogin"]')
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    const bobInboxHtml = document.querySelector("#root")?.innerHTML ?? "";
    expect(bobInboxHtml).toContain("Email inbox · bob@mail.com");
    expect(bobInboxHtml).toContain("Bob Private Certificate");
    expect(bobInboxHtml).not.toContain("Alice Secret Invitation");

    controller.dispose();
  });

  it("autofills matching groom and bride couples based on the logged-in user's role and email", async () => {
    const controller = bootRegistration({
      initialPortal: "home",
      initialSignInRole: "applicant",
    });
    await controller.ready;

    const signInAndFillDemo = (email: string) => {
      // Sign out if currently logged in
      document
        .querySelector('[data-act="logout"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      const idInput = document.querySelector<HTMLInputElement>('[data-homeid="1"]');
      const pwInput = document.querySelector<HTMLInputElement>('[data-homepw="1"]');
      if (idInput && pwInput) {
        idInput.value = email;
        idInput.dispatchEvent(new Event("input", { bubbles: true }));
        pwInput.value = "demo-pass";
        pwInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      document
        .querySelector('[data-act="homesignin"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      // Start new application and click "Fill with demo data"
      document
        .querySelector('[data-act="newapp"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      document
        .querySelector('[data-act="demofill"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      // Read groom (tab 1) and bride (tab 2) details
      document
        .querySelector('[data-act="gotab"][data-t="1"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      const groomNameEn =
        document.querySelector<HTMLInputElement>('[data-b="groom.nameEn"]')?.value ?? "";
      const groomEmail =
        document.querySelector<HTMLInputElement>('[data-b="groom.email"]')?.value ?? "";

      document
        .querySelector('[data-act="gotab"][data-t="2"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      const brideNameEn =
        document.querySelector<HTMLInputElement>('[data-b="bride.nameEn"]')?.value ?? "";
      const brideEmail =
        document.querySelector<HTMLInputElement>('[data-b="bride.email"]')?.value ?? "";

      return { groomNameEn, groomEmail, brideNameEn, brideEmail };
    };

    // 1. Abdul Karim (Groom) -> Groom: Abdul Karim, Bride: Farzana Akter
    expect(signInAndFillDemo("abdul.karim@mail.com")).toEqual({
      groomNameEn: "Abdul Karim",
      groomEmail: "abdul.karim@mail.com",
      brideNameEn: "Farzana Akter",
      brideEmail: "farzana.akter@mail.com",
    });

    // 2. Farzana Akter (Bride) -> Bride: Farzana Akter, Groom: Abdul Karim
    expect(signInAndFillDemo("farzana.akter@mail.com")).toEqual({
      groomNameEn: "Abdul Karim",
      groomEmail: "abdul.karim@mail.com",
      brideNameEn: "Farzana Akter",
      brideEmail: "farzana.akter@mail.com",
    });

    // 3. Arif Rahman (Groom) -> Groom: Arif Rahman, Bride: Laboni Islam
    expect(signInAndFillDemo("arif.rahman@mail.com")).toEqual({
      groomNameEn: "Arif Rahman",
      groomEmail: "arif.rahman@mail.com",
      brideNameEn: "Laboni Islam",
      brideEmail: "laboni.islam@mail.com",
    });

    // 4. Laboni Islam (Bride) -> Bride: Laboni Islam, Groom: Arif Rahman
    expect(signInAndFillDemo("laboni.islam@mail.com")).toEqual({
      groomNameEn: "Arif Rahman",
      groomEmail: "arif.rahman@mail.com",
      brideNameEn: "Laboni Islam",
      brideEmail: "laboni.islam@mail.com",
    });

    controller.dispose();
  });
});
