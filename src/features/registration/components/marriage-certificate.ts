import type { AnyDeps, ApplicationRecord, PersonFormInfo } from "../types";

/** components/marriage-certificate. Dependencies: REGISTRARS, esc, regName, sigDate, toEn, today. */
export function createComponentsMarriageCertificate(dependencies: AnyDeps) {
  const EN_PLACE: Record<string, string> = {
    ঢাকা: "Dhaka",
    গাজীপুর: "Gazipur",
    নরসিংদী: "Narsingdi",
    মানিকগঞ্জ: "Manikganj",
    মাদারীপুর: "Madaripur",
    শরীয়তপুর: "Shariatpur",
    চট্টগ্রাম: "Chattogram",
    সিলেট: "Sylhet",
    "ঢাকা উত্তর সিটি কর্পোরেশন": "Dhaka North City Corporation",
    "ঢাকা দক্ষিণ সিটি কর্পোরেশন": "Dhaka South City Corporation",
    সাভার: "Savar",
    ধামরাই: "Dhamrai",
    কেরানীগঞ্জ: "Keraniganj",
    "গাজীপুর সিটি কর্পোরেশন": "Gazipur City Corporation",
    কালিয়াকৈর: "Kaliakair",
    শ্রীপুর: "Sreepur",
    "নরসিংদী সদর": "Narsingdi Sadar",
    পলাশ: "Palash",
    "মানিকগঞ্জ সদর": "Manikganj Sadar",
    সিংগাইর: "Singair",
    "মাদারীপুর সদর": "Madaripur Sadar",
    শিবচর: "Shibchar",
    "শরীয়তপুর সদর": "Shariatpur Sadar",
    জাজিরা: "Zajira",
    "চট্টগ্রাম সিটি কর্পোরেশন": "Chattogram City Corporation",
    হাটহাজারী: "Hathazari",
    "সিলেট সিটি কর্পোরেশন": "Sylhet City Corporation",
    "শাহজালাল উপশহর": "Shahjalal Uposhohor",
    "সাভার পৌরসভা": "Savar Pourashava",
    "আশুলিয়া ইউনিয়ন": "Ashulia Union",
    "সিটি কর্পোরেশন এলাকা": "",
  };
  const enPlace = (s?: string): string => {
    if (!s) return "";
    if (EN_PLACE[s] !== undefined) return EN_PLACE[s];
    return dependencies
      .toEn(s)
      .replace(/ওয়ার্ড( নং)?\s*-?\s*/, "Ward ")
      .replace(/[^\u0020-\u007F]+/g, "")
      .trim();
  };
  const enDate = (s?: string): string => {
    if (!s) return "";
    const [y, m, d] = s.slice(0, 10).split("-");
    return `${d}/${m}/${y}`;
  };
  function certAddr(p: PersonFormInfo): string {
    const x = p.addr;
    return (
      [x.houseEn, x.roadEn, enPlace(x.upz), enPlace(x.dist)].filter(Boolean).join(", ") +
      ", BANGLADESH"
    );
  }
  function certHTML(a: ApplicationRecord): string {
    const f = a.f,
      c = a.cert;
    const office = [
      enPlace(f.loc.ward),
      enPlace(f.loc.uni),
      enPlace(f.loc.upz),
      enPlace(f.loc.dist),
    ]
      .filter(Boolean)
      .join(", ");
    const sig = c ? c.vds.split("|S:")[1] || "" : "";
    const B = (s: unknown) => `<b>${dependencies.esc(s)}</b>`;
    const signed = a.reg && a.reg.sign;
    return `<article class="mcert"><div class="mc-in">
    <div class="mc-gov">GOVERNMENT OF THE PEOPLE'S REPUBLIC OF BANGLADESH</div>
    <div class="mc-off">OFFICE OF THE GENERAL MARRIAGE REGISTRAR &amp; QUAZI</div>
    <div class="mc-div">Law and Justice Division</div>
    <div class="mc-meta"><span>Date: ${c ? enDate(c.at) : "—"}</span><span>SN: ${c ? dependencies.esc(c.sn) : "—"}</span></div>
    <h2 class="mc-title">MARRIAGE CERTIFICATE</h2>
    <p class="mc-body">This is to certify that Name: ${B((f.groom.nameEn || "").toUpperCase())}, son of ${B((f.groom.fatherEn || "").toUpperCase())} and ${B((f.groom.motherEn || "").toUpperCase())}, ${dependencies.esc(certAddr(f.groom))}, Date of Birth: ${enDate(f.groom.dob)} has been married to Name: ${B((f.bride.nameEn || "").toUpperCase())}, daughter of ${B((f.bride.fatherEn || "").toUpperCase())} and ${B((f.bride.motherEn || "").toUpperCase())}, ${dependencies.esc(certAddr(f.bride))}, Date of Birth: ${enDate(f.bride.dob)}. The marriage was solemnized on ${B(enDate(f.m.regDate))} and registered in the Kazi office at ${dependencies.esc(office)} being Registration No: ${B(a.issued ? a.issued.regNo : "—")} in the year ${B((a.issued ? a.issued.at : f.m.regDate || dependencies.today()).slice(0, 4))}.</p>
    <div class="mc-foot">
      <div class="mc-qr">${c ? `<div class="qr" data-qr="${dependencies.esc(c.vds)}"></div><div class="mc-pki">PKI Ref: ${dependencies.esc(sig.slice(0, 20))}</div>` : `<div class="qrph">VDS</div>`}</div>
      ${signed ? `<button class="mc-sig" data-act="sigdetail" data-id="${a.id}" data-k="reg"><div class="scr">${dependencies.esc(dependencies.regName(f.registrar))}</div><div class="mc-sd">Signed By: ${dependencies.esc(dependencies.regName(f.registrar))}<br>Organization: Law &amp; Justice Division<br>Country Code: BD<br>Date: ${dependencies.sigDate(signed.at)}</div><div class="mc-role">Marriage Register &amp; Kazi<br>ID: ${dependencies.esc(f.registrar)}</div></button>` : `<div class="mc-sig"><div class="mc-sd">Awaiting registrar eSign</div></div>`}
    </div></div></article>`;
  }
  return { EN_PLACE, enPlace, enDate, certAddr, certHTML };
}
