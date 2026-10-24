import type { AnyDeps, ApplicationRecord } from "../types";

/** services/issuance. Dependencies: S, hist, now, pad, pushMail, regName, signP, toEn. */
export function createServicesIssuance(dependencies: AnyDeps) {
  function issueSync(a: ApplicationRecord, at?: string): void {
    dependencies.S.seq.reg++;
    const when = at || dependencies.now();
    a.issued = {
      regNo: `NK-${when.slice(0, 4)}-${dependencies.pad(dependencies.S.seq.reg, 6)}`,
      at: when,
    };
    const pl = [
      "BDNK1",
      a.issued.regNo,
      when.slice(0, 10),
      a.f.groom.nameEn,
      dependencies.toEn(a.f.groom.nid).slice(-4),
      a.f.bride.nameEn,
      dependencies.toEn(a.f.bride.nid).slice(-4),
      a.f.m.regDate,
      a.f.registrar,
    ].join("|");
    a.vds = pl + "|S:UNSIGNED";
    const sn =
      String(410000 + Math.floor(Math.random() * 580000)) +
      "-" +
      dependencies.pad(dependencies.S.seq.reg % 10000, 4);
    const cpl = [
      "BDMC1",
      sn,
      a.issued.regNo,
      when.slice(0, 10),
      a.f.groom.nameEn,
      dependencies.toEn(a.f.groom.nid).slice(-4),
      a.f.bride.nameEn,
      dependencies.toEn(a.f.bride.nid).slice(-4),
      a.f.m.regDate,
      a.f.registrar,
    ].join("|");
    a.cert = { sn, at: when, vds: cpl + "|S:UNSIGNED" };
    a.status = "issued";
    dependencies.hist(
      a,
      dependencies.regName(a.f.registrar),
      "Approved with eSign. Digital Nikahnama and Marriage Certificate generated, each with VDS.",
    );
  }

  async function sealIssued(a: ApplicationRecord): Promise<void> {
    if (a.vds) {
      const i = a.vds.lastIndexOf("|S:");
      const pl = i >= 0 ? a.vds.slice(0, i) : a.vds;
      a.vds = pl + "|S:" + (await dependencies.signP(pl));
    }
    if (a.cert?.vds) {
      const i = a.cert.vds.lastIndexOf("|S:");
      const cpl = i >= 0 ? a.cert.vds.slice(0, i) : a.cert.vds;
      a.cert.vds = cpl + "|S:" + (await dependencies.signP(cpl));
    }
  }

  async function issue(a: ApplicationRecord, at?: string): Promise<void> {
    issueSync(a, at);
    await sealIssued(a);
  }

  function sendToVault(a: ApplicationRecord, at?: string): void {
    const when = at || dependencies.now();
    a.vault = { at: when, groom: true, bride: true };
    dependencies.hist(
      a,
      dependencies.regName(a.f.registrar),
      "Digital Nikahnama and Marriage Certificate sent to the bride's and groom's OneID Wallet (Documents Vault › Marriage Certificate)",
    );
    (["groom", "bride"] as const).forEach((k) => {
      const p = a.f[k];
      dependencies.pushMail(
        p.email,
        p.nameEn,
        "Your Digital Nikahnama and Marriage Certificate are in your OneID Wallet",
        [
          `Dear ${p.nameEn},`,
          `Your marriage registration ${a.issued?.regNo ?? ""} has been approved by ${dependencies.regName(a.f.registrar)}.`,
          "Two documents have been added to your OneID Wallet under Documents Vault › Marriage Certificate: the Digital Nikahnama (signed by the bride, groom and registrar) and the Marriage Certificate (signed by the registrar). Both carry a Visible Digital Seal (VDS).",
        ],
        { type: "vault", nid: dependencies.toEn(p.nid).trim(), appId: a.id },
      );
    });
  }
  return { issueSync, sealIssued, issue, sendToVault };
}
