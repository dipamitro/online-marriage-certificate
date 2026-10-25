import type {
  AddressInfo,
  AnyDeps,
  ApplicationForm,
  ApplicationRecord,
  PersonFormInfo,
  SpouseFormInfo,
} from "../types";

export interface DemoCoupleDefinition {
  id: string;
  groom: SpouseFormInfo;
  bride: SpouseFormInfo;
}

export interface DemoFormUserContext {
  nid?: string | null;
  email?: string | null;
  nameEn?: string | null;
  nameBn?: string | null;
  dob?: string | null;
  mobile?: string | null;
  gender?: string | null;
  preferredRole?: string | null;
  existingApps?: ApplicationRecord[];
}

const createAddress = (
  houseBn: string,
  houseEn: string,
  roadBn: string,
  roadEn: string,
  dist: string,
  upz: string,
  po: string,
  uni: string,
  ward: string,
): AddressInfo => ({
  houseBn,
  houseEn,
  roadBn,
  roadEn,
  dist,
  upz,
  po,
  uni,
  ward,
});

const createPerson = (
  nameBn: string,
  nameEn: string,
  fatherBn: string,
  fatherEn: string,
  motherBn: string,
  motherEn: string,
  addr: AddressInfo,
): PersonFormInfo => ({
  nameBn,
  nameEn,
  fatherBn,
  fatherEn,
  motherBn,
  motherEn,
  addr,
});

const SAVAR_HOME_ADDRESS = createAddress(
  "বাড়ি ২২, উত্তর রাজাশন",
  "House 22, North Rajashon",
  "রাস্তা নং - ০৯",
  "Road no - 09",
  "ঢাকা",
  "সাভার",
  "সাভার",
  "সাভার পৌরসভা",
  "ওয়ার্ড নং - ০১",
);

const DHANMONDI_ADDRESS = createAddress(
  "ফ্ল্যাট ৫বি, ধানমন্ডি",
  "Flat 5B, Dhanmondi",
  "রোড ৭",
  "Road 7",
  "ঢাকা",
  "ঢাকা দক্ষিণ সিটি কর্পোরেশন",
  "নিউ মার্কেট",
  "সিটি কর্পোরেশন এলাকা",
  "ওয়ার্ড নং - ১৫",
);

const UTTARA_ADDRESS = createAddress(
  "বাড়ি ১৪, সেক্টর ৭",
  "House 14, Sector 7",
  "রোড ১২",
  "Road 12",
  "ঢাকা",
  "ঢাকা উত্তর সিটি কর্পোরেশন",
  "উত্তরা",
  "সিটি কর্পোরেশন এলাকা",
  "ওয়ার্ড নং - ০১",
);

const BANANI_ADDRESS = createAddress(
  "ফ্ল্যাট ৩এ, বনানী",
  "Flat 3A, Banani",
  "রোড ১১",
  "Road 11",
  "ঢাকা",
  "ঢাকা উত্তর সিটি কর্পোরেশন",
  "বনানী",
  "সিটি কর্পোরেশন এলাকা",
  "ওয়ার্ড নং - ১৯",
);

/**
 * Reusable, 1-to-1 Demo Couples Registry.
 * Each couple pairs a distinct Groom and Bride so the same bride is never assigned
 * to multiple grooms and vice versa.
 *
 * - Couple 1: Abdul Karim (`abdul.karim@mail.com`) & Farzana Akter (`farzana.akter@mail.com`)
 * - Couple 2: Arif Rahman (`arif.rahman@mail.com`) & Laboni Islam (`laboni.islam@mail.com`)
 * - Couple 3: Rakibul Hasan (`rakibul.hasan@mail.com`) & Mitu Akter (`mitu.akter@mail.com`)
 * - Couple 4: Imran Hossain (`imran.hossain@mail.com`) & Sadia Islam (`sadia.islam@mail.com`)
 * - Couple 5: Tanvir Hasan (`tanvir.hasan@mail.com`) & Nusrat Jahan (`nusrat.jahan@mail.com`)
 */
