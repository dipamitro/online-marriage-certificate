/* eslint-disable prettier/prettier */
import type { EnlApplication, EnlState, EnlUIState, EnlUser, JurNode } from "../types";
import type { OMRBridgeContract } from "../../registration/types";
import { DOCS, PEOPLE } from "../constants/people";
import { addDays, now, today, fD } from "../services/applications";
import { kidsOf, pathOf, placeOf, roots } from "../services/jurisdiction";
import { nextLicence } from "../services/storage";
import { sealFor } from "../services/seal";
import { takenWards, validateEnlistment } from "../validators/enlistment";

export interface ActionDeps {
  $: (s: string) => HTMLElement | null;
  jur: Record<string, JurNode>;
  state: EnlState;
  ui: EnlUIState;
  getVis: () => boolean;
  setVis: (v: boolean) => void;
  save: () => void;
  render: () => void;
  toast: (m: string) => void;
  modal: (
    html: string,
    ok: (() => string | Promise<string | undefined> | undefined) | null,
    wide?: boolean | string,
  ) => void;
  closeModal: () => void;
  myApp: () => EnlApplication | null;
  saveDraft: () => EnlApplication | null;
  reasonModal: (
    title: string,
    text: string,
    btn: string,
    danger: boolean,
    onOk: (reason: string) => void,
  ) => void;
  B: () => OMRBridgeContract | undefined;

  signupModal: () => void;
  otpModal: (title: string, text: string, onOk: () => Promise<void>) => void;
  certHTML: (a: EnlApplication) => string;
  appById: (id: string | null | undefined) => EnlApplication | undefined;
  userBy: (id: string | null | undefined) => EnlUser | null;
  currentUser: (r: string) => EnlUser | null;
  log: (by: string, text: string, appId?: string | null) => void;
  mail: (to: string, toName: string, subject: string, body: string[]) => void;
  hist: (a: EnlApplication, by: string, text: string) => void;
  seed: () => void;
  resetUI: () => void;
}

