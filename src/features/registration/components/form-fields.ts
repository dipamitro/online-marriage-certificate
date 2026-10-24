import type { AnyDeps } from "../types";

interface FieldOptions {
  cls?: string;
  en?: string;
  area?: boolean;
  ro?: boolean | number;
  type?: string;
  ph?: string;
  im?: string;
}

interface SelectOptions {
  cls?: string;
  rr?: boolean | number;
  dis?: boolean;
}

/** components/form-fields. Dependencies: DIST, UI, esc, getP. */
export function createComponentsFormFields(dependencies: AnyDeps) {
  const D = () => dependencies.UI.draft.f;
  function fld(label: string, path: string, o: FieldOptions = {}): string {
    const v = dependencies.getP(D(), path) ?? "";
    return `<div class="fg ${o.cls || ""}"><label>${label}${o.en ? ` <span class="en">${o.en}</span>` : ""}</label>${o.area ? `<textarea class="inp" data-b="${path}" ${o.ro ? "readonly" : ""}>${dependencies.esc(v)}</textarea>` : `<input class="inp" data-b="${path}" type="${o.type || "text"}" value="${dependencies.esc(v)}" ${o.ph ? `placeholder="${dependencies.esc(o.ph)}"` : ""} ${o.ro ? "readonly" : ""} ${o.im ? `inputmode="${o.im}"` : ""}>`}</div>`;
  }
  function sel(
    label: string,
    path: string,
    opts: Array<string | [string, string]>,
    o: SelectOptions = {},
  ): string {
    const v = dependencies.getP(D(), path) ?? "";
    return `<div class="fg ${o.cls || ""}"><label>${label}</label><select class="inp" data-b="${path}" ${o.rr ? 'data-rr="1"' : ""} ${o.dis ? "disabled" : ""}><option value="">----নির্বাচন করুন----</option>${opts
      .map((x) => {
        const [val, lab] = Array.isArray(x) ? x : [x, x];
        return `<option value="${dependencies.esc(val)}" ${v === val ? "selected" : ""}>${dependencies.esc(lab)}</option>`;
      })
      .join("")}</select></div>`;
  }
  function radio(path: string, opts: Array<[string, string]>, rr?: boolean): string {
    const v = dependencies.getP(D(), path);
    return `<div class="rad">${opts.map(([val, lab]) => `<label><input type="radio" name="${path}" value="${val}" data-b="${path}" ${rr ? 'data-rr="1"' : ""} ${v === val ? "checked" : ""}> ${lab}</label>`).join("")}</div>`;
  }
  const YN: Array<[string, string]> = [
    ["yes", "হ্যাঁ"],
    ["no", "না"],
  ];
  function personHTML(
    base: string,
    cfg: { full?: boolean; marital?: Array<string | [string, string]> } = {},
  ): string {
    const p = dependencies.getP(D(), base);
    const dists = Object.keys(dependencies.DIST),
      upzs = p.addr.dist ? dependencies.DIST[p.addr.dist] || [] : [];
    let s = `<div class="fsec"><h4>ব্যক্তিগত তথ্য<small>(জাতীয় পরিচয়পত্র / জন্ম সনদ অনুযায়ী)</small></h4><div>
    <div class="g2">${fld("পুরো নাম (বাংলায়)", base + ".nameBn")}${fld("পুরো নাম (ইংরেজিতে)", base + ".nameEn")}
    ${fld("পিতার নাম (বাংলায়)", base + ".fatherBn")}${fld("পিতার নাম (ইংরেজিতে)", base + ".fatherEn")}
    ${fld("মাতার নাম (বাংলায়)", base + ".motherBn")}${fld("মাতার নাম (ইংরেজিতে)", base + ".motherEn")}
    ${cfg.full ? fld("জন্ম তারিখ", base + ".dob", { type: "date" }) + fld("ব্যক্তিগত নাম্বার <span class='en'>(জাতীয় পরিচয়পত্র (NID) / জন্ম সনদ নম্বর (BRC))</span>", base + ".nid", { im: "numeric" }) + sel("বৈবাহিক অবস্থা", base + ".marital", cfg.marital ?? []) : ""}</div></div></div>
    <div class="fsec"><h4>ঠিকানা</h4><div class="g2">
    ${fld("শহর / গ্রাম / বাসা", base + ".addr.houseBn")}${fld("Village / House No", base + ".addr.houseEn")}
    ${fld("রাস্তা / মহল্লা / সেক্টর", base + ".addr.roadBn")}${fld("Sector / Road / Area", base + ".addr.roadEn")}
    ${sel("জেলা", base + ".addr.dist", dists, { rr: 1 })}${sel("উপজেলা / সিটি কর্পোরেশন", base + ".addr.upz", upzs, { dis: !p.addr.dist })}
    ${fld("ডাকঘর", base + ".addr.po")}${fld("পৌরসভা / ইউনিয়ন", base + ".addr.uni")}${fld("ওয়ার্ড", base + ".addr.ward")}</div></div>`;
    if (cfg.full)
      s += `<div class="fsec"><h4>যোগাযোগের তথ্য${base === "groom" ? "<small class='who-line'>(বরের তথ্য)</small>" : base === "bride" ? "<small class='who-line'>(কনের তথ্য)</small>" : ""}</h4><div class="g2">${fld("মোবাইল", base + ".mobile", { im: "tel", ph: "01XXXXXXXXX" })}${fld("ইমেইল", base + ".email", { type: "email" })}</div></div>`;
    return s;
  }
  return { D, fld, sel, radio, YN, personHTML };
}