export const DEMO_COUPLES: DemoCoupleDefinition[] = [
  {
    id: "couple-1",
    groom: {
      ...createPerson(
        "আব্দুল করিম",
        "Abdul Karim",
        "আব্দুল লতিফ",
        "Abdul Latif",
        "আমেনা বেগম",
        "Amena Begum",
        SAVAR_HOME_ADDRESS,
      ),
      dob: "1980-01-15",
      nid: "5555555555",
      marital: "অবিবাহিত",
      mobile: "01755555555",
      email: "abdul.karim@mail.com",
    },
    bride: {
      ...createPerson(
        "ফারজানা আক্তার",
        "Farzana Akter",
        "ফজলুল হক",
        "Fazlul Haque",
        "সালমা বেগম",
        "Salma Begum",
        DHANMONDI_ADDRESS,
      ),
      dob: "1995-04-18",
      nid: "7123456789",
      marital: "কুমারী",
      mobile: "01811000102",
      email: "farzana.akter@mail.com",
    },
  },
  {
    id: "couple-2",
    groom: {
      ...createPerson(
        "আরিফ রহমান",
        "Arif Rahman",
        "মাহবুবুর রহমান",
        "Mahbubur Rahman",
        "নাজমা বেগম",
        "Najma Begum",
        UTTARA_ADDRESS,
      ),
      dob: "1992-11-02",
      nid: "7012345678",
      marital: "অবিবাহিত",
      mobile: "01711000101",
      email: "arif.rahman@mail.com",
    },
    bride: {
      ...createPerson(
        "লাবণী ইসলাম",
        "Laboni Islam",
        "রফিকুল ইসলাম",
        "Rafiqul Islam",
        "রাশিদা বেগম",
        "Rashida Begum",
        BANANI_ADDRESS,
      ),
      dob: "1999-10-03",
      nid: "8223456789",
      marital: "কুমারী",
      mobile: "01811000104",
      email: "laboni.islam@mail.com",
    },
  },
  {
    id: "couple-3",
    groom: {
      ...createPerson(
        "রাকিবুল হাসান",
        "Rakibul Hasan",
        "কামরুল হাসান",
        "Kamrul Hasan",
        "হাসিনা বেগম",
        "Hasina Begum",
        SAVAR_HOME_ADDRESS,
      ),
      dob: "1995-02-14",
      nid: "9012345678",
      marital: "অবিবাহিত",
      mobile: "01711000105",
      email: "rakibul.hasan@mail.com",
    },
    bride: {
      ...createPerson(
        "মিতু আক্তার",
        "Mitu Akter",
        "আনোয়ার হোসেন",
        "Anwar Hossain",
        "মর্জিনা বেগম",
        "Morjina Begum",
        DHANMONDI_ADDRESS,
      ),
      dob: "1997-08-30",
      nid: "9123456789",
      marital: "কুমারী",
      mobile: "01811000106",
      email: "mitu.akter@mail.com",
    },
  },
  {
    id: "couple-4",
    groom: {
      ...createPerson(
        "ইমরান হোসেন",
        "Imran Hossain",
        "মোয়াজ্জেম হোসেন",
        "Moazzem Hossain",
        "ফাতেমা খাতুন",
        "Fatema Khatun",
        UTTARA_ADDRESS,
      ),
      dob: "1996-06-25",
      nid: "8012345678",
      marital: "অবিবাহিত",
      mobile: "01711000103",
      email: "imran.hossain@mail.com",
    },
    bride: {
      ...createPerson(
        "সাদিয়া ইসলাম",
        "Sadia Islam",
        "সিরাজুল ইসলাম",
        "Sirajul Islam",
        "রওশন আরা",
        "Rowshan Ara",
        BANANI_ADDRESS,
      ),
      dob: "1999-10-03",
      nid: "8123456789",
      marital: "কুমারী",
      mobile: "01811000104",
      email: "sadia.islam@mail.com",
    },
  },
  {
    id: "couple-5",
    groom: {
      ...createPerson(
        "তানভীর হাসান",
        "Tanvir Hasan",
        "আব্দুল হাসান",
        "Abdul Hasan",
        "রোকেয়া বেগম",
        "Rokeya Begum",
        SAVAR_HOME_ADDRESS,
      ),
      dob: "1994-03-12",
      nid: "1990123456",
      marital: "অবিবাহিত",
      mobile: "01712345601",
      email: "tanvir.hasan@mail.com",
    },
    bride: {
      ...createPerson(
        "নুসরাত জাহান",
        "Nusrat Jahan",
        "মিজানুর রহমান",
        "Mizanur Rahman",
        "শাহানা পারভীন",
        "Shahana Parvin",
        DHANMONDI_ADDRESS,
      ),
      dob: "1998-07-21",
      nid: "2001987654",
      marital: "কুমারী",
      mobile: "01812345602",
      email: "nusrat.jahan@mail.com",
    },
  },
];

