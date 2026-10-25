import type { AnyDeps } from "../types";

/** events/form-events. Dependencies: $, UI, bn, closeModal, fee, inr, lifecycle, render, setP, tabHTML, toEn. */
export function createEventsFormEvents(dependencies: AnyDeps) {
  dependencies.lifecycle.listen(document, "input", (e: Event) => {
    const target = e.target;
    if (!(target instanceof HTMLElement) || target.closest("#eroot, #emodal")) return;
    const t = target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (t.dataset["homeid"]) {
      dependencies.UI.home.id = t.value;
      return;
    }
    if (t.dataset["homepw"]) {
      dependencies.UI.home.pw = t.value;
      return;
    }
    if (t.dataset["mailid"]) {
      dependencies.UI.inbox.emailInput = t.value;
      dependencies.UI.inbox.err = "";
      return;
    }
    if (t.dataset["mailpw"]) {
      dependencies.UI.inbox.passwordInput = t.value;
      dependencies.UI.inbox.err = "";
      return;
    }
    if (dependencies.UI.onb && t.dataset["ob"]) {
      dependencies.UI.onb[t.dataset["ob"]] = t.value;
      dependencies.UI.onb.err = "";
    }
    if (dependencies.UI.onb && t.dataset["otp"] !== undefined) {
      const boxes = [...document.querySelectorAll<HTMLInputElement>("[data-otp]")],
        i = Number(t.dataset["otp"]),
        d = t.value.replace(/\D/g, "");
      if (d.length > 1) {
        d.split("")
          .slice(0, 6 - i)
          .forEach((ch, k) => {
            const box = boxes[i + k];
            if (box) box.value = ch;
          });
      } else t.value = d;
      dependencies.UI.onb.otp = boxes.map((x) => x.value).join("");
      const nx = boxes[Math.min(i + Math.max(d.length, 1), 5)];
      if (d && nx) nx.focus();
      const vb = dependencies.$("#ob-verify") as HTMLButtonElement | null;
      if (vb) vb.disabled = dependencies.UI.onb.otp.length !== 6;
    }
    if (t.dataset["b"] && dependencies.UI.draft && t.type !== "radio") {
      dependencies.setP(dependencies.UI.draft.f, t.dataset["b"], t.value);
      if (t.dataset["b"] === "m.mohor") {
        const mo = Number(dependencies.toEn(t.value)) || 0,
          fv = dependencies.fee(mo);
        const fe = dependencies.$("#feeval") as HTMLInputElement | null;
        if (fe) fe.value = "৳" + dependencies.bn(dependencies.inr(fv));
        const fn = dependencies.$("#feenote") as HTMLElement | null;
        if (fn)
          fn.innerHTML =
            mo <= 400000
              ? `দেনমোহরের পরিমাণ ${dependencies.bn(dependencies.inr(mo))} টাকার ১.২৫% হারে = ${dependencies.bn(dependencies.inr(fv))} টাকা`
              : `দেনমোহরের পরিমাণ ${dependencies.bn(dependencies.inr(mo))} টাকা:<br>• প্রথম ৪,০০,০০০ টাকার ১.২৫% হারে - ৫,০০০ টাকা<br>• অবশিষ্ট ${dependencies.bn(dependencies.inr(mo - 400000))} টাকার প্রতি লাখে ১০০ টাকা করে - ${dependencies.bn(dependencies.inr(fv - 5000))} টাকা`;
      }
    }
    if (t.dataset["v"]) dependencies.UI.verify.input = t.value;
  });
  dependencies.lifecycle.listen(document, "change", (e: Event) => {
    const target = e.target;
    if (!(target instanceof HTMLElement) || target.closest("#eroot, #emodal")) return;
    const t = target as HTMLInputElement & HTMLSelectElement;
    const d = t.dataset;
    if (d["homerole"]) {
      dependencies.UI.home.role = t.value;
      dependencies.UI.home.err = "";
      dependencies.UI.home.id = "";
      dependencies.UI.home.pw = "";
      dependencies.render();
      return;
    }
    if (d["homeacct"]) {
      dependencies.UI.home.acct[d["homeacct"]] = t.value;
      return;
    }
    if (dependencies.UI.onb && d["obchk"]) {
      dependencies.UI.onb[d["obchk"]] = t.checked;
      dependencies.UI.onb.err = "";
      return;
    }
    if (d["login"]) {
      dependencies.UI.login[d["login"]] = t.value;
      return;
    }
    if (d["accept"]) {
      dependencies.UI.accept = t.checked;
      dependencies.render();
      return;
    }
    if (d["chk"] && dependencies.UI.draft) {
      const arr: string[] = dependencies.UI.draft.f.m.c17o;
      const i = arr.indexOf(d["chk"]);
      if (t.checked && i < 0) arr.push(d["chk"]);
      if (!t.checked && i >= 0) arr.splice(i, 1);
      return;
    }
    if (d["b"] && dependencies.UI.draft) {
      dependencies.setP(dependencies.UI.draft.f, d["b"], t.value);
      if (d["b"].startsWith("loc.")) {
        const order = ["div", "dist", "upz", "uni", "ward"],
          k = d["b"].split(".")[1] ?? "";
        order.slice(order.indexOf(k) + 1).forEach((x) => (dependencies.UI.draft.f.loc[x] = ""));
        dependencies.UI.draft.f.registrar = "";
      }
      if (/\.addr\.dist$/.test(d["b"]))
        dependencies.setP(dependencies.UI.draft.f, d["b"].replace(/dist$/, "upz"), "");
      if (d["rr"]) {
        const y = window.scrollY;
        const tabBody = dependencies.$("#tabbody") as HTMLElement | null;
        if (tabBody) tabBody.innerHTML = dependencies.tabHTML(dependencies.UI.tab);
        window.scrollTo(0, y);
      }
    }
  });
  dependencies.lifecycle.listen(document, "keydown", (e: Event) => {
    const ke = e as KeyboardEvent;
    const target = ke.target as HTMLElement | null;
    if (
      dependencies.UI.onb &&
      target?.dataset &&
      target.dataset["otp"] !== undefined &&
      ke.key === "Backspace" &&
      !(target as HTMLInputElement).value
    ) {
      const pv = document.querySelector<HTMLElement>(
        '[data-otp="' + (Number(target.dataset["otp"]) - 1) + '"]',
      );
      if (pv) pv.focus();
    }
    const modalEl = dependencies.$("#modal") as HTMLElement | null;
    if (ke.key === "Escape" && modalEl && !modalEl.hidden) dependencies.closeModal();
    if (ke.key === "Enter" && target?.classList?.contains("rowlink")) target.click();
  });
  const modalRoot = dependencies.$("#modal");
  if (modalRoot) {
    dependencies.lifecycle.listen(modalRoot, "click", (e: Event) => {
      if ((e.target as HTMLElement | null)?.id === "modal") dependencies.closeModal();
    });
  }
  return {};
}
