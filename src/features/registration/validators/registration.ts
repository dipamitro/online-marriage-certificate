import type { AnyDeps, ApplicationForm, ApplicationRecord } from "../types";

/** validators/registration. Dependencies: activeMarriage, ageAt, fee, inr, mailOk, mobOk, nidOk, toEn, today. */
export function createValidatorsRegistration(dependencies: AnyDeps) {
  function validate(f: ApplicationForm): Array<[number, string]> {
    const e: Array<[number, string]> = [],
      req = (tab: number, ok: unknown, msg: string) => {
        if (!ok) e.push([tab, msg]);
      };
    req(
      0,
      f.type === "muslim",
      "This prototype registers Muslim marriages (Nikahnama). Choose option 1.",
    );
    req(0, f.loc.ward, "Select the marriage registration office down to the ward.");
    req(0, f.registrar, "Select a marriage registrar.");
    req(
      0,
      f.applicantRole,
      "Select who is filling this application: বর (Groom), কনে (Bride) or প্রতিনিধি (Representative).",
    );
    (
      [
        ["groom", 1, "বর"],
        ["bride", 2, "কনে"],
      ] as const
    ).forEach(([k, t, l]) => {
      const p = f[k];
      req(t, p.nameBn && p.nameEn, `${l}: full name in Bangla and English is required.`);
      req(t, p.fatherBn && p.motherBn, `${l}: father's and mother's names are required.`);
      req(t, p.dob, `${l}: date of birth is required.`);
      req(
        t,
        dependencies.nidOk(p.nid),
        `${l}: enter a valid NID or birth registration number (10, 13 or 17 digits).`,
      );
      req(t, p.marital, `${l}: select marital status.`);
      req(
        t,
        p.addr.houseBn && p.addr.dist && p.addr.upz,
        `${l}: address (house/village, district, upazila) is required.`,
      );
      req(
        t,
        dependencies.mobOk(p.mobile),
        `${l}: enter an 11-digit mobile number starting with 01.`,
      );
      req(
        t,
        dependencies.mailOk(p.email),
        `${l}: enter an email address (used to send the eSign request and the Nikahnama).`,
      );
    });
    const at = f.m.regDate || dependencies.today();
    const ga = dependencies.ageAt(f.groom.dob, at),
      ba = dependencies.ageAt(f.bride.dob, at);
    if (ga !== null && ga < 21)
      e.push([1, `বর: age ${ga} on the registration date. The legal minimum for a groom is 21.`]);
    if (ba !== null && ba < 18)
      e.push([2, `কনে: age ${ba} on the registration date. The legal minimum for a bride is 18.`]);
    if (
      f.groom.nid &&
      dependencies.toEn(f.groom.nid).trim() === dependencies.toEn(f.bride.nid).trim()
    )
      e.push([2, "The bride's NID is the same as the groom's. Each person needs their own NID."]);
    if (f.groom.email && f.groom.email.trim().toLowerCase() === f.bride.email.trim().toLowerCase())
      e.push([
        2,
        "The bride and groom need different email addresses so each receives their own eSign request.",
      ]);
    if (f.ukil.appointed === "yes") {
      const u = f.ukil.person;
      req(3, u.nameBn && u.fatherBn, "উকিল: name and father's name are required.");
      if (u.nameBn && [f.groom.nameBn, f.bride.nameBn].includes(u.nameBn.trim()))
        e.push([3, "The ukil can't be the bride or groom."]);
      req(
        3,
        f.ukil.w1.nameBn && f.ukil.w2.nameBn,
        "Enter both witnesses to the ukil's appointment.",
      );
    }
    req(
      4,
      f.wit.w1.nameBn && f.wit.w1.fatherBn && f.wit.w2.nameBn && f.wit.w2.fatherBn,
      "Enter both marriage witnesses (name and father's name).",
    );
    const wn = [f.wit.w1.nameBn, f.wit.w2.nameBn].map((s) => (s || "").trim());
    if (wn[0] && wn[0] === wn[1]) e.push([4, "The two witnesses must be different people."]);
    if (wn.some((n) => n && [f.groom.nameBn, f.bride.nameBn].includes(n)))
      e.push([4, "A witness can't be the bride or groom."]);
    req(
      5,
      f.off.nameBn && f.off.fatherBn,
      "Enter the name and father's name of the person who conducts the marriage.",
    );
    req(6, f.m.settle, "Clause 12: enter the date the marriage was settled.");
    req(6, Number(dependencies.toEn(f.m.mohor)) > 0, "Clause 13: enter the dower (mohor) amount.");
    req(
      6,
      f.m.prompt.trim(),
      "Clause 14: state how much of the dower is prompt and how much deferred.",
    );
    if (f.m.c21 === "yes") {
      if (f.groom.marital === "অবিবাহিত")
        e.push([
          6,
          "Clause 21 says the groom has an existing wife, but his marital status is অবিবাহিত (unmarried).",
        ]);
      req(
        6,
        f.m.permNo.trim() && f.m.permDate,
        "Clause 22: an existing wife requires the Arbitration Council permission number and date.",
      );
    }
    req(
      6,
      f.m.regDate && f.m.regDate >= dependencies.today(),
      "Choose a registration date from today onwards.",
    );
    req(6, dependencies.mobOk(f.m.contact), "Enter a contact mobile number for this marriage.");
    return e;
  }
  function appraisalChecks(a: ApplicationRecord): Array<[string, string]> {
    const f = a.f,
      out: Array<[string, string]> = [],
      at = f.m.regDate || dependencies.today();
    const ga = dependencies.ageAt(f.groom.dob, at),
      ba = dependencies.ageAt(f.bride.dob, at);
    out.push([ga >= 21 ? "ok" : "err", `Groom's age ${ga} (minimum 21)`]);
    out.push([ba >= 18 ? "ok" : "err", `Bride's age ${ba} (minimum 18)`]);
    (["groom", "bride"] as const).forEach((k) => {
      const e = a.esign[k].ekyc;
      const l = k === "groom" ? "Groom" : "Bride";
      if (!e) out.push(["warn", `${l} has not signed yet`]);
      else
        out.push([
          e.nameMatch ? "ok" : "warn",
          e.nameMatch
            ? `${l}: identity verified by OneID eKYC at sign-up; name matches`
            : `${l}: verified by OneID, but the name on OneID ("${e.oneName}") differs from the application`,
        ]);
    });
    const gm = dependencies.activeMarriage(f.groom.nid, a.id),
      bm = dependencies.activeMarriage(f.bride.nid, a.id);
    if (bm) out.push(["err", `Bride already has a registered marriage (${bm.issued.regNo})`]);
    if (gm)
      out.push([
        f.m.c21 === "yes" && f.m.permNo ? "warn" : "err",
        `Groom already has a registered marriage (${gm.issued.regNo})${f.m.c21 === "yes" && f.m.permNo ? "; Arbitration Council permission " + f.m.permNo + " provided" : " and no Arbitration Council permission"}`,
      ]);
    if (!gm && !bm)
      out.push(["ok", "No previous registered marriage found in the central repository"]);
    out.push([
      "ok",
      `Registration fee ${dependencies.inr(dependencies.fee(f.m.mohor))} Tk, payment ${f.m.pay === "online" ? (a.paid ? "received online" : "online, pending") : "offline, collect at office"}`,
    ]);
    return out;
  }
  return { validate, appraisalChecks };
}
