import type { AnyDeps } from "../types";

/** services/onboarding. Dependencies: PEOPLE, UI, demoEmail, demoMobile, licOf, otp, renderOnb, userOf. */
export function createServicesOnboarding(dependencies: AnyDeps) {
  function startOnb(p: string): void {
    const pend =
      dependencies.UI.pending &&
      dependencies.UI.pending.p === p &&
      !dependencies.userOf(dependencies.UI.pending.nid)
        ? dependencies.UI.pending.nid
        : "";
    dependencies.UI.onb = {
      p,
      step: "register",
      email: "",
      phone: "",
      agree: false,
      otp: "",
      code: dependencies.otp(),
      sent: 0,
      pw: "",
      pw2: "",
      show1: false,
      show2: false,
      country: "BD",
      vtype: "NID",
      nid: "",
      dob: "",
      first: "",
      last: "",
      lic: "",
      demo: pend || "",
      err: "",
      via: "",
      hist: [],
    };
    if (pend) obFillPerson(pend);
    dependencies.renderOnb();
  }
  function obFillPerson(n: string): void {
    const o = dependencies.UI.onb;
    if (!o) return;
    const L = dependencies.licOf(n);
    o.demo = n;
    o.email = dependencies.demoEmail(n);
    o.phone = dependencies.demoMobile(n).slice(1);
    if (L && o.p === "registrar") o.lic = L;
  }
  function obGo(step: string): void {
    const o = dependencies.UI.onb;
    if (!o) return;
    o.hist.push(o.step);
    o.step = step;
    o.err = "";
    dependencies.renderOnb();
  }
  function obBack(): void {
    const o = dependencies.UI.onb;
    if (!o) return;
    clearTimeout(o.tm);
    clearInterval(o.iv);
    if (!o.hist.length) {
      dependencies.UI.onb = null;
      dependencies.renderOnb();
      return;
    }
    o.step = o.hist.pop() ?? "register";
    o.err = "";
    dependencies.renderOnb();
  }
  function obSplit(n: string): { first: string; last: string } {
    const parts = (dependencies.PEOPLE[n]?.en ?? "").split(" ");
    return {
      first: parts.slice(0, -1).join(" ") || (parts[0] ?? ""),
      last: parts.length > 1 ? (parts[parts.length - 1] ?? "") : "",
    };
  }
  return { startOnb, obFillPerson, obGo, obBack, obSplit };
}