function cloneSpouse(spouse: SpouseFormInfo): SpouseFormInfo {
  return {
    ...spouse,
    addr: { ...spouse.addr },
  };
}

/**
 * Resolves the appropriate Groom, Bride, and Applicant Role (`"বর"` or `"কনে"`)
 * for a given logged-in user so that:
 * 1. If the logged-in user matches a Groom in `DEMO_COUPLES` (by email or NID),
 *    he is filled as Groom and his assigned partner is filled as Bride.
 * 2. If the logged-in user matches a Bride in `DEMO_COUPLES` (by email or NID),
 *    she is filled as Bride and her assigned partner is filled as Groom.
 * 3. If a custom signed-up user is not in `DEMO_COUPLES`, their role (Groom vs. Bride)
 *    is respected and they are paired with an unassigned partner so no two users share a partner.
 */
export function resolveDemoCoupleForUser(context?: DemoFormUserContext): {
  groom: SpouseFormInfo;
  bride: SpouseFormInfo;
  applicantRole: "বর" | "কনে";
} {
  const defaultCouple = DEMO_COUPLES[0]!;
  if (!context || (!context.email && !context.nid)) {
    return {
      groom: cloneSpouse(defaultCouple.groom),
      bride: cloneSpouse(defaultCouple.bride),
      applicantRole: "বর",
    };
  }

  const normalizedEmail = (context.email || "").trim().toLowerCase();
  const normalizedNid = (context.nid || "").trim();

  // 1. Check if the logged-in user's email matches a Groom or Bride in DEMO_COUPLES
  if (normalizedEmail) {
    for (const couple of DEMO_COUPLES) {
      if (couple.groom.email.toLowerCase() === normalizedEmail) {
        const groom = cloneSpouse(couple.groom);
        if (normalizedNid) groom.nid = normalizedNid;
        if (context.nameEn) groom.nameEn = context.nameEn;
        if (context.nameBn) groom.nameBn = context.nameBn;
        if (context.dob) groom.dob = context.dob;
        if (context.mobile) groom.mobile = context.mobile;
        return {
          groom,
          bride: cloneSpouse(couple.bride),
          applicantRole: "বর",
        };
      }
      if (couple.bride.email.toLowerCase() === normalizedEmail) {
        const bride = cloneSpouse(couple.bride);
        if (normalizedNid) bride.nid = normalizedNid;
        if (context.nameEn) bride.nameEn = context.nameEn;
        if (context.nameBn) bride.nameBn = context.nameBn;
        if (context.dob) bride.dob = context.dob;
        if (context.mobile) bride.mobile = context.mobile;
        return {
          groom: cloneSpouse(couple.groom),
          bride,
          applicantRole: "কনে",
        };
      }
    }
  }

  // 2. Check if the logged-in user's NID matches a Groom or Bride in DEMO_COUPLES
  if (normalizedNid) {
    for (const couple of DEMO_COUPLES) {
      if (couple.groom.nid === normalizedNid) {
        const groom = cloneSpouse(couple.groom);
        if (normalizedEmail) groom.email = normalizedEmail;
        if (context.nameEn) groom.nameEn = context.nameEn;
        if (context.nameBn) groom.nameBn = context.nameBn;
        if (context.dob) groom.dob = context.dob;
        if (context.mobile) groom.mobile = context.mobile;
        return {
          groom,
          bride: cloneSpouse(couple.bride),
          applicantRole: "বর",
        };
      }
      if (couple.bride.nid === normalizedNid) {
        const bride = cloneSpouse(couple.bride);
        if (normalizedEmail) bride.email = normalizedEmail;
        if (context.nameEn) bride.nameEn = context.nameEn;
        if (context.nameBn) bride.nameBn = context.nameBn;
        if (context.dob) bride.dob = context.dob;
        if (context.mobile) bride.mobile = context.mobile;
        return {
          groom: cloneSpouse(couple.groom),
          bride,
          applicantRole: "কনে",
        };
      }
    }
  }

  // 3. Fallback for custom signed-up users: determine whether they are Groom or Bride
  //    and assign an unused partner from DEMO_COUPLES (or a unique partner)
  const isBrideLogin =
    context.preferredRole === "কনে" ||
    (context.preferredRole !== "বর" && String(context.gender || "").toUpperCase() === "F");

  const usedEmails = new Set<string>();
  const usedNids = new Set<string>();
  for (const app of context.existingApps || []) {
    if (app.f?.groom?.email) usedEmails.add(app.f.groom.email.toLowerCase());
    if (app.f?.bride?.email) usedEmails.add(app.f.bride.email.toLowerCase());
    if (app.f?.groom?.nid) usedNids.add(app.f.groom.nid);
    if (app.f?.bride?.nid) usedNids.add(app.f.bride.nid);
  }

  const availableCouple =
    DEMO_COUPLES.find((couple) =>
      isBrideLogin
        ? !usedEmails.has(couple.groom.email.toLowerCase()) && !usedNids.has(couple.groom.nid)
        : !usedEmails.has(couple.bride.email.toLowerCase()) && !usedNids.has(couple.bride.nid),
    ) ?? defaultCouple;

  if (isBrideLogin) {
    const bride: SpouseFormInfo = {
      ...cloneSpouse(availableCouple.bride),
      nameEn: context.nameEn || availableCouple.bride.nameEn,
      nameBn: context.nameBn || context.nameEn || availableCouple.bride.nameBn,
      nid: normalizedNid || availableCouple.bride.nid,
      dob: context.dob || availableCouple.bride.dob,
      email: normalizedEmail || availableCouple.bride.email,
      mobile: context.mobile || availableCouple.bride.mobile,
    };
    return {
      groom: cloneSpouse(availableCouple.groom),
      bride,
      applicantRole: "কনে",
    };
  }

  const groom: SpouseFormInfo = {
    ...cloneSpouse(availableCouple.groom),
    nameEn: context.nameEn || availableCouple.groom.nameEn,
    nameBn: context.nameBn || context.nameEn || availableCouple.groom.nameBn,
    nid: normalizedNid || availableCouple.groom.nid,
    dob: context.dob || availableCouple.groom.dob,
    email: normalizedEmail || availableCouple.groom.email,
    mobile: context.mobile || availableCouple.groom.mobile,
  };
  return {
    groom,
    bride: cloneSpouse(availableCouple.bride),
    applicantRole: "বর",
  };
}

