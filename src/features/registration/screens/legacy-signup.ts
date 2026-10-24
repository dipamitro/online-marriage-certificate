import type { AnyDeps } from "../types";

/** screens/legacy-signup. Dependencies: $, IC, LIVE, PEOPLE, REGISTRARS, S, UI, ageAt, esc, lifecycle, mailOk, mobOk, modal, nidOk, now, save, toEn, userOf. */
export function createScreensLegacySignup(dependencies: AnyDeps) {
  function signupModal(p: string): void {
    const isReg = p === "registrar";
    const cands = (
      isReg
        ? Object.keys(dependencies.REGISTRARS).map((l) => dependencies.REGISTRARS[l].nid)
        : ["1990123456", "2001987654", "5678901234"]
    ).filter((n: string) => !dependencies.userOf(n));
    const pre =
      dependencies.UI.pending &&
      dependencies.UI.pending.p === p &&
      !dependencies.userOf(dependencies.UI.pending.nid)
        ? dependencies.UI.pending.nid
        : "";
    dependencies.modal(
      `<h3>Sign up with OneID eKYC</h3><p class="sub">${isReg ? "Licensed marriage registrars" : "Applicants, brides and grooms"} verify their identity once: NID, date of birth and a liveness face check. After this you can sign in and eSign without doing eKYC again.</p>
    <div class="g2" style="margin-top:14px"><div class="fg"><label>NID number</label><input class="inp" id="su-nid" inputmode="numeric" value="${pre}"></div><div class="fg"><label>Date of birth</label><input class="inp" type="date" id="su-dob" value="${pre && dependencies.PEOPLE[pre] ? dependencies.PEOPLE[pre].dob : ""}"></div>
    <div class="fg"><label>Mobile</label><input class="inp" id="su-mob" inputmode="tel" placeholder="01XXXXXXXXX"></div><div class="fg"><label>Email</label><input class="inp" id="su-mail" type="email"></div>
    ${isReg ? `<div class="fg"><label>Registrar licence number</label><input class="inp" id="su-lic" placeholder="NR-DHK-0000"></div>` : ""}<div class="fg"><label>Password</label><input class="inp" id="su-pw" type="password" value="demo-pass"></div></div>
    ${cands.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:11.5px;color:var(--tx3)">Demo: ${cands.map((n: string) => `<button class="btn bs" style="min-height:28px;padding:3px 10px;font-size:11.5px" data-act="sfill" data-n="${n}">${dependencies.esc(dependencies.PEOPLE[n].en)}</button>`).join("")}</div>` : ""}
    <p class="err" id="m-err"></p><div class="row"><button class="btn bs" data-act="mclose">Cancel</button><button class="btn bp" data-act="mok">Continue to face check</button></div>`,
      () => {
        const nidEl = dependencies.$("#su-nid") as HTMLInputElement | null,
          dobEl = dependencies.$("#su-dob") as HTMLInputElement | null,
          mobEl = dependencies.$("#su-mob") as HTMLInputElement | null,
          mailEl = dependencies.$("#su-mail") as HTMLInputElement | null;
        const n = dependencies.toEn(nidEl?.value ?? "").trim(),
          d = dobEl?.value ?? "",
          mob = dependencies.toEn(mobEl?.value ?? "").trim(),
          mail = (mailEl?.value ?? "").trim();
        if (!dependencies.nidOk(n)) return "Enter a 10, 13 or 17-digit NID number.";
        if (!d) return "Enter your date of birth.";
        const rec = dependencies.PEOPLE[n];
        if (!rec) return "No OneID record matches this NID.";
        if (rec.dob !== d) return "The date of birth doesn't match the OneID record.";
        if (dependencies.userOf(n))
          return "This NID already has an account. Close this and sign in.";
        if ((dependencies.ageAt(rec.dob) ?? 0) < 18)
          return "You must be 18 or older to create an account.";
        if (!dependencies.mobOk(mob)) return "Enter an 11-digit mobile number starting with 01.";
        if (!dependencies.mailOk(mail)) return "Enter a valid email address.";
        let lic: string | null = null;
        if (isReg) {
          const licEl = dependencies.$("#su-lic") as HTMLInputElement | null;
          lic = (licEl?.value ?? "").trim().toUpperCase();
          const R = dependencies.REGISTRARS[lic];
          if (!R) return "This licence isn't in the licensed marriage registrar database.";
          if (R.nid !== n) return `This NID doesn't match the registrar licensed under ${lic}.`;
        }
        const dlg = dependencies.$("#modal .dlg") as HTMLElement | null;
        if (dlg)
          dlg.innerHTML = `<h3>Liveness check</h3><div class="cam">${dependencies.IC.face}</div><p id="lt" style="text-align:center;font-weight:600">${dependencies.LIVE[0]}</p><p class="sub" style="text-align:center">Matching your face with your NID photo. Simulated; the camera isn't used.</p>`;
        let i = 0;
        const tick = () => {
          i++;
          if (i < dependencies.LIVE.length) {
            const el = dependencies.$("#lt") as HTMLElement | null;
            if (el) el.textContent = dependencies.LIVE[i] ?? "";
            dependencies.lifecycle.timeout(tick, 900);
          } else {
            const score = 96 + Math.random() * 3.5;
            dependencies.S.users[n] = {
              nid: n,
              role: isReg ? "Marriage Registrar" : "Applicant",
              email: mail,
              mobile: mob,
              ekyc: { at: dependencies.now(), score },
              at: dependencies.now(),
            };
            dependencies.save();
            const dlgDone = dependencies.$("#modal .dlg") as HTMLElement | null;
            if (dlgDone)
              dlgDone.innerHTML = `<h3>Account created</h3><div class="vres good" style="margin-top:8px"><b>✓ eKYC complete</b><p style="font-size:12.5px;margin-top:4px">${dependencies.esc(rec.en)}, your identity is verified by OneID (face match ${score.toFixed(1)}%). You won't need to do eKYC again to eSign${isReg ? " or approve" : ""}.</p></div>${isReg ? `<div class="irow"><span>Licence</span><span>${lic}</span></div>` : ""}<div class="irow"><span>NID</span><span>••••${n.slice(-4)}</span></div><div class="irow"><span>Mobile</span><span>${dependencies.esc(mob)}</span></div><div class="row"><button class="btn bp" data-act="signinnew" data-p="${p}" data-n="${n}">Sign in now</button></div>`;
          }
        };
        dependencies.lifecycle.timeout(tick, 900);
        return "pending";
      },
    );
  }
  return { signupModal };
}
