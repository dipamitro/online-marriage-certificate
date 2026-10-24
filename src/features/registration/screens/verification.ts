import type { AnyDeps, ApplicationRecord } from "../types";

/** screens/verification. Dependencies: S, UI, esc, fD, regName, render, verP. */
export function createScreensVerification(dependencies: AnyDeps) {
  function verifyPage(): string {
    const v = dependencies.UI.verify,
      iss: ApplicationRecord[] = dependencies.S.apps.filter(
        (a: ApplicationRecord) => a.status === "issued",
      );
    let r = "";
    if (v.result) {
      const x = v.result;
      r = x.ok
        ? `<div class="vres good"><h3>✓ Genuine and unchanged · ${dependencies.esc(x.doc)}</h3><p style="margin-top:6px">The VDS signature matches the Law and Justice Division's key, and the record exists in the central repository.</p><dl class="kv" style="margin-top:12px">${x.sn ? `<div><dt>Certificate SN</dt><dd>${dependencies.esc(x.sn)}</dd></div>` : ""}<div><dt>Registration no.</dt><dd>${dependencies.esc(x.regNo)}</dd></div><div><dt>Groom</dt><dd>${dependencies.esc(x.g)} (NID ••••${dependencies.esc(x.g4)})</dd></div><div><dt>Bride</dt><dd>${dependencies.esc(x.b)} (NID ••••${dependencies.esc(x.b4)})</dd></div><div><dt>Marriage date</dt><dd>${dependencies.fD(x.date)}</dd></div><div><dt>Sealed</dt><dd>${dependencies.fD(x.sealed)}</dd></div><div><dt>Registrar</dt><dd>${dependencies.esc(dependencies.regName(x.lic))} (${dependencies.esc(x.lic)})</dd></div></dl></div>`
        : `<div class="vres bad"><h3>Not verified</h3><p style="margin-top:6px">${dependencies.esc(x.reason)}</p></div>`;
    }
    return `<div class="banner"><div><h2>Verify a Nikahnama or Marriage Certificate</h2><p>Universal Verifier · for printed or digital copies</p></div><div class="pills2"><span>VDS</span><span class="gr">PKI</span></div></div>
    <div class="card"><div class="fg"><label>Registration number, certificate SN, or the text from scanning the VDS QR code</label><textarea class="inp" data-v="1" placeholder="e.g. NK-2026-005121">${dependencies.esc(v.input)}</textarea></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn bp" data-act="verify">Verify</button>${iss.map((a) => `<button class="btn bs" data-act="vsample" data-id="${a.id}">Try Nikahnama ${dependencies.esc(a.issued?.regNo)}</button>${a.cert ? `<button class="btn bs" data-act="vsamplec" data-id="${a.id}">Try Certificate ${dependencies.esc(a.cert.sn)}</button>` : ""}`).join("")}${iss[0] ? `<button class="btn bs" data-act="vtamper" data-id="${iss[0].id}">Try a tampered copy</button>` : ""}</div>${r}</div>`;
  }
  async function runVerify(): Promise<void> {
    const t: string = dependencies.UI.verify.input.trim(),
      fail = (reason: string) => {
        dependencies.UI.verify.result = { ok: false, reason };
        dependencies.render();
      };
    if (!t)
      return fail("Enter a registration number, certificate SN, or paste the scanned VDS text.");
    let seal = t;
    if (!/^BD(NK|MC)1\|/.test(t)) {
      const a: ApplicationRecord | undefined = dependencies.S.apps.find(
          (x: ApplicationRecord) => x.issued && x.issued.regNo.toLowerCase() === t.toLowerCase(),
        ),
        c: ApplicationRecord | undefined = dependencies.S.apps.find(
          (x: ApplicationRecord) => x.cert && x.cert.sn === t,
        );
      if (a) seal = a.vds;
      else if (c && c.cert) seal = c.cert.vds;
      else
        return fail(
          "No Nikahnama or Marriage Certificate with this number is in the central repository.",
        );
    }
    const i = seal.lastIndexOf("|S:");
    if (i < 0) return fail("This isn't a valid VDS.");
    const pl = seal.slice(0, i),
      f = pl.split("|");
    if (!(await dependencies.verP(pl, seal.slice(i + 3))))
      return fail(
        "The seal's signature doesn't match its contents. The document may have been altered.",
      );
    const isC = f[0] === "BDMC1";
    const r = {
      ok: true,
      doc: isC ? "Marriage Certificate" : "Digital Nikahnama",
      sn: isC ? f[1] : "",
      regNo: isC ? f[2] : f[1],
      sealed: isC ? f[3] : f[2],
      g: isC ? f[4] : f[3],
      g4: isC ? f[5] : f[4],
      b: isC ? f[6] : f[5],
      b4: isC ? f[7] : f[6],
      date: isC ? f[8] : f[7],
      lic: isC ? f[9] : f[8],
    };
    if (!dependencies.S.apps.some((x: ApplicationRecord) => x.issued && x.issued.regNo === r.regNo))
      return fail("The seal is genuine, but the record is missing from the repository.");
    dependencies.UI.verify.result = r;
    dependencies.render();
  }
  return { verifyPage, runVerify };
}
