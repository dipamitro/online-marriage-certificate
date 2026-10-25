import type { AnyDeps, PersonRecord, RegistrarRecord } from "../types";

/** services/reference-directory. Dependencies: S. */
export function createServicesReferenceDirectory(dependencies: AnyDeps) {
  const BASE_PEOPLE: Record<string, PersonRecord> = {
    // OneID / NID server
    1990123456: { en: "Tanvir Hasan", bn: "তানভীর হাসান", g: "M", dob: "1994-03-12" },
    2001987654: { en: "Nusrat Jahan", bn: "নুসরাত জাহান", g: "F", dob: "1998-07-21" },
    9012345678: { en: "Rakibul Hasan", bn: "রাকিবুল হাসান", g: "M", dob: "1995-02-14" },
    9123456789: { en: "Mitu Akter", bn: "মিতু আক্তার", g: "F", dob: "1997-08-30" },
    8012345678: { en: "Imran Hossain", bn: "ইমরান হোসেন", g: "M", dob: "1996-06-25" },
    8123456789: { en: "Laboni Islam", bn: "লাবণী ইসলাম", g: "F", dob: "1999-10-03" },
    8223456789: { en: "Sadia Islam", bn: "সাদিয়া ইসলাম", g: "F", dob: "1998-11-14" },
    7012345678: { en: "Arif Rahman", bn: "আরিফ রহমান", g: "M", dob: "1992-11-02" },
    7123456789: { en: "Farzana Akter", bn: "ফারজানা আক্তার", g: "F", dob: "1995-04-18" },
    5678901234: { en: "Ayesha Siddiqua", bn: "আয়েশা সিদ্দিকা", g: "F", dob: "2010-01-05" },
    5555555555: { en: "Abdul Karim", bn: "আব্দুল করিম", g: "M", dob: "1980-01-15" },
    1985123401: { en: "Md. Abdur Rahim", bn: "মোঃ আব্দুর রহিম", g: "M", dob: "1985-03-14" },
    1988123402: { en: "Md. Nurul Amin", bn: "মোঃ নুরুল আমিন", g: "M", dob: "1988-07-22" },
    1984123404: { en: "Md. Zakir Hossain", bn: "মোঃ জাকির হোসেন", g: "M", dob: "1984-01-30" },
    1990123403: { en: "Md. Habibur Rahman", bn: "মোঃ হাবিবুর রহমান", g: "M", dob: "1990-11-02" },
    1992123405: { en: "Md. Mizanur Rahman", bn: "মোঃ মিজানুর রহমান", g: "M", dob: "1992-05-09" },
    6012345678: { en: "Md. Kamal Uddin", bn: "মোঃ কামাল উদ্দিন", g: "M", dob: "1975-06-14" },
    6111111111: { en: "Md. Shahidul Islam", bn: "মোঃ শহিদুল ইসলাম", g: "M", dob: "1972-04-02" },
    6222222222: { en: "Md. Golam Mostofa", bn: "মোঃ গোলাম মোস্তফা", g: "M", dob: "1969-09-19" },
    6333333333: { en: "Md. Abdul Kader", bn: "মোঃ আব্দুল কাদের", g: "M", dob: "1977-12-08" },
  };
  const PEOPLE: Record<string, PersonRecord> = { ...BASE_PEOPLE };
  const LOC: Record<string, Record<string, Record<string, Record<string, string[]>>>> = {};
  const REGISTRARS: Record<string, RegistrarRecord> = {};
  function rebuildFromEnl(): void {
    for (const k of Object.keys(PEOPLE)) delete PEOPLE[k];
    Object.assign(PEOPLE, BASE_PEOPLE);

    const EB = window.ENLBridge;
    if (EB) {
      for (const k of Object.keys(LOC)) delete LOC[k];
      Object.assign(LOC, EB.tree());
      for (const k of Object.keys(REGISTRARS)) delete REGISTRARS[k];
      EB.enlisted().forEach((r) => {
        REGISTRARS[r.licenceNo] = {
          nid: r.nid,
          dist: r.dist,
          upz: r.upz,
          uni: r.uni,
          wards: r.wards,
          office: r.office,
          email: r.email,
          mobile: r.mobile,
          mobile2: r.mobile,
          status: r.status,
        };
        if (!PEOPLE[r.nid]) PEOPLE[r.nid] = { en: r.nameEn, bn: r.nameBn, g: "M", dob: r.dob };
      });
    }

    // Hydrate custom signed-up users from persisted localStorage state
    const users = dependencies.S?.users;
    if (users && typeof users === "object") {
      for (const [nid, u] of Object.entries(users)) {
        const userRec = u as Record<string, unknown>;
        const nameEn =
          typeof userRec["name"] === "string" && userRec["name"].trim()
            ? userRec["name"].trim()
            : PEOPLE[nid]?.en;
        const nameBn =
          typeof userRec["nameBn"] === "string" && userRec["nameBn"].trim()
            ? userRec["nameBn"].trim()
            : PEOPLE[nid]?.bn || nameEn;
        const dob =
          typeof userRec["dob"] === "string" && userRec["dob"].trim()
            ? userRec["dob"].trim()
            : PEOPLE[nid]?.dob;
        const g =
          typeof userRec["gender"] === "string" && userRec["gender"].trim()
            ? userRec["gender"].trim()
            : PEOPLE[nid]?.g || "M";
        if (nameEn) {
          PEOPLE[nid] = {
            en: nameEn,
            bn: nameBn || nameEn,
            g,
            dob: dob || "1995-01-01",
          };
        }
      }
    }
  }
  const regName = (l: string): string => PEOPLE[REGISTRARS[l]?.nid ?? ""]?.en ?? l,
    regNameBn = (l: string): string => PEOPLE[REGISTRARS[l]?.nid ?? ""]?.bn ?? l;
  const DIST: Record<string, string[]> = {
    ঢাকা: [
      "ঢাকা উত্তর সিটি কর্পোরেশন",
      "ঢাকা দক্ষিণ সিটি কর্পোরেশন",
      "সাভার",
      "ধামরাই",
      "কেরানীগঞ্জ",
    ],
    গাজীপুর: ["গাজীপুর সিটি কর্পোরেশন", "কালিয়াকৈর", "শ্রীপুর"],
    নরসিংদী: ["নরসিংদী সদর", "পলাশ"],
    মানিকগঞ্জ: ["মানিকগঞ্জ সদর", "সিংগাইর"],
    মাদারীপুর: ["মাদারীপুর সদর", "শিবচর"],
    শরীয়তপুর: ["শরীয়তপুর সদর", "জাজিরা"],
    চট্টগ্রাম: ["চট্টগ্রাম সিটি কর্পোরেশন", "হাটহাজারী"],
    সিলেট: ["সিলেট সিটি কর্পোরেশন", "শাহজালাল উপশহর"],
  };
  const ACCOUNTS: unknown[] = []; /* replaced by sign-up accounts (S.users) */
  const accOf = (nid: string) => {
    const u = (dependencies.S.users || {})[nid] || {},
      P = PEOPLE[nid] || { en: u.name || "Unknown" };
    return {
      id: nid,
      name: u.name || P.en,
      email:
        u.email ||
        (u.name || P.en)
          .toLowerCase()
          .replace(/[^a-z]+/g, ".")
          .replace(/^\.|\.$/g, "") + "@mail.com",
      role: u.role || "Applicant",
    };
  };
  const userOf = (nid: string) => (dependencies.S.users || {})[nid] || null;
  const licOf = (nid: string): string | undefined =>
    Object.keys(REGISTRARS).find(
      (l) => REGISTRARS[l]?.nid === nid && REGISTRARS[l]?.status === "ENLISTED",
    );
  const ESIGN_PEOPLE = [
    "1990123456",
    "2001987654",
    "9012345678",
    "9123456789",
    "8012345678",
    "8123456789",
    "7012345678",
    "7123456789",
  ];
  return {
    PEOPLE,
    LOC,
    REGISTRARS,
    rebuildFromEnl,
    regName,
    regNameBn,
    DIST,
    ACCOUNTS,
    accOf,
    userOf,
    licOf,
    ESIGN_PEOPLE,
  };
}
