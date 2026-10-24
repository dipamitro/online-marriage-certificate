import type { AnyDeps, ApplicationRecord } from "../types";

/** components/dialogs. Dependencies: $, IC, PEOPLE, REGISTRARS, esc, hist, lifecycle, nidOk, now, otp, regName, render, save, sigDate, toEn. */
export function createComponentsDialogs(dependencies: AnyDeps) {
  let toastT: ReturnType<typeof setTimeout> | undefined;
  function toast(m: string): void {
    const t = dependencies.$("#toast") as HTMLElement | null;
    if (!t) return;
    t.textContent = m;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = dependencies.lifecycle.timeout(() => t.classList.remove("show"), 2600);
  }
  let mOk: (() => string | Promise<string>) | null = null;
  function modal(html: string, ok: (() => string | Promise<string>) | null): void {
    const m = dependencies.$("#modal") as HTMLElement | null;
    if (!m) return;
    m.innerHTML = `<div class="dlg" role="dialog" aria-modal="true">${html}</div>`;
    m.hidden = false;
    mOk = ok;
    const f = m.querySelector<HTMLElement>("input,textarea,button");
    if (f) f.focus();
  }
  function closeModal(): void {
    const m = dependencies.$("#modal") as HTMLElement | null;
    if (!m) return;
    m.hidden = true;
    m.innerHTML = "";
    mOk = null;
  }
  const LIVE = [
    "Hold your face inside the circle",
    "Blink slowly",
    "Turn your head a little to the left",
    "Matching with your NID photo",
  ];
  function ekycModal(a: ApplicationRecord, who: "reg" | "groom" | "bride"): void {
    const isReg = who === "reg",
      expect = isReg
        ? dependencies.REGISTRARS[a.f.registrar].nid
        : dependencies.toEn(a.f[who].nid).trim();
    const label = isReg ? dependencies.regName(a.f.registrar) : a.f[who].nameEn || "";
    modal(
      `<h3>Complete eKYC with OneID</h3><p class="sub">${isReg ? "Confirm your identity before approving with eSign." : "Confirm your identity before you eSign. Your NID and face are checked against the OneID / NID server."}</p>
    <div class="g2" style="margin-top:14px"><div class="fg"><label>NID number</label><input class="inp" id="k-nid" inputmode="numeric"></div><div class="fg"><label>Date of birth</label><input class="inp" type="date" id="k-dob"></div></div>
    <button class="btn bs" data-act="kfill" data-n="${expect}" style="font-size:11.5px;min-height:30px">Demo: fill ${dependencies.esc(label)}'s details</button>
    <p class="err" id="m-err"></p><div class="row"><button class="btn bs" data-act="mclose">Cancel</button><button class="btn bp" data-act="mok">Continue to face check</button></div>`,
      () => {
        const nidEl = dependencies.$("#k-nid") as HTMLInputElement | null,
          dobEl = dependencies.$("#k-dob") as HTMLInputElement | null;
        const n = dependencies.toEn(nidEl?.value ?? "").trim(),
          d = dobEl?.value ?? "";
        if (!dependencies.nidOk(n)) return "Enter a 10, 13 or 17-digit NID number.";
        if (!d) return "Enter your date of birth.";
        const rec = dependencies.PEOPLE[n];
        if (!rec) return "No OneID record matches this NID.";
        if (rec.dob !== d) return "The date of birth doesn't match the OneID record.";
        if (n !== expect)
          return isReg
            ? "This NID doesn't match the registrar's eSign profile."
            : "This NID doesn't match the one in the application. Ask the applicant to correct it.";
        const dlg = dependencies.$("#modal .dlg") as HTMLElement | null;
        if (dlg)
          dlg.innerHTML = `<h3>Liveness check</h3><div class="cam">${dependencies.IC.face}</div><p id="lt" style="text-align:center;font-weight:600">${LIVE[0]}</p><p class="sub" style="text-align:center">Simulated; the camera isn't used in this prototype.</p>`;
        let i = 0;
        const tick = () => {
          i++;
          if (i < LIVE.length) {
            const el = dependencies.$("#lt") as HTMLElement | null;
            if (el) el.textContent = LIVE[i] ?? "";
            dependencies.lifecycle.timeout(tick, 900);
          } else {
            const score = 96 + Math.random() * 3.5;
            if (isReg) a.reg.ekyc = { at: dependencies.now(), score };
            else {
              const nameMatch =
                (a.f[who].nameEn || "").trim().toLowerCase() === rec.en.toLowerCase();
              a.esign[who].ekyc = { at: dependencies.now(), score, nameMatch, oneName: rec.en };
              dependencies.hist(a, a.f[who].nameEn, "eKYC completed with OneID");
            }
            if (isReg)
              dependencies.hist(a, dependencies.regName(a.f.registrar), "Registrar eKYC completed");
            dependencies.save();
            closeModal();
            dependencies.render();
            toast("eKYC complete. You can now eSign.");
          }
        };
        dependencies.lifecycle.timeout(tick, 900);
        return "pending";
      },
    );
  }
  function otpModal(
    title: string,
    text: string,
    mobile: string,
    onOk: () => void | Promise<void>,
  ): void {
    const code = dependencies.otp();
    modal(
      `<h3>${title}</h3><p class="sub">${text}</p><div class="fg" style="margin-top:14px"><label>Code sent by SMS to mobile ending ${dependencies.esc(String(mobile).slice(-3))}</label><input class="inp otp" id="m-otp" inputmode="numeric" maxlength="6"><div class="demo-code">Demo1 code: ${code}</div></div><p class="err" id="m-err"></p><div class="row"><button class="btn bs" data-act="mclose">Cancel</button><button class="btn bg" data-act="mok">Sign</button></div>`,
      async () => {
        const otpInput = dependencies.$("#m-otp") as HTMLInputElement | null;
        if ((otpInput?.value ?? "").trim() !== code) return "That code doesn't match.";
        await onOk();
        return "";
      },
    );
  }
  function sigDetail(a: ApplicationRecord, k: "reg" | "groom" | "bride"): void {
    const rec = k === "reg" ? a.reg : a.esign[k],
      name = k === "reg" ? dependencies.regName(a.f.registrar) : a.f[k].nameEn;
    if (!rec.sign) return;
    modal(
      `<h3>Signature details</h3><div class="vres good" style="margin-top:8px"><b>✓ Signature is VALID</b><p style="font-size:12.5px;margin-top:4px">The document has not been modified since this signature was applied. The signer's certificate chains to a trusted root.</p></div>
    <div style="margin-top:12px"><div class="irow"><span>Signed by</span><span>${dependencies.esc(name)}</span></div><div class="irow"><span>Role</span><span>${k === "reg" ? "Marriage Registrar (" + a.f.registrar + ")" : k === "groom" ? "Groom" : "Bride"}</span></div><div class="irow"><span>Organization</span><span>${k === "reg" ? "Law &amp; Justice Division" : "Citizen (OneID)"}</span></div><div class="irow"><span>Country code</span><span>BD</span></div><div class="irow"><span>Signing time</span><span>${dependencies.sigDate(rec.sign.at)}</span></div><div class="irow"><span>Certificate serial</span><span>${dependencies.esc(rec.sign.serial)}</span></div><div class="irow"><span>Issuer</span><span>Bangladesh eSign CA (demo)</span></div><div class="irow"><span>Identity</span><span>OneID eKYC ${rec.ekyc ? "· face match " + rec.ekyc.score.toFixed(1) + "%" : ""}</span></div><div class="irow"><span>Revocation</span><span>Good (OCSP)</span></div></div>
    <div class="row"><button class="btn bp" data-act="mclose">Close</button></div>`,
      null,
    );
  }
  return {
    get toastT() {
      return toastT;
    },
    set toastT(value) {
      toastT = value;
    },
    toast,
    get mOk() {
      return mOk;
    },
    set mOk(value) {
      mOk = value;
    },
    modal,
    closeModal,
    LIVE,
    ekycModal,
    otpModal,
    sigDetail,
  };
}