export function createEventsActions(deps: ActionDeps) {
  const {
    $,
    jur,
    state,
    ui,
    getVis,
    setVis,
    save,
    render,
    toast,
    modal,
    closeModal,
    reasonModal,
    signupModal,
    myApp,
    saveDraft,
    B,
    otpModal,
    certHTML,
    appById,
    userBy,
    currentUser,
    log,
    mail,
    hist,
    seed,
    resetUI,
  } = deps;

  /* ---------- events ---------- */
  const onInput = (e: Event): void => {
    const target = e.target;
    if (!getVis() || !(target instanceof HTMLElement) || !target.closest("#eroot, #emodal")) return;
    const t = target as HTMLInputElement,
      d = t.dataset;
    if (ui.onb && d["ob"]) {
      ui.onb[d["ob"]] = t.value;
      ui.onb["err"] = "";
      return;
    }
    if (ui.onb && d["otp"] !== undefined) {
      const boxes = [...document.querySelectorAll<HTMLInputElement>("[data-otp]")],
        i = Number(d["otp"]),
        dg = t.value.replace(/\D/g, "");
      if (dg.length > 1) {
        dg.split("")
          .slice(0, 6 - i)
          .forEach((ch, k) => {
            const box = boxes[i + k];
            if (box) box.value = ch;
          });
      } else t.value = dg;
      ui.onb["otp"] = boxes.map((x) => x.value).join("");
      const nx = boxes[Math.min(i + Math.max(dg.length, 1), 5)];
      if (dg && nx) nx.focus();
      const vb = $("#ob-verify") as HTMLButtonElement | null;
      if (vb) vb.disabled = String(ui.onb["otp"] || "").length !== 6;
      return;
    }
    if (d["b"] && ui.draft) {
      const ks = d["b"].split(".");
      let o: Record<string, unknown> = ui.draft as unknown as Record<string, unknown>;
      ks.slice(0, -1).forEach((k) => {
        o = o[k] as Record<string, unknown>;
      });
      const lastKey = ks[ks.length - 1];
      if (lastKey) o[lastKey] = t.value;
    }
    if (d["dirq"]) {
      ui.dirQ = t.value;
      const pos = t.selectionStart ?? 0;
      render();
      const el = document.querySelector<HTMLInputElement>("[data-dirq]");
      if (el) {
        el.focus();
        el.setSelectionRange(pos, pos);
      }
    }
  };

  const onChange = (e: Event): void => {
    const target = e.target;
    if (!getVis() || !(target instanceof HTMLElement) || !target.closest("#eroot, #emodal")) return;
    const t = target as HTMLInputElement & HTMLSelectElement,
      d = t.dataset;
    if (ui.onb && d["obchk"]) {
      ui.onb[d["obchk"]] = t.checked;
      ui.onb["err"] = "";
      return;
    }
    if (ui.onb && d["ob"]) {
      ui.onb[d["ob"]] = t.value;
      return;
    }
    if (d["login"]) {
      ui.login[d["login"]] = t.value;
      return;
    }
    if (d["j"] && ui.draft) {
      const order: Array<"div" | "dist" | "upz" | "uni"> = ["div", "dist", "upz", "uni"],
        jKey = d["j"] as "div" | "dist" | "upz" | "uni",
        i = order.indexOf(jKey);
      ui.draft.j[jKey] = t.value;
      order.slice(i + 1).forEach((k) => (ui.draft!.j[k] = ""));
      ui.draft.j.wards = [];
      render();
      return;
    }
    if (d["ward"] && ui.draft) {
      const w = ui.draft.j.wards,
        i = w.indexOf(d["ward"]);
      if (t.checked && i < 0) w.push(d["ward"]);
      if (!t.checked && i >= 0) w.splice(i, 1);
      return;
    }
    if (d["decl"] && ui.draft) {
      ui.draft.declare = t.checked;
      return;
    }
    if (d["b"] && ui.draft && t.tagName === "SELECT") {
      const ks = d["b"].split(".");
      let o: Record<string, unknown> = ui.draft as unknown as Record<string, unknown>;
      ks.slice(0, -1).forEach((k) => {
        o = o[k] as Record<string, unknown>;
      });
      const lastKey = ks[ks.length - 1];
      if (lastKey) o[lastKey] = t.value;
      return;
    }
    if (d["dirst"]) {
      ui.dirSt = t.value;
      render();
    }
  };

  const onKeyDown = (e: KeyboardEvent): void => {
    if (!getVis()) return;
    const target = e.target as HTMLInputElement | null;
    if (
      ui.onb &&
      target?.dataset &&
      target.dataset["otp"] !== undefined &&
      e.key === "Backspace" &&
      !target.value
    ) {
      const pv = document.querySelector<HTMLElement>(
        '[data-otp="' + (Number(target.dataset["otp"]) - 1) + '"]',
      );
      if (pv) pv.focus();
    }
    const emodal = $("#emodal");
    if (e.key === "Escape" && emodal && !emodal.hidden) closeModal();
    if (e.key === "Enter" && target?.classList?.contains("click")) target.click();
  };

  const onClick = async (e: MouseEvent): Promise<void> => {
    const target = e.target;
    if (target instanceof HTMLElement && target.id === "emodal") {
      closeModal();
      return;
    }
    if (!getVis() || !(target instanceof HTMLElement) || !target.closest("#eroot, #emodal")) return;
    const b = target.closest<HTMLButtonElement>("[data-act]");
    if (!b) return;
    const act = b.dataset["act"],
      id = b.dataset["id"] ?? null,
      r = ui.role;
    const top = () => window.scrollTo(0, 0);
    switch (act) {
      case "role":
        ui.role = b.dataset["r"] ?? "applicant";
        ui.open = null;
        ui.sb = false;
        render();
        top();
        break;
      case "login": {
        const loginRole = b.dataset["r"] ?? "applicant";
        ui.auth[loginRole] = loginRole === "applicant" ? (ui.login["applicant"] ?? null) : true;
        ui.page[loginRole] = "dash";
        ui.open = null;
        render();
        top();
        break;
      }
      case "logout": {
        ui.auth[r] = null;
        ui.open = null;
        ui.draft = null;
        const bridge = B();
        if (bridge) bridge.home(r);
        break;
      }
      case "opendesk": {
        const bridge = B();
        if (bridge && typeof ui.auth["applicant"] === "string") {
          bridge.openDesk(ui.auth["applicant"]);
        }
        break;
      }
      case "signup":
        signupModal();
        break;
      case "sufill": {
        const n = b.dataset["n"] ?? "",
          P = PEOPLE[n];
        if (!P) break;
        const suNid = $("#su-nid") as HTMLInputElement | null;
        const suDob = $("#su-dob") as HTMLInputElement | null;
        const suMob = $("#su-mob") as HTMLInputElement | null;
        const suMail = $("#su-mail") as HTMLInputElement | null;
        if (suNid) suNid.value = n;
        if (suDob) suDob.value = P.dob;
        if (suMob) suMob.value = "0171" + n.slice(-7);
        if (suMail)
          suMail.value =
            P.en
              .toLowerCase()
              .replace(/[^a-z]+/g, ".")
              .replace(/^\.|\.$/g, "") + "@mail.com";
        break;
      }
      case "sb":
        ui.sb = !ui.sb;
        render();
        break;
      case "page":
        ui.page[r] = b.dataset["p"] ?? "dash";
        ui.open = null;
        ui.sb = false;
        ui.errs = null;
        if (b.dataset["p"] !== "apply") ui.draft = null;
        render();
        top();
        break;
      case "newapp":
        ui.page["applicant"] = "apply";
        ui.draft = null;
        render();
        top();
        break;
      case "viewmine":
        ui.open = myApp()?.id ?? null;
        render();
        top();
        break;
      case "openapp":
        ui.open = id;
        render();
        top();
        break;
      case "back":
        ui.open = null;
        render();
        top();
        break;
      case "print":
        window.print();
        break;
      case "demofill": {
        const d = ui.draft;
        if (!d) break;
        const div = roots(jur)[0],
          dist = div ? kidsOf(jur, div.id, 1)[0] : undefined,
          upz = dist ? kidsOf(jur, dist.id, 2).find((n) => n.name === "কেরানীগঞ্জ") : undefined,
          uni = upz ? kidsOf(jur, upz.id, 3)[0] : undefined;
        if (!div || !dist || !upz || !uni) break;
        const t = takenWards(state.apps, d.id);
        d.c.address = d.c.address || "বাড়ি ৮, রোড ২, শুভাড্যা, কেরানীগঞ্জ, ঢাকা";
        d.q = {
          degree: "Kamil",
          institution: "Dhaka Alia Madrasah",
          year: "2010",
          result: "First class",
        };
        d.j = {
          div: div.id,
          dist: dist.id,
          upz: upz.id,
          uni: uni.id,
          wards: kidsOf(jur, uni.id, 4)
            .filter((w) => !t[w.id])
            .slice(0, 3)
            .map((w) => w.id),
        };
        d.o = {
          name: "শুভাড্যা কাজী অফিস",
          address: "বাজার রোড, শুভাড্যা, কেরানীগঞ্জ, ঢাকা",
          phone: d.c.mobile,
        };
        d.docs = Object.fromEntries(DOCS.map((x) => [x[0], x[0] + ".pdf"]));
        d.declare = true;
        ui.errs = null;
        render();
        break;
      }
      case "updoc":
        if (ui.draft && b.dataset["k"]) {
          ui.draft.docs[b.dataset["k"]] =
            b.dataset["k"] + "_" + Date.now().toString().slice(-4) + ".pdf";
          render();
        }
        break;
      case "rmdoc":
        if (ui.draft && b.dataset["k"]) {
          ui.draft.docs[b.dataset["k"]] = "";
          render();
        }
        break;
      case "savedraft":
        saveDraft();
        toast("Draft saved");
        render();
        break;
      case "submit": {
        if (!ui.draft) break;
        const errs = validateEnlistment(ui.draft, state.apps, state.settings);
        ui.errs = errs;
        if (errs.length) {
          render();
          top();
          break;
        }
        const wasReturned = ui.draft.status === "RETURNED";
        ui.draft.status = "SUBMITTED";
        ui.draft.submittedAt = now();
        ui.draft.returnNote = "";
        const a = saveDraft();
        if (!a) break;
        hist(a, a.p.nameEn, wasReturned ? "Corrected and resubmitted" : "Application submitted");
        log(a.p.nameEn, `${wasReturned ? "Resubmitted" : "Submitted"} ${a.appNo}`, a.id);
        mail(a.c.email, a.p.nameEn, `Application ${a.appNo} received`, [
          `Dear ${a.p.nameEn},`,
          `We have received your application to be enlisted as a marriage registrar for ${placeOf(jur, a.j.wards)}.`,
          "An Admin or the Super Admin will review it and approve it with eSign. We'll email you when there is a decision.",
        ]);
        save();
        ui.draft = null;
        ui.errs = null;
        ui.page["applicant"] = "dash";
        render();
        top();
        toast("Application submitted");
        break;
      }
      case "forward-unused": {
        const a = appById(id),
          me = currentUser(r);
        if (!a || !me) break;
        a.status = "FORWARDED";
        hist(a, me.name, "Verified by admin and forwarded to Super Admin");
        log(me.name, `Verified and forwarded ${a.appNo}`, a.id);
        save();
        render();
        top();
        toast("Forwarded to Super Admin");
        break;
      }
      case "return": {
        const a = appById(id),
          me = currentUser(r);
        if (!a || !me) break;
        reasonModal(
          "Return to applicant",
          "Explain what the applicant must correct. They will fix it and resubmit.",
          "Return",
          false,
          (t: string) => {
            a.status = "RETURNED";
            a.returnNote = t;
            hist(a, me.name, "Returned: " + t);
            log(me.name, `Returned ${a.appNo}: ${t}`, a.id);
            mail(a.c.email, a.p.nameEn, `Application ${a.appNo} needs correction`, [
              `Dear ${a.p.nameEn},`,
              "Your marriage registrar application was returned with this note:",
              t,
              "Please sign in, correct it and resubmit.",
            ]);
            save();
            render();
            toast("Returned to applicant");
          },
        );
        break;
      }
      case "reject": {
        const a = appById(id),
          me = currentUser(r);
        if (!a || !me) break;
        reasonModal(
          "Reject application",
          "The applicant will be told the reason. This can't be undone.",
          "Reject",
          true,
          (t: string) => {
            a.status = "REJECTED";
            a.rejectNote = t;
            hist(a, me.name, "Rejected: " + t);
            log(me.name, `Rejected ${a.appNo}: ${t}`, a.id);
            mail(a.c.email, a.p.nameEn, `Application ${a.appNo} rejected`, [
              `Dear ${a.p.nameEn},`,
              "Your marriage registrar application was rejected for this reason:",
              t,
            ]);
            save();
            render();
            toast("Application rejected");
          },
        );
        break;
      }
      case "approve": {
        const a = appById(id),
          me = currentUser(r);
        if (!a || !me) break;
        otpModal(
          "Approve with eSign",
          `Approving designates ${a.p.nameEn} as marriage registrar for ${placeOf(jur, a.j.wards)}, issues the licence and sends it to their OneID Wallet.`,
          async () => {
            a.status = "ENLISTED";
            a.licenceNo = nextLicence(state, jur, a.j.div);
            a.approvedAt = now();
            a.approvedBy = me.name;
            a.approverTitle = r === "super" ? "Super Admin" : "Admin";
            a.validTo = addDays(365 * 5).slice(0, 10);
            a.seal = await sealFor(a, jur);
            hist(
              a,
              me.name,
              `Approved with eSign (${a.approverTitle}); licence ${a.licenceNo} issued and sent to OneID Wallet`,
            );
            log(me.name, `Approved ${a.appNo} with eSign; licence ${a.licenceNo}`, a.id);
            mail(
              a.c.email,
              a.p.nameEn,
              `You are enlisted as a marriage registrar (${a.licenceNo})`,
              [
                `Dear ${a.p.nameEn},`,
                `Your enlistment has been approved with eSign by ${me.name} (${a.approverTitle}). Licence ${a.licenceNo}, valid until ${fD(a.validTo)}.`,
                `You are designated for ${placeOf(jur, a.j.wards)}. Your sealed licence is in your OneID Wallet, and you can now sign in to the Marriage Registrar Portal.`,
              ],
            );
            save();
            render();
            top();
            toast("Approved & licence issued");
            const bridge = B();
            if (bridge) bridge.refresh();
          },
        );
        break;
      }
      case "suspend": {
        const a = appById(id),
          me = currentUser(r);
        if (!a || !me) break;
        reasonModal(
          "Suspend registrar",
          "The registrar can't approve marriages while suspended. Their open marriage applications are reassigned.",
          "Suspend",
          true,
          (t: string) => {
            a.status = "SUSPENDED";
            hist(a, me.name, "Suspended: " + t);
            log(me.name, `Suspended ${a.licenceNo}: ${t}`, a.id);
            mail(a.c.email, a.p.nameEn, `Licence ${a.licenceNo} suspended`, [
              `Dear ${a.p.nameEn},`,
              "Your marriage registrar licence has been suspended:",
              t,
            ]);
            save();
            render();
            toast("Registrar suspended");
            const bridge = B();
            if (bridge) bridge.refresh();
          },
        );
        break;
      }
      case "reinstate": {
        const a = appById(id),
          me = currentUser(r);
        if (!a || !me) break;
        a.status = "ENLISTED";
        hist(a, me.name, "Reinstated");
        log(me.name, `Reinstated ${a.licenceNo}`, a.id);
        save();
        render();
        toast("Registrar reinstated");
        const bridge = B();
        if (bridge) bridge.refresh();
        break;
      }
      case "cancel": {
        const a = appById(id),
          me = currentUser(r);
        if (!a || !me) break;
        reasonModal(
          "Cancel licence",
          "The licence and its seal are revoked and the wards become free. This can't be undone.",
          "Cancel licence",
          true,
          (t: string) => {
            a.status = "CANCELLED";
            hist(a, me.name, "Licence cancelled: " + t);
            log(me.name, `Cancelled ${a.licenceNo}: ${t}`, a.id);
            save();
            render();
            toast("Licence cancelled");
            const bridge = B();
            if (bridge) bridge.refresh();
          },
        );
        break;
      }
      case "dirsel":
        if (target.closest("[data-act=dirtog]")) break;
        ui.dirNode = id || null;
        if (id) ui.dirOpen[id] = true;
        render();
        break;
      case "dirtog":
        if (id) ui.dirOpen[id] = !ui.dirOpen[id];
        render();
        break;
      case "addward": {
        const uniEl = $("#jw-uni") as HTMLSelectElement | null,
          nmEl = $("#jw-name") as HTMLInputElement | null;
        const uni = uniEl?.value ?? "",
          nm = nmEl?.value.trim() ?? "";
        if (!nm || !uni || !jur[uni]) {
          toast("Enter a ward name");
          break;
        }
        const nid = "j" + (Object.keys(jur).length + 1) + "x";
        jur[nid] = { id: nid, name: nm, level: 4, parent: uni, kids: [] };
        jur[uni]!.kids.push(nid);
        state.extraWards = state.extraWards || [];
        state.extraWards.push({ id: nid, name: nm, parent: uni });
        log(currentUser(r)?.name ?? "Admin", `Added ward "${nm}" under ${jur[uni]!.name}`);
        save();
        render();
        toast("Ward added");
        break;
      }
      case "adduser": {
        const nm = ($("#nu-name") as HTMLInputElement | null)?.value.trim() ?? "",
          em = ($("#nu-mail") as HTMLInputElement | null)?.value.trim() ?? "",
          ds = ($("#nu-des") as HTMLInputElement | null)?.value.trim() ?? "";
        if (!nm || !/^\state+@\state+\.\state+$/.test(em)) {
          toast("Enter a name and a valid email");
          break;
        }
        state.users.push({
          id: "u" + Date.now(),
          role: "admin",
          nid: "",
          name: nm,
          email: em,
          designation: ds || "Admin",
          mobile: "",
          active: true,
        });
        log(currentUser(r)?.name ?? "Super Admin", `Added admin ${nm}`);
        save();
        render();
        toast("Admin added");
        break;
      }
      case "toggleuser": {
        const u = userBy(id);
        if (!u) break;
        u.active = !u.active;
        log(
          currentUser(r)?.name ?? "Super Admin",
          `${u.active ? "Enabled" : "Disabled"} admin ${u.name}`,
        );
        save();
        render();
        break;
      }
      case "savesettings": {
        const mn = +(($("#set-min") as HTMLInputElement | null)?.value ?? 0),
          mx = +(($("#set-max") as HTMLInputElement | null)?.value ?? 0);
        if (!(mn > 0 && mx > mn)) {
          toast("Maximum age must be above minimum age");
          break;
        }
        state.settings.minAge = mn;
        state.settings.maxAge = mx;
        state.settings.multiPerWard =
          (($("#set-multi") as HTMLSelectElement | null)?.value ?? "0") === "1";
        state.settings.reqDocs = [...document.querySelectorAll<HTMLInputElement>("[data-reqdoc]")]
          .filter((x) => x.checked)
          .map((x) => x.dataset["reqdoc"] ?? "")
          .filter(Boolean);
        log(currentUser(r)?.name ?? "Admin", `Updated eligibility settings (age ${mn}–${mx})`);
        save();
        render();
        toast("Settings saved");
        break;
      }
      case "mail": {
        const m = (state.emails || []).find((x) => x.id === id);
        if (m) m.read = true;
        ui.inboxSel = id;
        save();
        render();
        break;
      }
      case "mclose":
        closeModal();
        break;
      case "mok": {
        const okBtn = $("#emodal [data-act='mok']");
        // Handled directly inside modal definition
        closeModal();
        break;
      }
      case "reset":
        seed();
        resetUI();
        toast("Demo reset");
        break;
    }
  };

  return {
    onInput,
    onChange,
    onKeyDown,
    onClick,
    attach() {
      document.addEventListener("input", onInput);
      document.addEventListener("change", onChange);
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("click", onClick);

      return () => {
        document.removeEventListener("input", onInput);
        document.removeEventListener("change", onChange);
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("click", onClick);
      };
    },
  };
}
