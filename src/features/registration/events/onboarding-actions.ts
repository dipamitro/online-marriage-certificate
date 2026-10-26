/* eslint-disable prettier/prettier */
import type { AnyDeps, OnboardingState } from "../types";

/** events/onboarding-actions. Dependencies: PEOPLE, REGISTRARS, UI, ageAt, mailOk, nidOk, obBack, obCands, obFillPerson, obGo, obSplit, otp, renderOnb, toEn, toast, userOf. */
export function createEventsOnboardingActions(dependencies: AnyDeps) {
  function deriveNameFromEmail(email: string): { first: string; last: string } {
    const local = (email.split("@")[0] ?? "citizen.user").replace(/[^a-zA-Z]+/g, " ").trim();
    const parts = local
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    if (parts.length >= 2) {
      return {
        first: parts.slice(0, -1).join(" "),
        last: parts[parts.length - 1] ?? "User",
      };
    }
    return {
      first: parts[0] || "New",
      last: "Citizen",
    };
  }

  function generateUniqueNid(): string {
    let candidate = "199" + String(Math.floor(1000000 + Math.random() * 8999999));
    while (dependencies.userOf(candidate) || dependencies.PEOPLE[candidate]) {
      candidate = "199" + String(Math.floor(1000000 + Math.random() * 8999999));
    }
    return candidate;
  }

  function ensureCandidateIdentity(o: OnboardingState): void {
    if (o.demo && dependencies.PEOPLE[o.demo] && !dependencies.userOf(o.demo)) {
      const s = dependencies.obSplit(o.demo);
      o.nid = o.demo;
      o.dob = dependencies.PEOPLE[o.demo].dob;
      o.first = s.first;
      o.last = s.last;
      return;
    }
    if (!o.nid || dependencies.userOf(o.nid)) {
      o.nid = generateUniqueNid();
    }
    if (!o.dob) {
      o.dob = "1996-05-15";
    }
    if (!o.first || !o.last) {
      const derived = deriveNameFromEmail(String(o.email || ""));
      o.first = o.first || derived.first;
      o.last = o.last || derived.last;
    }
    const fullName = `${String(o.first).trim()} ${String(o.last).trim()}`.trim();
    dependencies.PEOPLE[o.nid] = {
      en: fullName,
      bn: dependencies.PEOPLE[o.nid]?.bn || fullName,
      g: "M",
      dob: o.dob,
    };
  }

  function obAction(act: string, b: HTMLElement): boolean {
    const o = dependencies.UI.onb;
    if (!o) return false;
    switch (act) {
      case "ob-back":
        dependencies.obBack();
        return true;
      case "ob-close":
        clearTimeout(o.tm);
        clearInterval(o.iv);
        dependencies.UI.onb = null;
        dependencies.renderOnb();
        return true;
      case "ob-demo":
        dependencies.obFillPerson(b.dataset["n"]);
        o.agree = true;
        o.err = "";
        dependencies.renderOnb();
        return true;
      case "ob-reg": {
        const em = o.email.trim(),
          ph = dependencies
            .toEn(o.phone)
            .replace(/\D/g, "")
            .replace(/^(\+?880|0)/, "");
        if (!dependencies.mailOk(em)) {
          o.err = "Enter a valid email address.";
          return (dependencies.renderOnb(), true);
        }
        if (!/^1\d{9}$/.test(ph)) {
          o.err = "Enter your 10-digit phone number after +880 (e.g. 1712345678).";
          return (dependencies.renderOnb(), true);
        }
        if (!o.agree) {
          o.err = "Please agree to the Terms and Conditions and Privacy Policy.";
          return (dependencies.renderOnb(), true);
        }
        // If user edited email away from the pre-filled demo person's email, clear demo binding so a custom user is created
        if (o.demo && dependencies.PEOPLE[o.demo]) {
          const expectedDemoEmail = (dependencies.PEOPLE[o.demo].en || "")
            .toLowerCase()
            .replace(/[^a-z]+/g, ".")
            .replace(/^\.|\.$/g, "");
          if (!em.toLowerCase().includes(expectedDemoEmail.split(".")[0] ?? "")) {
            o.demo = "";
          }
        }
        o.phone = ph;
        o.code = dependencies.otp();
        o.otp = "";
        o.sent = Date.now();
        dependencies.obGo("otp");
        return true;
      }
      case "ob-otpfill":
        o.otp = o.code;
        dependencies.renderOnb();
        return true;
      case "ob-resend":
        o.code = dependencies.otp();
        o.otp = "";
        o.sent = Date.now();
        dependencies.renderOnb();
        dependencies.toast("Code resent");
        return true;
      case "ob-otp":
        if (o.otp !== o.code) {
          o.err = "That code doesn't match. Check your email and try again.";
          o.otp = "";
          dependencies.renderOnb();
          return true;
        }
        dependencies.obGo("password");
        return true;
      case "ob-eye": {
        const k = b.dataset["k"];
        if (k) o[k] = !o[k];
        dependencies.renderOnb();
        return true;
      }
      case "ob-pwfill":
        o.pw = o.pw2 = "Demo@2026";
        dependencies.renderOnb();
        return true;
      case "ob-pw":
        if (o.pw.length < 8) {
          o.err = "Use at least 8 characters.";
          dependencies.renderOnb();
          return true;
        }
        if (o.pw !== o.pw2) {
          o.err = "The passwords don't match.";
          dependencies.renderOnb();
          return true;
        }
        dependencies.obGo("start");
        return true;
      case "ob-start":
        dependencies.obGo(o.vtype === "PASSPORT" ? "pmethod" : "method");
        return true;
      case "ob-pscan": {
        ensureCandidateIdentity(o);
        if (dependencies.userOf(o.nid)) {
          o.err = "This person already has an account.";
          dependencies.renderOnb();
          return true;
        }
        dependencies.obGo("pScan");
        return true;
      }
      case "ob-camera": {
        ensureCandidateIdentity(o);
        if (dependencies.userOf(o.nid)) {
          o.err = "This NID already has an account.";
          dependencies.renderOnb();
          return true;
        }
        dependencies.obGo("scanFront");
        return true;
      }
      case "ob-manfill": {
        ensureCandidateIdentity(o);
        dependencies.renderOnb();
        return true;
      }
      case "ob-manual": {
        const n = dependencies.toEn(o.nid).trim();
        if (!o.dob) {
          o.err = "Enter your date of birth.";
          dependencies.renderOnb();
          return true;
        }
        if (!dependencies.nidOk(n)) {
          o.err = "Enter a 10, 13 or 17-digit NID number.";
          dependencies.renderOnb();
          return true;
        }
        if (!o.first.trim() || !o.last.trim()) {
          o.err = "Enter your first and last name as on the NID.";
          dependencies.renderOnb();
          return true;
        }
        const fullName = `${o.first.trim()} ${o.last.trim()}`.trim();
        dependencies.PEOPLE[n] = {
          en: fullName,
          bn: dependencies.PEOPLE[n]?.bn || fullName,
          g: dependencies.PEOPLE[n]?.g || "M",
          dob: o.dob,
        };
        o.nid = n;
        o.via = "manual";
        return (obAfterNid(), true);
      }
      case "ob-confirm": {
        const n = dependencies.toEn(o.nid).trim();
        if (!dependencies.nidOk(n)) {
          o.err = "Enter a valid 10, 13 or 17-digit NID number.";
          dependencies.renderOnb();
          return true;
        }
        if (!o.dob) {
          o.err = "Enter your date of birth.";
          dependencies.renderOnb();
          return true;
        }
        if (!o.first.trim() || !o.last.trim()) {
          o.err = "Enter your first and last name.";
          dependencies.renderOnb();
          return true;
        }
        const fullName = `${o.first.trim()} ${o.last.trim()}`.trim();
        dependencies.PEOPLE[n] = {
          en: fullName,
          bn: dependencies.PEOPLE[n]?.bn || fullName,
          g: dependencies.PEOPLE[n]?.g || "M",
          dob: o.dob,
        };
        o.nid = n;
        return (obAfterNid(), true);
      }
      case "ob-rescan":
        o.hist = o.hist.filter(
          (s: string) => !["scanFront", "scanBack", "pScan", "pNfc"].includes(s),
        );
        o.step = o.vtype === "PASSPORT" ? "pmethod" : "method";
        o.err = "";
        dependencies.renderOnb();
        return true;
    }
    return false;
  }
  function obAfterNid(): void {
    const o = dependencies.UI.onb;
    if (!o) return;
    const n = o.nid,
      rec = dependencies.PEOPLE[n];
    if (dependencies.userOf(n)) {
      o.err = "This NID already has an account. Sign in instead.";
      dependencies.renderOnb();
      return;
    }
    const dobToCheck = o.dob || rec?.dob || "";
    if ((dependencies.ageAt(dobToCheck) ?? 0) < 18) {
      o.err = "You must be 18 or older to create an account.";
      dependencies.renderOnb();
      return;
    }
    dependencies.obGo("face");
  }
  return { obAction, obAfterNid };
}
