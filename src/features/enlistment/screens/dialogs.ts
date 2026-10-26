/* eslint-disable prettier/prettier */
import type { EnlApplication, EnlState, EnlUIState, EnlUser, JurNode } from "../types";
import { SIGNUP_DEMOS, PEOPLE } from "../constants/people";
import { esc, fD, fDT, bn, now } from "../services/applications";
import { placeOf, pathOf } from "../services/jurisdiction";

export interface DialogDeps {
  $: (s: string) => HTMLElement | null;
  jur: Record<string, JurNode>;
  state: EnlState;
  ui: EnlUIState;
  save: () => void;
  log: (by: string, text: string, appId?: string | null) => void;
  render: () => void;
}

export function createScreensDialogs(deps: DialogDeps) {
  const { $, jur, state, ui, save, render, log } = deps;

  function certHTML(a: EnlApplication): string {
    const sealPart = (a.seal || "").split("|S:")[1];
    return `<div class="cert"><div class="in"><div class="g">GOVERNMENT OF THE PEOPLE'S REPUBLIC OF BANGLADESH</div><div class="o">LAW AND JUSTICE DIVISION</div>
    <h2>নিকাহ রেজিস্ট্রার লাইসেন্স</h2><div class="no">Marriage Registrar Licence · ${esc(a.licenceNo)}</div>
    <p>এই মর্মে প্রত্যয়ন করা যাচ্ছে যে <b>${esc(a.p.nameBn)}</b> (${esc(a.p.nameEn)}), জাতীয় পরিচয়পত্র নম্বর ••••${esc(String(a.p.nid).slice(-4))}, কে <b>${esc(placeOf(jur, a.j.wards))}</b>, ${esc(
      pathOf(jur, a.j.upz)
        .map((n: JurNode) => n.name)
        .reverse()
        .join(", "),
    )} এলাকার জন্য নিকাহ রেজিস্ট্রার হিসেবে লাইসেন্স প্রদান করা হলো। কার্যালয়: ${esc(a.o.address)}। মেয়াদ: ${bn(fD(a.validTo))} পর্যন্ত।</p>
    <div class="ft"><div><div class="qr" data-qr="${esc(a.seal || "")}"></div><div class="pki">PKI Ref: ${esc(sealPart ? sealPart.slice(0, 20) : "")}</div></div>
    <div class="vsig"><div class="scr">${esc(a.approvedBy)}</div>Signed by: <b>${esc(a.approvedBy)}</b><br>${esc(a.approverTitle || "Super Admin")}, Law and Justice Division<br>Country code: BD<br>Date: ${fDT(a.approvedAt)}</div></div></div></div>`;
  }

  /* ---------- modal and toast ---------- */
  let mOk: (() => string | Promise<string | undefined> | undefined) | null = null,
    toastT: ReturnType<typeof setTimeout> | undefined;
  function toast(m: string): void {
    const t = $("#etoast");
    if (!t || !m) return;
    t.textContent = m;
    t.classList.add("show");
    if (toastT) clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 1500);
  }
  function modal(
    html: string,
    ok: (() => string | Promise<string | undefined> | undefined) | null,
    wide?: boolean | string,
  ): void {
    const m = $("#emodal");
    if (!m) return;
    m.innerHTML = `<div class="dlg ${wide ? "wide" : ""}" role="dialog" aria-modal="true">${html}</div>`;
    m.hidden = false;
    mOk = ok;
    const f = m.querySelector<HTMLElement>("input,textarea,select,button");
    if (f) f.focus();
  }
  function closeModal(): void {
    const m = $("#emodal");
    if (m) {
      m.hidden = true;
      m.innerHTML = "";
    }
    mOk = null;
  }
  function reasonModal(
    title: string,
    text: string,
    btn: string,
    danger: boolean,
    onOk: (reason: string) => void,
  ): void {
    const rsEl = $("#m-rs") as HTMLTextAreaElement | null;
    const t = rsEl ? rsEl.value.trim() : "";
    modal(
      '<div class="reason-modal"><p>' +
        esc(text) +
        '</p><textarea id="m-rs" class="inp" placeholder="Enter reason / notes here..." style="min-height:90px"></textarea></div>',
      () => {
        const val = ($("#m-rs") as HTMLTextAreaElement | null)?.value.trim() || "";
        if (!val) return "Please enter a reason";
        onOk(val);
        return undefined;
      },
      btn,
    );
  }
  function signupModal(): void {
    const c = SIGNUP_DEMOS.filter((n) => !state.users.some((u) => u.nid === n));
    modal(
      `<h3>Sign up with OneID eKYC</h3><p class="sub">Verify your identity once with your NID and a face check. You won't need to do it again.</p>
    <div class="g2" style="margin-top:12px"><div class="fg"><label>NID number</label><input class="inp" id="su-nid" inputmode="numeric"></div><div class="fg"><label>Date of birth</label><input class="inp" type="date" id="su-dob"></div><div class="fg"><label>Mobile</label><input class="inp" id="su-mob" placeholder="01XXXXXXXXX"></div><div class="fg"><label>Email</label><input class="inp" id="su-mail" type="email"></div></div>
    ${c.length ? `<p class="demo">Demo: ${c.map((n) => `<button class="btn sm" data-act="sufill" data-n="${n}">${esc(PEOPLE[n]?.en)}</button>`).join(" ")}</p>` : ""}
    <p class="err" id="m-err" hidden></p><div class="row"><button class="btn" data-act="mclose">Cancel</button><button class="btn bp" data-act="mok">Continue to face check</button></div>`,
      () => {
        const n = ($("#su-nid") as HTMLInputElement | null)?.value.trim() ?? "",
          d = ($("#su-dob") as HTMLInputElement | null)?.value ?? "",
          mob = ($("#su-mob") as HTMLInputElement | null)?.value.trim() ?? "",
          em = ($("#su-mail") as HTMLInputElement | null)?.value.trim() ?? "";
        const P = PEOPLE[n];
        if (!P) return "No NID record matches this number.";
        if (P.dob !== d) return "The date of birth doesn't match the NID record.";
        if (state.users.some((u) => u.nid === n))
          return "This NID already has an account. Sign in instead.";
        if (!/^01\d{9}$/.test(mob)) return "Enter an 11-digit mobile number starting with 01.";
        if (!/^\state+@\state+\.\state+$/.test(em)) return "Enter a valid email address.";
        const dlg = $("#emodal .dlg");
        if (dlg) {
          dlg.innerHTML = `<h3>Face check</h3><div class="cam"><span>🙂</span></div><p style="text-align:center;font-weight:600" id="lv">Hold your face inside the circle</p><p class="sub" style="text-align:center">Simulated; the camera isn't used.</p>`;
        }
        setTimeout(() => {
          const el = $("#lv");
          if (el) el.textContent = "Matching with your NID photo";
        }, 900);
        setTimeout(() => {
          const u: EnlUser = {
            id: "u" + Date.now(),
            role: "applicant",
            nid: n,
            name: P.en,
            email: em,
            mobile: mob,
            active: true,
            ekycAt: now(),
          };
          state.users.push(u);
          log(P.en, "Signed up with OneID eKYC");
          save();
          closeModal();
          ui.auth["applicant"] = n;
          ui.login["applicant"] = n;
          ui.page["applicant"] = "dash";
          render();
          toast("Account verified");
        }, 2000);
        return "pending";
      },
    );
  }
  function otpModal(title: string, text: string, onOk: () => Promise<void>): void {
    // const code = otpCode();
    const code = "000000";
    modal(
      `<h3>${title}</h3><p class="sub">${text}</p><div class="fg" style="margin-top:12px"><label>Code sent by SMS to your registered mobile</label><input class="inp otp" id="m-otp" inputmode="numeric" maxlength="6"><div class="demo">Demo code: ${code}</div></div><p class="err" id="m-err" hidden></p><div class="row"><button class="btn" data-act="mclose">Cancel</button><button class="btn bp" data-act="mok">Sign and approve</button></div>`,
      async () => {
        const otpEl = $("#m-otp") as HTMLInputElement | null;
        if ((otpEl?.value.trim() ?? "") !== code) return "That code doesn't match.";
        await onOk();
        return "";
      },
    );
  }

  return {
    certHTML,
    toast,
    modal,
    closeModal,
    reasonModal,
    signupModal,
    otpModal,
  };
}