/** services/forms. Dependencies: C17OPTS, addDays, today. */
export function createServicesForms(dependencies: AnyDeps) {
  const addr = (): AddressInfo => ({
    houseBn: "",
    houseEn: "",
    roadBn: "",
    roadEn: "",
    dist: "",
    upz: "",
    po: "",
    uni: "",
    ward: "",
  });
  const person0 = (): PersonFormInfo => ({
    nameBn: "",
    nameEn: "",
    fatherBn: "",
    fatherEn: "",
    motherBn: "",
    motherEn: "",
    addr: addr(),
  });
  const personF = (): SpouseFormInfo => ({
    ...person0(),
    dob: "",
    nid: "",
    marital: "",
    mobile: "",
    email: "",
  });
  const blankForm = (): ApplicationForm => ({
    type: "muslim",
    loc: { div: "", dist: "", upz: "", uni: "", ward: "" },
    registrar: "",
    applicantRole: "",
    groom: personF(),
    bride: personF(),
    ukil: { appointed: "no", side: "bride", person: person0(), w1: person0(), w2: person0() },
    wit: { w1: person0(), w2: person0() },
    off: person0(),
    m: {
      settle: "",
      mohor: "",
      prompt: "",
      paid: "",
      c16: "no",
      c16d: "",
      c17: "no",
      c17o: [],
      c17d: "",
      c18: "no",
      c18d: "",
      c19: "no",
      c19d: "",
      c20: "no",
      c20d: "",
      c21: "no",
      permNo: "",
      permDate: "",
      regDate: dependencies.today(),
      regTime: "12:00",
      pay: "offline",
      contact: "",
    },
  });

  function demoForm(userContext?: DemoFormUserContext): ApplicationForm {
    const isDemofill = Boolean(userContext && (userContext.email || userContext.nid));
    const resolvedCouple = isDemofill ? resolveDemoCoupleForUser(userContext) : null;
    const form = blankForm();

    form.loc = {
      div: "ঢাকা",
      dist: "ঢাকা",
      upz: "সাভার",
      uni: "সাভার পৌরসভা",
      ward: "ওয়ার্ড ০১",
    };
    form.registrar = "NR-DHK-0377";
    form.applicantRole = resolvedCouple ? resolvedCouple.applicantRole : "";
    form.groom = resolvedCouple
      ? resolvedCouple.groom
      : {
          ...createPerson(
            "তানভীর হাসান",
            "Tanvir Hasan",
            "আব্দুল হাসান",
            "Abdul Hasan",
            "রোকেয়া বেগম",
            "Rokeya Begum",
            SAVAR_HOME_ADDRESS,
          ),
          dob: "1994-03-12",
          nid: "1990123456",
          marital: "অবিবাহিত",
          mobile: "01712345601",
          email: "tanvir.hasan@mail.com",
        };
    form.bride = resolvedCouple
      ? resolvedCouple.bride
      : {
          ...createPerson(
            "নুসরাত জাহান",
            "Nusrat Jahan",
            "মিজানুর রহমান",
            "Mizanur Rahman",
            "শাহানা পারভীন",
            "Shahana Parvin",
            DHANMONDI_ADDRESS,
          ),
          dob: "1998-07-21",
          nid: "2001987654",
          marital: "কুমারী",
          mobile: "01812345602",
          email: "nusrat.jahan@mail.com",
        };

    form.ukil = {
      appointed: "yes",
      side: "bride",
      person: createPerson(
        "আব্দুল মালেক",
        "Abdul Malek",
        "আব্দুল কাদের",
        "Abdul Kader",
        "জাহানারা বেগম",
        "Jahanara Begum",
        createAddress(
          "বাড়ি ৪, কলাবাগান",
          "House 4, Kalabagan",
          "লেক সার্কাস",
          "Lake Circus",
          "ঢাকা",
          "ঢাকা দক্ষিণ সিটি কর্পোরেশন",
          "কলাবাগান",
          "সিটি কর্পোরেশন এলাকা",
          "ওয়ার্ড নং - ১৬",
        ),
      ),
      w1: createPerson(
        "সাজিদ হোসেন",
        "Sajid Hossain",
        "শাহিদ হোসেন",
        "Shahid Hossain",
        "নাসরিন আক্তার",
        "Nasrin Akter",
        createAddress(
          "বাড়ি ৪",
          "House 4",
          "রোড ০৩, মহাখালী ডিওএইচএস",
          "Road 03, Mohakhali DOHS",
          "ঢাকা",
          "ঢাকা উত্তর সিটি কর্পোরেশন",
          "মহাখালী",
          "সিটি কর্পোরেশন এলাকা",
          "ওয়ার্ড নং - ২০",
        ),
      ),
      w2: createPerson(
        "মোশারফ হাশেম",
        "Mosharaf Hashem",
        "সোলেমান হাশেম",
        "Soleman Hashem",
        "রাবেয়া খাতুন",
        "Rabeya Khatun",
        createAddress(
          "বাড়ি ০৯",
          "House 09",
          "রোড ০৫, মিরপুর ১২",
          "Road 05, Mirpur 12",
          "ঢাকা",
          "ঢাকা উত্তর সিটি কর্পোরেশন",
          "পল্লবী",
          "সিটি কর্পোরেশন এলাকা",
          "ওয়ার্ড নং - ০৬",
        ),
      ),
    };

    form.wit = {
      w1: createPerson(
        "রফিক আহমেদ",
        "Rafiq Ahmed",
        "জালাল আহমেদ",
        "Jalal Ahmed",
        "মোমেনা খাতুন",
        "Momena Khatun",
        createAddress(
          "সেকশন ৬",
          "Section 6",
          "মিরপুর",
          "Mirpur",
          "ঢাকা",
          "ঢাকা উত্তর সিটি কর্পোরেশন",
          "মিরপুর",
          "সিটি কর্পোরেশন এলাকা",
          "ওয়ার্ড নং - ০৭",
        ),
      ),
      w2: createPerson(
        "সিদ্দিক হোসেন",
        "Siddik Hossain",
        "আলম হোসেন",
        "Alam Hossain",
        "হাসিনা বেগম",
        "Hasina Begum",
        createAddress(
          "অ্যাপার্টমেন্ট ৭এ",
          "Apartment 7A",
          "রোড টাওয়ার, শাহজালাল উপশহর",
          "Road Tower, Shahjalal Uposhohor",
          "সিলেট",
          "শাহজালাল উপশহর",
          "শাহজালাল উপশহর",
          "শাহজালাল উপশহর",
          "ওয়ার্ড নং - ২৩",
        ),
      ),
    };

    form.off = createPerson(
      "মাওলানা আকরাম আলী",
      "Maulana Akram Ali",
      "আব্দুর রহমান",
      "Abdur Rahman",
      "হেনা বেগম",
      "Hena Begum",
      SAVAR_HOME_ADDRESS,
    );

    form.m = {
      settle: dependencies.addDays(dependencies.today(), -20),
      mohor: "500000",
      prompt: "আশু ২,০০,০০০ টাকা এবং বিলম্বিত ৩,০০,০০০ টাকা",
      paid: "হ্যাঁ, ১,০০,০০০ টাকা পরিশোধ করা হইয়াছে",
      c16: "no",
      c16d: "",
      c17: "yes",
      c17o: [dependencies.C17OPTS[1]],
      c17d: "স্বামী ভরণ-পোষণ দিতে ব্যর্থ হলে স্ত্রী আদালতের শরণাপন্ন হতে পারবেন।",
      c18: "no",
      c18d: "",
      c19: "no",
      c19d: "",
      c20: "no",
      c20d: "",
      c21: "no",
      permNo: "",
      permDate: "",
      regDate: dependencies.today(),
      regTime: "12:00",
      pay: "online",
      contact: resolvedCouple
        ? resolvedCouple.applicantRole === "কনে"
          ? resolvedCouple.bride.mobile
          : resolvedCouple.groom.mobile
        : "01712587667",
    };

    return form;
  }

  return {
    DEMO_COUPLES,
    resolveDemoCoupleForUser,
    addr,
    person0,
    personF,
    blankForm,
    demoForm,
  };
}
