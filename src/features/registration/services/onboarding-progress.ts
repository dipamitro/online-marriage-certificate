import type { AnyDeps } from "../types";

/** services/onboarding-progress. Dependencies: $, PEOPLE, S, UI, doLogin, licOf, lifecycle, now, obGo, obSplit, onbHTML, save, toEn. */
export function createServicesOnboardingProgress(dependencies: AnyDeps) {
  function renderOnb(): void {
    const el = dependencies.$("#onb") as HTMLElement | null;
    if (!el) return;
    const o = dependencies.UI.onb;
    if (!o) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    el.hidden = false;
    el.innerHTML = `<div class="ob" role="dialog" aria-modal="true" aria-label="Sign up with OneID">${dependencies.onbHTML()}</div>`;
    clearInterval(o.iv);
    clearTimeout(o.tm);
    if (o.step === "otp") {
      o.iv = dependencies.lifecycle.interval(() => {
        const t = dependencies.$("#ob-timer") as HTMLElement | null;
        const left = 47 - Math.floor((Date.now() - o.sent) / 1000);
        if (!t) {
          clearInterval(o.iv);
          return;
        }
        if (left <= 0) {
          clearInterval(o.iv);
          const resend = dependencies.$("#ob-resend") as HTMLElement | null;
          if (resend)
            resend.innerHTML = `Didn't receive code? <button data-act="ob-resend">Resend</button>`;
        } else t.textContent = String(left);
      }, 1000);
      const f = el.querySelector<HTMLElement>('[data-otp="' + Math.min(o.otp.length, 5) + '"]');
      if (f) f.focus();
    }
    if (o.step === "pNfc") {
      dependencies.lifecycle.frame(() => {
        const bar = dependencies.$("#nfc-bar") as HTMLElement | null;
        if (bar) bar.style.width = "100%";
      });
      let k = 0;
      const items = () => [...document.querySelectorAll<HTMLElement>("#nfc-list li")];
      const tick = () => {
        if (!dependencies.UI.onb || dependencies.UI.onb.step !== "pNfc") return;
        const L = items();
        L.forEach((li, i) => {
          li.classList.toggle("ok", i < k);
          li.classList.toggle("on", i === k);
          const icon = li.querySelector("i");
          if (i < k && icon) icon.textContent = "✓";
        });
        k++;
        if (k <= L.length) o.tm = dependencies.lifecycle.timeout(tick, 900);
        else
          o.tm = dependencies.lifecycle.timeout(() => {
            if (!dependencies.UI.onb || dependencies.UI.onb.step !== "pNfc") return;
            const targetNid = o.demo || o.nid;
            if (targetNid && dependencies.PEOPLE[targetNid]) {
              const s2 = dependencies.obSplit(targetNid);
              o.nid = targetNid;
              o.dob = o.dob || dependencies.PEOPLE[targetNid].dob;
              o.first = o.first || s2.first;
              o.last = o.last || s2.last;
            }
            o.via = "passport";
            dependencies.obGo("confirm");
          }, 600);
      };
      o.tm = dependencies.lifecycle.timeout(tick, 400);
    }
    if (o.step === "pScan") {
      dependencies.lifecycle.frame(() => {
        const bar = dependencies.$("#ob-bar") as HTMLElement | null;
        if (bar) bar.style.width = "100%";
      });
      o.tm = dependencies.lifecycle.timeout(() => {
        if (!dependencies.UI.onb || dependencies.UI.onb.step !== "pScan") return;
        const pl = dependencies.$("#ob-pill") as HTMLElement | null;
        if (pl) {
          pl.textContent = "Data page captured ✓";
          pl.classList.add("ok");
        }
        o.tm = dependencies.lifecycle.timeout(() => {
          if (dependencies.UI.onb && dependencies.UI.onb.step === "pScan")
            dependencies.obGo("pNfc");
        }, 800);
      }, 2100);
    }
    if (o.step === "scanFront" || o.step === "scanBack" || o.step === "face") {
      const step = o.step;
      dependencies.lifecycle.frame(() => {
        const bar = dependencies.$("#ob-bar") as HTMLElement | null;
        if (bar) bar.style.width = "100%";
      });
      o.tm = dependencies.lifecycle.timeout(() => {
        if (!dependencies.UI.onb || dependencies.UI.onb.step !== step) return;
        const pl = dependencies.$("#ob-pill") as HTMLElement | null;
        if (pl) {
          pl.textContent = step === "face" ? "Face matched ✓" : "Captured ✓";
          pl.classList.add("ok");
        }
        o.tm = dependencies.lifecycle.timeout(() => {
          if (!dependencies.UI.onb || dependencies.UI.onb.step !== step) return;
          if (step === "scanFront") dependencies.obGo("scanBack");
          else if (step === "scanBack") {
            const targetNid = o.demo || o.nid;
            if (targetNid && dependencies.PEOPLE[targetNid]) {
              const s = dependencies.obSplit(targetNid);
              o.nid = targetNid;
              o.dob = o.dob || dependencies.PEOPLE[targetNid].dob;
              o.first = o.first || s.first;
              o.last = o.last || s.last;
            }
            o.via = "scan";
            dependencies.obGo("confirm");
          } else obFinish();
        }, 700);
      }, 1900);
    }
  }
  function obFinish(): void {
    const o = dependencies.UI.onb;
    if (!o) return;
    const n = o.nid,
      score = 96 + Math.random() * 3.5;
    const fullName =
      `${(o.first || "").trim()} ${(o.last || "").trim()}`.trim() ||
      dependencies.PEOPLE[n]?.en ||
      n;
    const nameBn = dependencies.PEOPLE[n]?.bn || fullName;
    const dob = o.dob || dependencies.PEOPLE[n]?.dob || "1996-05-15";

    dependencies.PEOPLE[n] = {
      en: fullName,
      bn: nameBn,
      g: dependencies.PEOPLE[n]?.g || "M",
      dob,
    };

    const mobileNormalized = "0" + dependencies.toEn(o.phone).replace(/\D/g, "").slice(-10);

    dependencies.S.users[n] = {
      nid: n,
      role:
        o.p === "registrar"
          ? dependencies.licOf(n)
            ? "Marriage Registrar"
            : "Registrar applicant"
          : "Applicant",
      name: fullName,
      nameBn,
      dob,
      password: o.pw || "",
      email: o.email.trim(),
      mobile: mobileNormalized,
      ekyc: {
        at: dependencies.now(),
        score,
        method:
          o.via === "passport"
            ? "Passport scan + NFC chip + face match"
            : o.via === "scan"
              ? "NID scan + face match"
              : "Manual NID + face match",
      },
      at: dependencies.now(),
    };
    if (o.p === "registrar") {
      window.ENLBridge?.syncUser?.({
        nid: n,
        name: fullName,
        nameBn,
        dob,
        email: o.email.trim(),
        mobile: mobileNormalized,
        ekycAt: dependencies.now(),
      });
    }
    dependencies.save();
    dependencies.UI.home.id = o.email.trim();
    dependencies.UI.home.pw = o.pw || "";
    o.step = "done";
    renderOnb();
    const pend =
      dependencies.UI.pending &&
      dependencies.UI.pending.p === o.p &&
      dependencies.UI.pending.nid === n
        ? dependencies.UI.pending
        : null;
    o.tm = dependencies.lifecycle.timeout(() => {
      dependencies.UI.onb = null;
      renderOnb();
      dependencies.UI.portal = o.p;
      dependencies.doLogin(o.p, n, pend ? pend.appId : null);
    }, 1000);
  }
  return { renderOnb, obFinish };
}
