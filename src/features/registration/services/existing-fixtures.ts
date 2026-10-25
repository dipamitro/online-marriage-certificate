import type { AnyDeps, ApplicationRecord, ApplicationStatus } from "../types";

/**
 * Seeds default demo accounts and marriage registration records when `localStorage` is empty.
 *
 * Dependencies: `PEOPLE`, `REGISTRARS`, `S`, `addDays`, `demoEmail`, `demoForm`, `demoMobile`,
 * `hist`, `issue`, `issueSync`, `sealIssued`, `licOf`, `pushMail`, `save`, `sendToVault`,
 * `serial`, `today`.
 */
export function createServicesExistingFixtures(dependencies: AnyDeps) {
  function seedSync(): void {
    dependencies.S = { apps: [], emails: [], seq: { app: 10030, reg: 5120 }, users: {} };
    (
      [
        ["5555555555", "Applicant"], // Abdul Karim (abdul.karim@mail.com) — Couple 1 Groom
        ["7123456789", "Applicant"], // Farzana Akter (farzana.akter@mail.com) — Couple 1 Bride
        ["7012345678", "Applicant"], // Arif Rahman (arif.rahman@mail.com) — Couple 2 Groom
        ["8123456789", "Applicant"], // Laboni Islam (laboni.islam@mail.com) — Couple 2 Bride
        ["9012345678", "Applicant"], // Rakibul Hasan (rakibul.hasan@mail.com) — Couple 3 Groom
        ["9123456789", "Applicant"], // Mitu Akter (mitu.akter@mail.com) — Couple 3 Bride
        ["8012345678", "Applicant"], // Imran Hossain (imran.hossain@mail.com) — Couple 4 Groom
        ["8223456789", "Applicant"], // Sadia Islam (sadia.islam@mail.com) — Couple 4 Bride
        ["1990123456", "Applicant"], // Tanvir Hasan (tanvir.hasan@mail.com) — Couple 5 Groom
        ["2001987654", "Applicant"], // Nusrat Jahan (nusrat.jahan@mail.com) — Couple 5 Bride
        ["6012345678", "Marriage Registrar"],
        ["6111111111", "Marriage Registrar"],
        ["6333333333", "Marriage Registrar"],
        ["1985123401", "Registrar applicant"],
        ["1988123402", "Registrar applicant"],
        ["1984123404", "Registrar applicant"],
      ] as const
    ).forEach(([nid, role], index) => {
      const person = dependencies.PEOPLE[nid];
      dependencies.S.users[nid] = {
        nid,
        role,
        name: person?.en || nid,
        nameBn: person?.bn || person?.en || nid,
        dob: person?.dob || "1995-01-01",
        gender: person?.g || "M",
        email: dependencies.demoEmail(nid),
        mobile: dependencies.demoMobile(nid),
        ekyc: {
          at: dependencies.addDays(dependencies.today(), -40 - index * 3) + "T10:30:00",
          score: 97 + (index % 5) * 0.4,
        },
        at: dependencies.addDays(dependencies.today(), -40 - index * 3) + "T10:31:00",
      };
    });

    const createSeededApplication = (
      id: string,
      owner: string,
      groomNid: string,
      brideNid: string,
      groomNameEn: string,
      brideNameEn: string,
      groomNameBn: string,
      brideNameBn: string,
      registrarLicence: string,
      status: ApplicationStatus,
    ): ApplicationRecord => {
      const form = dependencies.demoForm({ nid: groomNid });
      form.registrar = registrarLicence;
      const registrarRecord = dependencies.REGISTRARS[registrarLicence];
      if (registrarRecord) {
        form.loc = {
          div: "ঢাকা",
          dist: registrarRecord.dist,
          upz: registrarRecord.upz,
          uni: registrarRecord.uni,
          ward: registrarRecord.wards[0] ?? "",
        };
      }
      form.groom = {
        ...form.groom,
        nameEn: groomNameEn,
        nameBn: groomNameBn,
        nid: groomNid,
        dob: dependencies.PEOPLE[groomNid].dob,
        email: dependencies.demoEmail(groomNid),
        mobile: dependencies.demoMobile(groomNid),
      };
      form.bride = {
        ...form.bride,
        nameEn: brideNameEn,
        nameBn: brideNameBn,
        nid: brideNid,
        dob: dependencies.PEOPLE[brideNid].dob,
        email: dependencies.demoEmail(brideNid),
        mobile: dependencies.demoMobile(brideNid),
      };
      dependencies.S.seq.app++;
      return {
        id,
        appNo: `APP-${dependencies.today().slice(0, 4)}-${dependencies.S.seq.app}`,
        owner,
        createdAt: dependencies.addDays(dependencies.today(), -3) + "T10:15:00",
        submittedAt: dependencies.addDays(dependencies.today(), -3) + "T10:20:00",
        f: form,
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

    const createEkycStamp = (nid: string, timestamp: string) => ({
      at: timestamp,
      score: 97.4,
      nameMatch: true,
      oneName: dependencies.PEOPLE[nid].en,
    });
    const createSignStamp = (timestamp: string) => ({
      at: timestamp,
      serial: dependencies.serial(),
    });

    // Seeded Application 1 (Issued): Tanvir Hasan & Nusrat Jahan (Couple 5)
    const app1 = createSeededApplication(
      "a1",
      "1990123456",
      "1990123456",
      "2001987654",
      "Tanvir Hasan",
      "Nusrat Jahan",
      "তানভীর হাসান",
      "নুসরাত জাহান",
      "NR-DHK-0412",
      "approval",
    );
    app1.f.m.regDate = "2026-08-15";
    app1.submittedAt = "2026-08-12T10:20:00";
    app1.esign.groom = {
      ekyc: createEkycStamp("1990123456", "2026-08-12T18:02:00"),
      sign: createSignStamp("2026-08-12T18:05:00"),
    };
    app1.esign.bride = {
      ekyc: createEkycStamp("2001987654", "2026-08-12T19:10:00"),
      sign: createSignStamp("2026-08-12T19:12:00"),
    };
    app1.reg = {
      ekyc: { at: "2026-08-15T11:15:00", score: 98.1 },
      sign: createSignStamp("2026-08-15T11:20:00"),
      acceptedAt: "2026-08-13T12:00:00",
    };
    dependencies.hist(app1, "Tanvir Hasan", "Application submitted");
    dependencies.issueSync(app1, "2026-08-15T11:20:00");
    dependencies.sendToVault(app1, "2026-08-15T11:24:00");

    // Seeded Application 2 (Appraisal): Imran Hossain & Sadia Islam (Couple 4)
    const app2 = createSeededApplication(
      "a2",
      "8012345678",
      "8012345678",
      "8223456789",
      "Imran Hossain",
      "Sadia Islam",
      "ইমরান হোসেন",
      "সাদিয়া ইসলাম",
      "NR-DHK-0377",
      "appraisal",
    );
    app2.esign.groom = {
      ekyc: createEkycStamp(
        "8012345678",
        dependencies.addDays(dependencies.today(), -2) + "T20:10:00",
      ),
      sign: createSignStamp(dependencies.addDays(dependencies.today(), -2) + "T20:12:00"),
    };
    app2.esign.bride = {
      ekyc: {
        ...createEkycStamp(
          "8223456789",
          dependencies.addDays(dependencies.today(), -1) + "T09:40:00",
        ),
        nameMatch: false,
        oneName: "Sadia Islam Mim",
      },
      sign: createSignStamp(dependencies.addDays(dependencies.today(), -1) + "T09:43:00"),
    };
    app2.f.bride.nameEn = "Sadia Islam";
    dependencies.hist(app2, "Imran Hossain", "Application submitted");
    dependencies.hist(app2, "Imran Hossain", "eKYC completed and eSigned");
    dependencies.hist(app2, "Sadia Islam", "eKYC completed and eSigned");

    // Seeded Application 3 (Awaiting Bride eSign): Rakibul Hasan & Mitu Akter (Couple 3)
    const app3 = createSeededApplication(
      "a3",
      "9012345678",
      "9012345678",
      "9123456789",
      "Rakibul Hasan",
      "Mitu Akter",
      "রাকিবুল হাসান",
      "মিতু আক্তার",
      "NR-DHK-0377",
      "esign",
    );
    app3.esign.groom = {
      ekyc: createEkycStamp(
        "9012345678",
        dependencies.addDays(dependencies.today(), -1) + "T21:00:00",
      ),
      sign: createSignStamp(dependencies.addDays(dependencies.today(), -1) + "T21:03:00"),
    };
    dependencies.hist(app3, "Rakibul Hasan", "Application submitted");
    dependencies.hist(app3, "Rakibul Hasan", "eKYC completed and eSigned");

    dependencies.S.apps.push(app2, app3, app1);
    dependencies.S.emails.forEach((m: { read: boolean }) => (m.read = true));
    dependencies.pushMail(
      app3.f.bride.email,
      "Mitu Akter",
      "Please review and eSign your marriage registration application",
      [
        "Dear Mitu Akter,",
        `A marriage registration application (${app3.appNo}) has been submitted naming you as the bride.`,
        "Please sign in (or sign up with OneID eKYC if you are new), review the information and accept with your eSign.",
      ],
      { type: "esign", nid: "9123456789" },
    );
    dependencies.save();
  }

  async function seed(): Promise<void> {
    seedSync();
    for (const app of dependencies.S.apps) {
      if (app.status === "issued") {
        await dependencies.sealIssued(app);
      }
    }
    dependencies.save();
  }

  return { seedSync, seed };
}
