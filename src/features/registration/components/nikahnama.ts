import type {
  AddressInfo,
  AnyDeps,
  ApplicationRecord,
  PartySignature,
  PersonFormInfo,
} from "../types";

/** components/nikahnama. Dependencies: SEAL, ageAt, bn, bnDate, esc, fDT, fee, regName, regNameBn, sigDate, tkBn, toEn, today. */
export function createComponentsNikahnama(dependencies: AnyDeps) {
  function docHTML(a: ApplicationRecord): string {
    const f = a.f,
      m = f.m,
      issued = a.status === "issued";
    const ad = (x: AddressInfo) =>
      [x.houseBn, x.roadBn, x.po && "ডাকঘর: " + x.po, x.uni, x.ward, x.upz, x.dist]
        .filter(Boolean)
        .join(", ");
    const pl = (p?: PersonFormInfo, nid?: string) =>
      p && p.nameBn
        ? `${dependencies.esc(p.nameBn)}, পিতা: ${dependencies.esc(p.fatherBn)}${p.motherBn ? ", মাতা: " + dependencies.esc(p.motherBn) : ""}, ঠিকানা: ${dependencies.esc(ad(p.addr))}${nid ? ` (জাতীয় পরিচয়পত্র / জন্ম সনদ নম্বর: ${dependencies.bn(dependencies.toEn(nid))})` : ""}`
        : "প্রযোজ্য নয়";
    const yn = (v: string) => (v === "yes" ? "হ্যাঁ" : "না");
    const ukB = f.ukil.appointed === "yes" && f.ukil.side === "bride",
      ukG = f.ukil.appointed === "yes" && f.ukil.side === "groom";
    const wl = (a1: PersonFormInfo, a2: PersonFormInfo) => `(১) ${pl(a1)}<br>(২) ${pl(a2)}`;
    const at = m.regDate || dependencies.today();
    const C: Array<[string, string]> = [
      [
        "ওয়ার্ড, শহর, ইউনিয়ন, তহসিল, থানা ও জেলার নাম যেখানে বিবাহ কার্য সম্পন্ন হইয়াছে",
        dependencies.esc([f.loc.ward, f.loc.uni, f.loc.upz, f.loc.dist].filter(Boolean).join(", ")),
      ],
      ["নিজ নিজ বাসস্থানসহ বর ও তাহার পিতার ও মাতার নাম", pl(f.groom, f.groom.nid)],
      [
        "বরের বয়স",
        f.groom.dob
          ? `${dependencies.bn(dependencies.ageAt(f.groom.dob, at))} বছর (জন্ম তারিখ - ${dependencies.bnDate(f.groom.dob)})`
          : "",
      ],
      ["নিজ নিজ বাসস্থানসহ কন্যা ও তাহার পিতা ও মাতার নাম", pl(f.bride, f.bride.nid)],
      ["কন্যা কুমারী, বিধবা অথবা তালাকপ্রাপ্তা নারী কি না?", dependencies.esc(f.bride.marital)],
      [
        "কন্যার বয়স",
        f.bride.dob
          ? `${dependencies.bn(dependencies.ageAt(f.bride.dob, at))} বছর (জন্ম তারিখ - ${dependencies.bnDate(f.bride.dob)})`
          : "",
      ],
      [
        "কন্যা কর্তৃক উকিল নিযুক্ত হইলে ঐ উকিলের নাম এবং তাহার পিতা ও মাতার নামসহ বাসস্থানের ঠিকানা",
        ukB ? pl(f.ukil.person) : "প্রযোজ্য নয়",
      ],
      [
        "পিতার নাম, বাসস্থান ও কন্যার সহিত সম্পর্কের বর্ণনাসহ কন্যার উকিল নিয়োগের সাক্ষীদের নাম",
        ukB ? wl(f.ukil.w1, f.ukil.w2) : "প্রযোজ্য নয়",
      ],
      [
        "বর কর্তৃক উকিল নিযুক্ত হইলে ঐ উকিলের নাম এবং তাহার পিতা ও মাতার নামসহ বাসস্থানের ঠিকানা",
        ukG ? pl(f.ukil.person) : "প্রযোজ্য নয়",
      ],
      [
        "পিতা এবং মাতার নাম ও বাসস্থানসহ বরের উকিল নিয়োগের ব্যাপারে সাক্ষীদের নাম",
        ukG ? wl(f.ukil.w1, f.ukil.w2) : "প্রযোজ্য নয়",
      ],
      [
        "বিবাহের সাক্ষীদের নাম, তাহাদের পিতা এবং মাতার নাম ও বাসস্থানের ঠিকানা",
        wl(f.wit.w1, f.wit.w2),
      ],
      ["যে তারিখে বিবাহের কথাবার্তা ঠিক হইয়াছিল সেই তারিখ", dependencies.bnDate(m.settle)],
      ["দেন মোহরের পরিমাণ", m.mohor ? dependencies.tkBn(dependencies.toEn(m.mohor)) : ""],
      [
        "দেন মোহরের কি পরিমাণ আশু (মুয়াজ্জল) এবং কি পরিমাণ বিলম্বিত (মু'অজ্জল)",
        dependencies.esc(m.prompt),
      ],
      [
        "বিবাহের সময় দেন মোহরের কোন অংশ পরিশোধ করা হইয়াছে কিনা? যদি হইয়া থাকে উহার পরিমাণ কত?",
        dependencies.esc(m.paid || "না"),
      ],
      [
        "সম্পত্তি দেন মোহর বা উহার অংশ বিশেষের পরিবর্তে প্রদত্ত হইয়াছে কি না? বিশেষ বিবরণ",
        yn(m.c16) + (m.c16 === "yes" && m.c16d ? " — " + dependencies.esc(m.c16d) : ""),
      ],
      [
        "বিশেষ শর্তাদি থাকিলে তাহা",
        m.c17 === "yes" ? dependencies.esc([...m.c17o, m.c17d].filter(Boolean).join("; ")) : "নাই",
      ],
      [
        "স্বামী স্ত্রীকে তালাক প্রদানের ক্ষমতা অর্পণ করিয়াছে কি না? করিয়া থাকিলে কি কি শর্তে",
        yn(m.c18) + (m.c18 === "yes" && m.c18d ? " — " + dependencies.esc(m.c18d) : ""),
      ],
      [
        "স্বামীর তালাক প্রদানের অধিকার কোন প্রকারে খর্ব হইয়াছে কি না?",
        yn(m.c19) + (m.c19 === "yes" && m.c19d ? " — " + dependencies.esc(m.c19d) : ""),
      ],
      [
        "বিবাহের সময় দেন মোহর খোরপোষ ইত্যাদি সম্পর্কে কোন দলিল করা হইয়াছে কি না? সংক্ষিপ্ত বিবরণ",
        yn(m.c20) + (m.c20 === "yes" && m.c20d ? " — " + dependencies.esc(m.c20d) : ""),
      ],
      ["বরের কোন স্ত্রী বর্তমানে আছে কি না?", yn(m.c21)],
      [
        "সালিসী কাউন্সিলের অনুমতিপত্রের বিস্তারিত (১৯৬১ সালের মুসলিম পারিবারিক আইন অধ্যাদেশ মোতাবেক)",
        m.c21 === "yes"
          ? `অনুমতিপত্র নম্বর ${dependencies.esc(dependencies.bn(m.permNo))}, তারিখ ${dependencies.bnDate(m.permDate)}`
          : "প্রযোজ্য নয়",
      ],
      [
        "যে ব্যক্তি বিবাহ পড়াইয়াছেন তাহার নাম ও পিতার নাম",
        f.off.nameBn
          ? `${dependencies.esc(f.off.nameBn)}, পিতা: ${dependencies.esc(f.off.fatherBn)}`
          : "",
      ],
      [
        "বিবাহ রেজিস্ট্রির তারিখ",
        dependencies.bnDate(issued && a.issued ? a.issued.at : m.regDate),
      ],
      ["রেজিস্ট্রি ফি", m.mohor ? dependencies.tkBn(dependencies.fee(m.mohor)) : ""],
    ];
    const sigBox = (role: string, who: string, rec: PartySignature, key: string) =>
      rec && rec.sign
        ? `<button class="vsig on" data-act="sigdetail" data-id="${a.id}" data-k="${key}"><div class="role">${role}</div><div class="scr">${dependencies.esc(who)}</div>Signed By: <b>${dependencies.esc(who)}</b><br>Organization: ${key === "reg" ? "Law &amp; Justice Division" : "Citizen (OneID)"}<br>Country Code: BD<br>Date: ${dependencies.sigDate(rec.sign.at)}</button>`
        : `<div class="vsig"><div class="role">${role}</div><div class="pend">eSign pending</div></div>`;
    const sigs =
      sigBox("বরের স্বাক্ষর", f.groom.nameEn, a.esign.groom, "groom") +
      sigBox("কনের স্বাক্ষর", f.bride.nameEn, a.esign.bride, "bride") +
      sigBox(
        "নিকাহ রেজিস্ট্রারের স্বাক্ষর ও সিল",
        f.registrar ? dependencies.regName(f.registrar) : "",
        a.reg,
        "reg",
      );
    const sig = issued ? a.vds.split("|S:")[1] || "" : "";
    const vds =
      issued && a.issued
        ? `<div class="vds"><div><div class="qr" data-qr="${dependencies.esc(a.vds)}"></div><div class="pki">PKI Ref: ${dependencies.esc(sig.slice(0, 24))}</div></div><div><b>Visible Digital Seal (VDS)</b><p>Scan with the Universal Verifier, or enter the registration number on the Verify page, to confirm this Nikahnama is genuine and unchanged. Click any signature above to see its details.</p><p style="color:#16201C">Reg. no. <b style="font-size:inherit;color:inherit">${dependencies.esc(a.issued.regNo)}</b> · Sealed ${dependencies.fDT(a.issued.at)}</p></div>${dependencies.SEAL}</div>`
        : `<div class="vds pending"><div class="qrph">VDS</div><div><b>Digital seal pending</b><p>The VDS and registration number are added when the marriage registrar approves with eSign.</p></div></div>`;
    return `<article class="paper">${issued ? "" : `<div class="wm"><span>খসড়া — নিবন্ধন সম্পন্ন হয়নি</span></div>`}<div class="paper-in">
    <div class="dh"><div class="g1">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div><div class="g2">আইন ও বিচার বিভাগ</div><div class="t">ডিজিটাল নিকাহনামা</div><div class="t2">(কনের জন্য / বরের জন্য) · মুসলিম বিবাহ ও তালাক (নিবন্ধন) বিধিমালা, ২০০৯ এর বিধি ২৮ (১) (ক) অনুযায়ী বিবাহ নিবন্ধন</div></div>
    <div class="dmeta"><span>আবেদন নম্বর: <b>${dependencies.esc(dependencies.bn(a.appNo))}</b></span><span>নিবন্ধন নম্বর: <b>${issued && a.issued ? dependencies.esc(dependencies.bn(a.issued.regNo)) : "অনুমোদনের পর"}</b></span><span>নিকাহ রেজিস্ট্রার: <b>${f.registrar ? dependencies.esc(dependencies.regNameBn(f.registrar)) : ""}</b></span></div>
    <ol class="clauses">${C.map((c, i) => `<li><span class="n">${dependencies.bn(i + 1)}।</span><span><span class="qq">${c[0]}:</span> <span class="aa">${c[1] || "—"}</span></span></li>`).join("")}</ol>
    <div class="sigs">${sigs}</div>${vds}
    <div class="dfoot">${issued ? "Electronically signed and sealed. A printed copy is valid when its VDS verifies." : "Draft. Not valid until approved by the marriage registrar."}</div></div></article>`;
  }
  function hydrateQR(root: Element | null): void {
    if (!root || typeof QRCode !== "function") return;
    root.querySelectorAll<HTMLElement>("[data-qr]").forEach((el) => {
      if (el.dataset["done"]) return;
      el.dataset["done"] = "1";
      try {
        new QRCode(el, {
          text: el.dataset["qr"] ?? "",
          width: 128,
          height: 128,
          correctLevel: QRCode.CorrectLevel.M,
        });
      } catch {
        el.textContent = "QR";
      }
    });
  }
  return { docHTML, hydrateQR };
}
