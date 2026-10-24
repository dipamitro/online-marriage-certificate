import type { AnyDeps, ApplicationForm, RegistrarRecord } from "../types";

/** screens/application-form. Dependencies: C17OPTS, D, LOC, MARITAL_B, MARITAL_G, REGISTRARS, REG_TYPES, TABS, UI, YN, bn, esc, fee, fld, inr, personHTML, radio, regNameBn, sel, toEn. */
export function createScreensApplicationForm(dependencies: AnyDeps) {
  function tabHTML(t: number): string {
    const f: ApplicationForm = dependencies.D();
    if (t === 0) {
      const L = f.loc,
        divs = Object.keys(dependencies.LOC),
        dists = L.div ? Object.keys(dependencies.LOC[L.div] ?? {}) : [],
        upzs = L.dist ? Object.keys(dependencies.LOC[L.div]?.[L.dist] ?? {}) : [],
        unis = L.upz ? Object.keys(dependencies.LOC[L.div]?.[L.dist]?.[L.upz] ?? {}) : [],
        wards: string[] = L.uni ? (dependencies.LOC[L.div]?.[L.dist]?.[L.upz]?.[L.uni] ?? []) : [];
      const regs = L.ward
        ? (Object.entries(dependencies.REGISTRARS) as Array<[string, RegistrarRecord]>).filter(
            ([, R]) =>
              R.status === "ENLISTED" &&
              R.dist === L.dist &&
              R.upz === L.upz &&
              R.uni === L.uni &&
              R.wards.includes(L.ward),
          )
        : [];
      return `<div class="fsec"><h4>বিবাহ রেজিস্ট্রেশনের ধরণ</h4><div>${dependencies.sel("", "type", dependencies.REG_TYPES, { rr: 1 })}
      <p class="bn" style="font-weight:700;font-size:13px">${dependencies.esc((dependencies.REG_TYPES.find((x: [string, string]) => x[0] === f.type) || ["", ""])[1].replace(/^\S+\s/, ""))}</p>
      ${f.type !== "muslim" ? `<p class="err">This prototype covers option 1 (Muslim marriage, Nikahnama). Hindu and Special Marriage Act registration use a different registrar and form.</p>` : ""}</div></div>
      <div class="fsec"><h4>আবেদনকারী<small>Who is filling this application</small></h4><div>${dependencies.radio(
        "applicantRole",
        [
          ["বর", "বর (Groom)"],
          ["কনে", "কনে (Bride)"],
          ["প্রতিনিধি", "প্রতিনিধি (Representative)"],
        ],
      )}</div></div>
      <div class="fsec"><h4>বিবাহ নিবন্ধন কার্যালয়</h4><div class="g2"><div>
        ${dependencies.sel("বিভাগ", "loc.div", divs, { rr: 1 })}${dependencies.sel("জেলা", "loc.dist", dists, { rr: 1, dis: !L.div })}${dependencies.sel("উপজেলা / সিটি কর্পোরেশন", "loc.upz", upzs, { rr: 1, dis: !L.dist })}${dependencies.sel("ইউনিয়ন / পৌরসভা", "loc.uni", unis, { rr: 1, dis: !L.upz })}${dependencies.sel("ওয়ার্ড", "loc.ward", wards, { rr: 1, dis: !L.uni })}</div>
        <div><div class="fg"><label>বিবাহ রেজিস্ট্রার</label></div>${L.ward ? (regs.length ? `<div class="regcards">${regs.map(([lic, R]) => `<button class="regc ${f.registrar === lic ? "sel" : ""}" data-act="pickreg" data-lic="${lic}"><span class="tick">${f.registrar === lic ? "✓" : ""}</span><b>${dependencies.esc(dependencies.regNameBn(lic))}</b><span>অধিক্ষেত্র: ${dependencies.esc(R.wards.join(", "))}, ${dependencies.esc(R.uni === "সিটি কর্পোরেশন এলাকা" ? R.upz : R.uni)}</span><span>বিবাহ রেজিস্ট্রার কার্যালয়: ${dependencies.esc(R.office)}</span><span>ই মেইল: ${dependencies.esc(R.email)}</span><span>মোবাইল: ${dependencies.bn(R.mobile)}, ${dependencies.bn(R.mobile2)}</span><span>লাইসেন্স: ${lic}</span></button>`).join("")}</div>` : `<p class="feebox">এই ওয়ার্ডে কোনো নিবন্ধিত বিবাহ রেজিস্ট্রার নেই।</p>`) : `<p class="feebox">ওয়ার্ড নির্বাচন করলে এই এলাকার বিবাহ রেজিস্ট্রারদের তালিকা দেখা যাবে।</p>`}</div></div></div>`;
    }
    if (t === 1)
      return dependencies.personHTML("groom", { full: true, marital: dependencies.MARITAL_G });
    if (t === 2)
      return dependencies.personHTML("bride", { full: true, marital: dependencies.MARITAL_B });
    if (t === 3) {
      const u = f.ukil,
        by = u.side === "bride" ? "কন্যা" : "বর";
      return `<p class="q">বিবাহের কোনো রকম উকিল নিযুক্ত করা হয়েছে কি না?</p>${dependencies.radio("ukil.appointed", dependencies.YN, true)}
      ${
        u.appointed === "yes"
          ? `<p class="q">উকিল নিযুক্তের পক্ষ</p>${dependencies.radio(
              "ukil.side",
              [
                ["groom", "বর"],
                ["bride", "কনে"],
              ],
              true,
            )}
      <p class="subh">${by} কর্তৃক উকিল নিযুক্ত ব্যক্তির তথ্য</p>${dependencies.personHTML("ukil.person")}
      <p class="subh">উকিল নিয়োগের সাক্ষী - ০১</p>${dependencies.personHTML("ukil.w1")}<p class="subh">উকিল নিয়োগের সাক্ষী - ০২</p>${dependencies.personHTML("ukil.w2")}`
          : ""
      }`;
    }
    if (t === 4)
      return `<p class="subh">সাক্ষী - ০১</p>${dependencies.personHTML("wit.w1")}<p class="subh">সাক্ষী - ০২</p>${dependencies.personHTML("wit.w2")}`;
    if (t === 5) return dependencies.personHTML("off");
    const m = f.m,
      fv = dependencies.fee(m.mohor),
      mo = Number(dependencies.toEn(m.mohor)) || 0;
    const opt = (k: string, label: string, detail: string, dlabel = "বিস্তারিত") =>
      `<p class="q">${label}</p>${dependencies.radio("m." + k, dependencies.YN, true)}${m[k] === "yes" ? dependencies.fld(dlabel, "m." + detail, { area: true }) : ""}`;
    return `<div class="g2">${dependencies.fld("যে তারিখে বিবাহের কথাবার্তা ঠিক হয়েছিল সেই তারিখ <span class='en'>(ক্রমিক নং - ১২)</span>", "m.settle", { type: "date" })}${dependencies.fld("দেন মোহরের পরিমাণ (টাকা) <span class='en'>(ক্রমিক নং - ১৩)</span>", "m.mohor", { im: "numeric" })}
    ${dependencies.fld("দেন মোহরের কি পরিমাণ আশু এবং কি পরিমাণ বিলম্বিত <span class='en'>(ক্রমিক নং - ১৪)</span>", "m.prompt")}${dependencies.fld("বিবাহের সময় দেন মোহরের কোন অংশ পরিশোধ করা হইয়াছে কিনা? যদি হইয়া থাকে উহার পরিমাণ কত? <span class='en'>(ক্রমিক - ১৫)</span>", "m.paid")}</div>
    ${opt("c16", "বিশেষ বিবরণ ও পক্ষগণের মধ্যে চুক্তিসূত্রে নির্ণীত কোন সম্পত্তি দেন মোহর বা উহার অংশ বিশেষের পরিবর্তে প্রদত্ত হইয়াছে কি না? <small>(ক্রমিক - ১৬)</small>", "c16d")}
    <p class="q">বিশেষ শর্তাদি থাকিলে তাহা <small>(ক্রমিক - ১৭)</small></p>${dependencies.radio("m.c17", dependencies.YN, true)}
    ${m.c17 === "yes" ? `<div class="chk">${dependencies.C17OPTS.map((o: string) => `<label><input type="checkbox" data-chk="${dependencies.esc(o)}" ${m.c17o.includes(o) ? "checked" : ""}> ${o}</label>`).join("")}</div>${dependencies.fld("বিস্তারিত", "m.c17d", { area: true })}` : ""}
    ${opt("c18", "স্বামী স্ত্রীকে তালাক প্রদানের ক্ষমতা অর্পণ করিয়াছে কি না? করিয়া থাকিলে কি কি শর্তে <small>(ক্রমিক নং - ১৮)</small>", "c18d")}
    ${opt("c19", "স্বামীর তালাক প্রদানের অধিকার কোন প্রকারে খর্ব হইয়াছে কি না? <small>(ক্রমিক - ১৯)</small>", "c19d")}
    ${opt("c20", "বিবাহ প্রদানের সময় দেন মোহর খোরপোষ ইত্যাদি সম্পর্কে কোন দলিল করা হইয়াছে কি না? যদি হইয়া থাকে উহার সংক্ষিপ্ত বিবরণ <small>(ক্রমিক নং - ২০)</small>", "c20d", "সংক্ষিপ্ত বিবরণ")}
    <p class="q">বরের কোন স্ত্রী বর্তমানে আছে কি? <small>(ক্রমিক নং - ২১)</small></p>${dependencies.radio("m.c21", dependencies.YN, true)}
    ${m.c21 === "yes" ? `<p class="q">সালিসী কাউন্সিলের অনুমতিপত্রের বিস্তারিত <small>(১৯৬১ সালের মুসলিম পারিবারিক আইন অধ্যাদেশ মোতাবেক সালিসী কাউন্সিলের অনুমোদিত, ক্রমিক নং - ২২)</small></p><div class="g2">${dependencies.fld("অনুমতিপত্রের নম্বর", "m.permNo")}${dependencies.fld("তারিখ", "m.permDate", { type: "date" })}</div>` : ""}
    <div class="g2" style="margin-top:14px">${dependencies.fld("বিবাহ নিবন্ধন তারিখ নির্ধারণ করুন", "m.regDate", { type: "date" })}${dependencies.fld("সময়", "m.regTime", { type: "time" })}
    <div class="fg"><label>বিবাহ নিবন্ধন ফি <span class="en">(auto-calculated)</span></label><input class="inp" id="feeval" readonly value="৳${dependencies.bn(dependencies.inr(fv))}"></div>
    <div class="feebox" id="feenote">${mo <= 400000 ? `দেনমোহরের পরিমাণ ${dependencies.bn(dependencies.inr(mo))} টাকার ১.২৫% হারে = ${dependencies.bn(dependencies.inr(fv))} টাকা` : `দেনমোহরের পরিমাণ ${dependencies.bn(dependencies.inr(mo))} টাকা:<br>• প্রথম ৪,০০,০০০ টাকার ১.২৫% হারে - ৫,০০০ টাকা<br>• অবশিষ্ট ${dependencies.bn(dependencies.inr(mo - 400000))} টাকার প্রতি লাখে ১০০ টাকা করে - ${dependencies.bn(dependencies.inr(fv - 5000))} টাকা`}</div></div>
    <p class="q">বিবাহ নিবন্ধন ফি প্রদানের মাধ্যম</p>${dependencies.radio("m.pay", [
      ["offline", "অফলাইন"],
      ["online", "অনলাইন"],
    ])}
    <div class="g2">${dependencies.fld("যোগাযোগ <span class='en'>(বিবাহ সংক্রান্ত যে কোনো প্রয়োজনে যোগাযোগ করার জন্য একটি নম্বর প্রদান করুন)</span>", "m.contact", { im: "tel" })}</div>`;
  }
  function formPage(): string {
    const errTabs = new Set((dependencies.UI.errors || []).map((e: [number, string]) => e[0]));
    const a = dependencies.UI.draft,
      t: number = dependencies.UI.tab;
    return `<div class="card"><div class="chdr"><div><h3 class="bn" style="font-size:18px">বিবাহ নিবন্ধনের আবেদন</h3><p style="color:var(--tx3);font-size:12px">${a.appNo ? dependencies.esc(a.appNo) + " · " : ""}${a.status === "reverted" ? "Reverted by registrar: correct and submit again" : "Fill in all 7 sections, then submit for bride & groom eSign"}</p></div>
    <div class="demo"><span>Demo:</span><button class="btn bs" data-act="demofill">Fill with demo data</button></div></div>
    ${a.status === "reverted" && a.revertReason ? `<div class="errlist" style="background:var(--abg);color:var(--a);border-color:#93C5FD"><b>Registrar's note:</b> ${dependencies.esc(a.revertReason)}</div>` : ""}
    ${dependencies.UI.errors && dependencies.UI.errors.length ? `<div class="errlist" role="alert"><b>Please fix ${dependencies.UI.errors.length} item${dependencies.UI.errors.length > 1 ? "s" : ""} before submitting:</b><ul>${dependencies.UI.errors.map((e: [number, string]) => `<li><button data-act="gotab" data-t="${e[0]}">${dependencies.TABS[e[0]]}</button>: ${dependencies.esc(e[1])}</li>`).join("")}</ul></div>` : ""}
    <div class="ftabs" role="tablist">${dependencies.TABS.map((n: string, i: number) => `<button role="tab" class="${i === t ? "on" : ""} ${errTabs.has(i) ? "err" : ""}" data-act="gotab" data-t="${i}">${n}</button>`).join("")}</div>
    <div id="tabbody">${tabHTML(t)}</div>
    <div class="ffoot"><div style="display:flex;gap:8px">${t > 0 ? `<button class="btn bs" data-act="gotab" data-t="${t - 1}">Previous</button>` : ""}<button class="btn bs" data-act="savedraft">Save draft</button></div>
      ${t < dependencies.TABS.length - 1 ? `<button class="btn bp" data-act="gotab" data-t="${t + 1}">Save &amp; Continue</button>` : `<button class="btn bp" data-act="submitapp">Submit for bride &amp; groom eSign</button>`}</div></div>`;
  }
  return { tabHTML, formPage };
}
