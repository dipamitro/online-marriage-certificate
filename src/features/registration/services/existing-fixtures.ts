import type { AnyDeps, ApplicationRecord, ApplicationStatus } from "../types";

/** services/existing-fixtures. Dependencies: PEOPLE, REGISTRARS, S, addDays, demoEmail, demoForm, demoMobile, hist, issue, issueSync, sealIssued, licOf, pushMail, save, sendToVault, serial, today. */
export function createServicesExistingFixtures(dependencies: AnyDeps) {
  function seedSync(): void {
    dependencies.S = { apps: [], emails: [], seq: { app: 10030, reg: 5120 }, users: {} };
    (
      [
        ["5555555555", "Applicant"],
        ["7012345678", "Applicant"],
        ["7123456789", "Applicant"],
        ["8012345678", "Applicant"],
        ["8123456789", "Applicant"],
        ["9012345678", "Applicant"],
        ["9123456789", "Applicant"],
        ["6012345678", "Marriage Registrar"],
        ["6111111111", "Marriage Registrar"],
        ["6333333333", "Marriage Registrar"],
        ["1985123401", "Registrar applicant"],
        ["1988123402", "Registrar applicant"],
        ["1984123404", "Registrar applicant"],
      ] as const
    ).forEach(([n, role], i) => {
      dependencies.S.users[n] = {
        nid: n,
        role,
        email: dependencies.demoEmail(n),
        mobile: dependencies.demoMobile(n),
        ekyc: {
          at: dependencies.addDays(dependencies.today(), -40 - i * 3) + "T10:30:00",
          score: 97 + (i % 5) * 0.4,
        },
        at: dependencies.addDays(dependencies.today(), -40 - i * 3) + "T10:31:00",
      };
    });
    const mk = (
      id: string,
      owner: string,
      gN: string,
      bN: string,
      gEn: string,
      bEn: string,
      gBn: string,
      bBn: string,
      reg: string,
      status: ApplicationStatus,
    ): ApplicationRecord => {
      const f = dependencies.demoForm();
      f.registrar = reg;
      const R = dependencies.REGISTRARS[reg];
      if (R) {
        f.loc = { div: "ঢাকা", dist: R.dist, upz: R.upz, uni: R.uni, ward: R.wards[0] ?? "" };
      }
      f.groom = {
        ...f.groom,
        nameEn: gEn,
        nameBn: gBn,
        nid: gN,
        dob: dependencies.PEOPLE[gN].dob,
        email: dependencies.demoEmail(gN),
        mobile: dependencies.demoMobile(gN),
      };
      f.bride = {
        ...f.bride,
        nameEn: bEn,
        nameBn: bBn,
        nid: bN,
        dob: dependencies.PEOPLE[bN].dob,
        email: dependencies.demoEmail(bN),
        mobile: dependencies.demoMobile(bN),
      };
      dependencies.S.seq.app++;
      return {
        id,
        appNo: `APP-${dependencies.today().slice(0, 4)}-${dependencies.S.seq.app}`,
        owner,
        createdAt: dependencies.addDays(dependencies.today(), -3) + "T10:15:00",
        submittedAt: dependencies.addDays(dependencies.today(), -3) + "T10:20:00",
        f,
        status,
        revertReason: "",
        history: [],
        paid: true,
        esign: { groom: { ekyc: null, sign: null }, bride: { ekyc: null, sign: null } },
        reg: { ekyc: null, sign: null, acceptedAt: null },
        issued: null,
        vds: "",
      };
    };
    const ek = (nid: string, at: string) => ({
      at,
      score: 97.4,
      nameMatch: true,
      oneName: dependencies.PEOPLE[nid].en,
    });
    const sg = (at: string) => ({ at, serial: dependencies.serial() });
    const a1 = mk(
      "a1",
      "7012345678",
      "7012345678",
      "7123456789",
      "Arif Rahman",
      "Farzana Akter",
      "আরিফ রহমান",
      "ফারজানা আক্তার",
      "NR-DHK-0412",
      "approval",
    );
    a1.f.m.regDate = "2026-08-15";
    a1.submittedAt = "2026-08-12T10:20:00";
    a1.esign.groom = {
      ekyc: ek("7012345678", "2026-08-12T18:02:00"),
      sign: sg("2026-08-12T18:05:00"),
    };
    a1.esign.bride = {
      ekyc: ek("7123456789", "2026-08-12T19:10:00"),
      sign: sg("2026-08-12T19:12:00"),
    };
    a1.reg = {
      ekyc: { at: "2026-08-15T11:15:00", score: 98.1 },
      sign: sg("2026-08-15T11:20:00"),
      acceptedAt: "2026-08-13T12:00:00",
    };
    dependencies.hist(a1, "Arif Rahman", "Application submitted");
    dependencies.issueSync(a1, "2026-08-15T11:20:00");
    dependencies.sendToVault(a1, "2026-08-15T11:24:00");
    const a2 = mk(
      "a2",
      "5555555555",
      "8012345678",
      "8123456789",
      "Imran Hossain",
      "Laboni Islam",
      "ইমরান হোসেন",
      "সাদিয়া ইসলাম",
      "NR-DHK-0377",
      "appraisal",
    );
    a2.esign.groom = {
      ekyc: ek("8012345678", dependencies.addDays(dependencies.today(), -2) + "T20:10:00"),
      sign: sg(dependencies.addDays(dependencies.today(), -2) + "T20:12:00"),
    };
    a2.esign.bride = {
      ekyc: {
        ...ek("8123456789", dependencies.addDays(dependencies.today(), -1) + "T09:40:00"),
        nameMatch: false,
        oneName: "Laboni Islam Mim",
      },
      sign: sg(dependencies.addDays(dependencies.today(), -1) + "T09:43:00"),
    };
    a2.f.bride.nameEn = "Laboni Islam";
    dependencies.hist(a2, "Abdul Karim", "Application submitted (representative)");
    dependencies.hist(a2, "Imran Hossain", "eKYC completed and eSigned");
    dependencies.hist(a2, "Laboni Islam", "eKYC completed and eSigned");
    const a3 = mk(
      "a3",
      "5555555555",
      "9012345678",
      "9123456789",
      "Rakibul Hasan",
      "Mitu Akter",
      "রাকিবুল হাসান",
      "মিতু আক্তার",
      "NR-DHK-0377",
      "esign",
    );
    a3.esign.groom = {
      ekyc: ek("9012345678", dependencies.addDays(dependencies.today(), -1) + "T21:00:00"),
      sign: sg(dependencies.addDays(dependencies.today(), -1) + "T21:03:00"),
    };
    dependencies.hist(a3, "Abdul Karim", "Application submitted (representative)");
    dependencies.hist(a3, "Rakibul Hasan", "eKYC completed and eSigned");
    dependencies.S.apps.push(a2, a3, a1);
    dependencies.S.emails.forEach((m: { read: boolean }) => (m.read = true));
    dependencies.pushMail(
      a3.f.bride.email,
      "Mitu Akter",
      "Please review and eSign your marriage registration application",
      [
        "Dear Mitu Akter,",
        `A marriage registration application (${a3.appNo}) has been submitted naming you as the bride.`,
        "Please sign in (or sign up with OneID eKYC if you are new), review the information and accept with your eSign.",
      ],
      { type: "esign", nid: "9123456789" },
    );
    dependencies.save();
  }

  async function seed(): Promise<void> {
    seedSync();
    for (const a of dependencies.S.apps) {
      if (a.status === "issued") {
        await dependencies.sealIssued(a);
      }
    }
    dependencies.save();
  }

  return { seedSync, seed };
}
