import type { AnyDeps, ApplicationRecord } from "../types";

/**
 * Renders the Universal Document Verifier (`/verify`) and validates Visible Digital Seals (VDS)
 * for Digital Nikahnamas (`BDNK1`) and Marriage Certificates (`BDMC1`).
 *
 * Dependencies: `S`, `UI`, `esc`, `fD`, `regName`, `render`, `verP`.
 */
export function createScreensVerification(dependencies: AnyDeps) {
  /**
   * Renders the `/verify` page with sample quick-fill buttons and verification result card.
   */
  function verifyPage(): string {
    const verifyState = dependencies.UI.verify;
    const issuedApplications: ApplicationRecord[] = dependencies.S.apps.filter(
      (app: ApplicationRecord) => app.status === "issued",
    );

    let verificationResultHtml = "";
    if (verifyState.result) {
      const result = verifyState.result;
      verificationResultHtml = result.ok
        ? `
          <div class="vres good">
            <h3>✓ Genuine and unchanged · ${dependencies.esc(result.doc)}</h3>
            <p style="margin-top:6px">
              The VDS signature matches the Law and Justice Division's key, and the record exists in the central repository.
            </p>
            <dl class="kv" style="margin-top:12px">
              ${result.sn ? `<div><dt>Certificate SN</dt><dd>${dependencies.esc(result.sn)}</dd></div>` : ""}
              <div><dt>Registration no.</dt><dd>${dependencies.esc(result.regNo)}</dd></div>
              <div><dt>Groom</dt><dd>${dependencies.esc(result.g)} (NID ••••${dependencies.esc(result.g4)})</dd></div>
              <div><dt>Bride</dt><dd>${dependencies.esc(result.b)} (NID ••••${dependencies.esc(result.b4)})</dd></div>
              <div><dt>Marriage date</dt><dd>${dependencies.fD(result.date)}</dd></div>
              <div><dt>Sealed</dt><dd>${dependencies.fD(result.sealed)}</dd></div>
              <div><dt>Registrar</dt><dd>${dependencies.esc(dependencies.regName(result.lic))} (${dependencies.esc(result.lic)})</dd></div>
            </dl>
          </div>
        `
        : `
          <div class="vres bad">
            <h3>Not verified</h3>
            <p style="margin-top:6px">${dependencies.esc(result.reason)}</p>
          </div>
        `;
    }

    const sampleButtonsHtml = issuedApplications
      .map((app) => {
        const nikahnamaBtn = `<button class="btn bs" data-act="vsample" data-id="${app.id}">Try Nikahnama ${dependencies.esc(app.issued?.regNo)}</button>`;
        const certificateBtn = app.cert
          ? `<button class="btn bs" data-act="vsamplec" data-id="${app.id}">Try Certificate ${dependencies.esc(app.cert.sn)}</button>`
          : "";
        return nikahnamaBtn + certificateBtn;
      })
      .join("");

    const tamperedSampleBtn = issuedApplications[0]
      ? `<button class="btn bs" data-act="vtamper" data-id="${issuedApplications[0].id}">Try a tampered copy</button>`
      : "";

    return `
      <div class="banner">
        <div>
          <h2>Verify a Nikahnama or Marriage Certificate</h2>
          <p>Universal Verifier · for printed or digital copies</p>
        </div>
        <div class="pills2">
          <span>VDS</span>
          <span class="gr">PKI</span>
        </div>
      </div>
      <div class="card">
        <div class="fg">
          <label>Registration number, certificate SN, or the text from scanning the VDS QR code</label>
          <textarea class="inp" data-v="1" placeholder="e.g. NK-2026-005121">${dependencies.esc(verifyState.input)}</textarea>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn bp" data-act="verify">Verify</button>
          ${sampleButtonsHtml}
          ${tamperedSampleBtn}
        </div>
        ${verificationResultHtml}
      </div>
    `;
  }

  /**
   * Cryptographically verifies the user's input (Registration Number, Certificate SN, or raw VDS QR payload)
   * against the Law and Justice Division ECDSA public key and central application repository.
   */
  async function runVerify(): Promise<void> {
    const rawInput: string = dependencies.UI.verify.input.trim();

    const failVerification = (reason: string) => {
      dependencies.UI.verify.result = { ok: false, reason };
      dependencies.render();
    };

    if (!rawInput) {
      return failVerification(
        "Enter a registration number, certificate SN, or paste the scanned VDS text.",
      );
    }

    // 1. Resolve registration number or certificate SN into a full VDS string if needed
    let sealString = rawInput;
    if (!/^BD(NK|MC)1\|/.test(rawInput)) {
      const matchedByRegNo: ApplicationRecord | undefined = dependencies.S.apps.find(
        (app: ApplicationRecord) =>
          app.issued && app.issued.regNo.toLowerCase() === rawInput.toLowerCase(),
      );
      const matchedByCertSn: ApplicationRecord | undefined = dependencies.S.apps.find(
        (app: ApplicationRecord) => app.cert && app.cert.sn === rawInput,
      );

      if (matchedByRegNo) {
        sealString = matchedByRegNo.vds;
      } else if (matchedByCertSn && matchedByCertSn.cert) {
        sealString = matchedByCertSn.cert.vds;
      } else {
        return failVerification(
          "No Nikahnama or Marriage Certificate with this number is in the central repository.",
        );
      }
    }

    // 2. Split payload and ECDSA signature (`|S:`)
    const signatureMarkerIndex = sealString.lastIndexOf("|S:");
    if (signatureMarkerIndex < 0) {
      return failVerification("This isn't a valid VDS.");
    }

    const payload = sealString.slice(0, signatureMarkerIndex);
    const signatureBase64Url = sealString.slice(signatureMarkerIndex + 3);
    const fields = payload.split("|");

    // 3. Verify cryptographic signature
    const isSignatureValid = await dependencies.verP(payload, signatureBase64Url);
    if (!isSignatureValid) {
      return failVerification(
        "The seal's signature doesn't match its contents. The document may have been altered.",
      );
    }

    // 4. Parse fields from `BDMC1` (Marriage Certificate) or `BDNK1` (Digital Nikahnama)
    const isMarriageCertificate = fields[0] === "BDMC1";
    const parsedResult = {
      ok: true,
      doc: isMarriageCertificate ? "Marriage Certificate" : "Digital Nikahnama",
      sn: isMarriageCertificate ? fields[1] : "",
      regNo: isMarriageCertificate ? fields[2] : fields[1],
      sealed: isMarriageCertificate ? fields[3] : fields[2],
      g: isMarriageCertificate ? fields[4] : fields[3],
      g4: isMarriageCertificate ? fields[5] : fields[4],
      b: isMarriageCertificate ? fields[6] : fields[5],
      b4: isMarriageCertificate ? fields[7] : fields[6],
      date: isMarriageCertificate ? fields[8] : fields[7],
      lic: isMarriageCertificate ? fields[9] : fields[8],
    };

    const existsInRepository = dependencies.S.apps.some(
      (app: ApplicationRecord) => app.issued && app.issued.regNo === parsedResult.regNo,
    );
    if (!existsInRepository) {
      return failVerification(
        "The seal is genuine, but the record is missing from the repository.",
      );
    }

    dependencies.UI.verify.result = parsedResult;
    dependencies.render();
  }

  return { verifyPage, runVerify };
}
