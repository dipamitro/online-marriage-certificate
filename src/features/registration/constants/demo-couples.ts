import type { AddressInfo, SpouseFormInfo } from "../types";

export interface DemoCouple {
  id: string;
  groom: SpouseFormInfo;
  bride: SpouseFormInfo;
}

function createAddress(
  houseBn: string,
  houseEn: string,
  roadBn: string,
  roadEn: string,
  dist: string,
  upz: string,
  po: string,
  uni: string,
  ward: string,
): AddressInfo {
  return {
    houseBn,
    houseEn,
    roadBn,
    roadEn,
    dist,
    upz,
    po,
    uni,
    ward,
  };
}

/**
 * Dedicated demo couples mapping for the "Fill with demo data" button.
 * Each groom and bride is paired 1-to-1 so no bride is shared across multiple grooms,
 * and logging in as either the groom or the bride fills both partners accurately.
 */
export const DEMO_COUPLES: readonly DemoCouple[] = [
  // Couple 1: Abdul Karim (Groom) & Farzana Akter (Bride)
  {
    id: "couple-1",
    groom: {
      nameBn: "আব্দুল করিম",
      nameEn: "Abdul Karim",
      fatherBn: "আব্দুর রশিদ",
      fatherEn: "Abdur Rashid",
      motherBn: "আমেনা খাতুন",
      motherEn: "Amena Khatun",
      dob: "1980-01-15",
      nid: "5555555555",
      marital: "অবিবাহিত",
      mobile: "01755555555",
      email: "abdul.karim@mail.com",
      addr: createAddress(
        "বাড়ি ১২, সেক্টর ৭, উত্তরা",
        "House 12, Sector 7, Uttara",
        "রোড নং - ০৭",
        "Road no - 07",
        "ঢাকা",
        "ঢাকা উত্তর সিটি কর্পোরেশন",
        "উত্তরা",
        "সিটি কর্পোরেশন এলাকা",
        "ওয়ার্ড নং - ০১",
      ),
    },
    bride: {
      nameBn: "ফারজানা আক্তার",
      nameEn: "Farzana Akter",
      fatherBn: "মাহবুব আলম",
      fatherEn: "Mahbub Alam",
      motherBn: "সালমা বেগম",
      motherEn: "Salma Begum",
      dob: "1995-04-18",
      nid: "7123456789",
      marital: "কুমারী",
      mobile: "01811000102",
      email: "farzana.akter@mail.com",
      addr: createAddress(
        "বাড়ি ১৮, বনানী",
        "House 18, Banani",
        "রোড ১১",
        "Road 11",
        "ঢাকা",
        "ঢাকা উত্তর সিটি কর্পোরেশন",
        "বনানী",
        "সিটি কর্পোরেশন এলাকা",
        "ওয়ার্ড নং - ১৯",
      ),
    },
  },

  // Couple 2: Arif Rahman (Groom) & Laboni Islam (Bride)
  {
    id: "couple-2",
    groom: {
      nameBn: "আরিফ রহমান",
      nameEn: "Arif Rahman",
      fatherBn: "লুৎফর রহমান",
      fatherEn: "Lutfur Rahman",
      motherBn: "নাজমা বেগম",
      motherEn: "Najma Begum",
      dob: "1992-11-02",
      nid: "7012345678",
      marital: "অবিবাহিত",
      mobile: "01711000101",
      email: "arif.rahman@mail.com",
      addr: createAddress(
        "বাড়ি ৩৪, গুলশান ২",
        "House 34, Gulshan 2",
        "রোড নং - ৪৫",
        "Road no - 45",
        "ঢাকা",
        "ঢাকা উত্তর সিটি কর্পোরেশন",
        "গুলশান",
        "সিটি কর্পোরেশন এলাকা",
        "ওয়ার্ড নং - ১৯",
      ),
    },
    bride: {
      nameBn: "লাবণী ইসলাম",
      nameEn: "Laboni Islam",
      fatherBn: "রফিকুল ইসলাম",
      fatherEn: "Rafiqul Islam",
      motherBn: "শিরিন আক্তার",
      motherEn: "Shirin Akter",
      dob: "1999-10-03",
      nid: "8123456789",
      marital: "কুমারী",
      mobile: "01811000104",
      email: "laboni.islam@mail.com",
      addr: createAddress(
        "ফ্ল্যাট ৪এ, বসুন্ধরা আবাসিক এলাকা",
        "Flat 4A, Bashundhara R/A",
        "ব্লক সি, রোড ৫",
        "Block C, Road 5",
        "ঢাকা",
        "ঢাকা উত্তর সিটি কর্পোরেশন",
        "ভাটারা",
        "সিটি কর্পোরেশন এলাকা",
        "ওয়ার্ড নং - ১৭",
      ),
    },
  },

  // Couple 3: Rakibul Hasan (Groom) & Mitu Akter (Bride)
  {
    id: "couple-3",
    groom: {
      nameBn: "রাকিবুল হাসান",
      nameEn: "Rakibul Hasan",
      fatherBn: "কামরুল হাসান",
      fatherEn: "Kamrul Hasan",
      motherBn: "ফরিদা ইয়াসমিন",
      motherEn: "Farida Yasmin",
      dob: "1995-02-14",
      nid: "9012345678",
      marital: "অবিবাহিত",
      mobile: "01711000105",
      email: "rakibul.hasan@mail.com",
      addr: createAddress(
        "বাড়ি ১৪, মিরপুর ১০",
        "House 14, Mirpur 10",
        "রোড নং - ০৩",
        "Road no - 03",
        "ঢাকা",
        "ঢাকা উত্তর সিটি কর্পোরেশন",
        "মিরপুর",
        "সিটি কর্পোরেশন এলাকা",
        "ওয়ার্ড নং - ০৩",
      ),
    },
    bride: {
      nameBn: "মিতু আক্তার",
      nameEn: "Mitu Akter",
      fatherBn: "আনোয়ার হোসেন",
      fatherEn: "Anwar Hossain",
      motherBn: "রাশিদা বেগম",
      motherEn: "Rashida Begum",
      dob: "1997-08-30",
      nid: "9123456789",
      marital: "কুমারী",
      mobile: "01811000106",
      email: "mitu.akter@mail.com",
      addr: createAddress(
        "বাড়ি ৯, মোহাম্মদপুর",
        "House 9, Mohammadpur",
        "তাজমহল রোড",
        "Tajmahal Road",
        "ঢাকা",
        "ঢাকা উত্তর সিটি কর্পোরেশন",
        "মোহাম্মদপুর",
        "সিটি কর্পোরেশন এলাকা",
        "ওয়ার্ড নং - ২৯",
      ),
    },
  },

  // Couple 4: Tanvir Hasan (Groom) & Nusrat Jahan (Bride)
  {
    id: "couple-4",
    groom: {
      nameBn: "তানভীর হাসান",
      nameEn: "Tanvir Hasan",
      fatherBn: "আব্দুল হাসান",
      fatherEn: "Abdul Hasan",
      motherBn: "রোকেয়া বেগম",
      motherEn: "Rokeya Begum",
      dob: "1994-03-12",
      nid: "1990123456",
      marital: "অবিবাহিত",
      mobile: "01712345601",
      email: "tanvir.hasan@mail.com",
      addr: createAddress(
        "বাড়ি ২২, উত্তর রাজাশন",
        "House 22, North Rajashon",
        "রাস্তা নং - ০৯",
        "Road no - 09",
        "ঢাকা",
        "সাভার",
        "সাভার",
        "সাভার পৌরসভা",
        "ওয়ার্ড নং - ০১",
      ),
    },
    bride: {
      nameBn: "নুসরাত জাহান",
      nameEn: "Nusrat Jahan",
      fatherBn: "মিজানুর রহমান",
      fatherEn: "Mizanur Rahman",
      motherBn: "শাহানা পারভীন",
      motherEn: "Shahana Parvin",
      dob: "1998-07-21",
      nid: "2001987654",
      marital: "কুমারী",
      mobile: "01812345602",
      email: "nusrat.jahan@mail.com",
      addr: createAddress(
        "ফ্ল্যাট ৫বি, ধানমন্ডি",
        "Flat 5B, Dhanmondi",
        "রোড ৭",
        "Road 7",
        "ঢাকা",
        "ঢাকা দক্ষিণ সিটি কর্পোরেশন",
        "নিউ মার্কেট",
        "সিটি কর্পোরেশন এলাকা",
        "ওয়ার্ড নং - ১৫",
      ),
    },
  },

  // Couple 5: Imran Hossain (Groom) & Ayesha Siddiqua (Bride)
  {
    id: "couple-5",
    groom: {
      nameBn: "ইমরান হোসেন",
      nameEn: "Imran Hossain",
      fatherBn: "মোশাররফ হোসেন",
      fatherEn: "Mosharraf Hossain",
      motherBn: "হালিমা খাতুন",
      motherEn: "Halima Khatun",
      dob: "1996-06-25",
      nid: "8012345678",
      marital: "অবিবাহিত",
      mobile: "01711000103",
      email: "imran.hossain@mail.com",
      addr: createAddress(
        "বাড়ি ৩১, সেক্টর ৪, উত্তরা",
        "House 31, Sector 4, Uttara",
        "রোড নং - ১২",
        "Road no - 12",
        "ঢাকা",
        "ঢাকা উত্তর সিটি কর্পোরেশন",
        "উত্তরা",
        "সিটি কর্পোরেশন এলাকা",
        "ওয়ার্ড নং - ০১",
      ),
    },
    bride: {
      nameBn: "আয়েশা সিদ্দিকা",
      nameEn: "Ayesha Siddiqua",
      fatherBn: "আবু বকর সিদ্দিক",
      fatherEn: "Abu Bakar Siddique",
      motherBn: "খাদিজা বেগম",
      motherEn: "Khadija Begum",
      dob: "2001-01-05",
      nid: "5678901234",
      marital: "কুমারী",
      mobile: "01812345603",
      email: "ayesha.siddiqua@mail.com",
      addr: createAddress(
        "বাড়ি ১৬, নিকেতন",
        "House 16, Niketan",
        "রোড নং - ০৪",
        "Road no - 04",
        "ঢাকা",
        "ঢাকা উত্তর সিটি কর্পোরেশন",
        "গুলশান",
        "সিটি কর্পোরেশন এলাকা",
        "ওয়ার্ড নং - ২০",
      ),
    },
  },
];

export interface LoggedInApplicantIdentity {
  nid: string;
  email: string;
  nameEn?: string;
  nameBn?: string;
  dob?: string;
  mobile?: string;
  gender?: string;
  preferredRole?: string;
}

export interface ResolvedDemoCoupleResult {
  applicantRole: "বর" | "কনে";
  groom: SpouseFormInfo;
  bride: SpouseFormInfo;
}

function cloneSpouse(spouse: SpouseFormInfo): SpouseFormInfo {
  return {
    ...spouse,
    addr: { ...spouse.addr },
  };
}

/**
 * Resolves the appropriate Groom, Bride, and Applicant Role (`"বর"` or `"কনে"`)
 * for the "Fill with demo data" button based on the logged-in user's email and NID.
 */
export function resolveDemoCoupleForUser(
  user: LoggedInApplicantIdentity | null,
): ResolvedDemoCoupleResult {
  const defaultCouple = DEMO_COUPLES[0]!;
  if (!user) {
    return {
      applicantRole: "বর",
      groom: cloneSpouse(defaultCouple.groom),
      bride: cloneSpouse(defaultCouple.bride),
    };
  }

  const normalizedEmail = (user.email || "").trim().toLowerCase();
  const normalizedNid = (user.nid || "").trim();

  // 1. Match by email first across all configured demo couples
  for (const couple of DEMO_COUPLES) {
    if (normalizedEmail && couple.groom.email.toLowerCase() === normalizedEmail) {
      const groom = cloneSpouse(couple.groom);
      if (normalizedNid) groom.nid = normalizedNid;
      return {
        applicantRole: "বর",
        groom,
        bride: cloneSpouse(couple.bride),
      };
    }
    if (normalizedEmail && couple.bride.email.toLowerCase() === normalizedEmail) {
      const bride = cloneSpouse(couple.bride);
      if (normalizedNid) bride.nid = normalizedNid;
      return {
        applicantRole: "কনে",
        groom: cloneSpouse(couple.groom),
        bride,
      };
    }
  }

  // 2. Match by NID if email was not matched
  for (const couple of DEMO_COUPLES) {
    if (normalizedNid && couple.groom.nid === normalizedNid) {
      return {
        applicantRole: "বর",
        groom: cloneSpouse(couple.groom),
        bride: cloneSpouse(couple.bride),
      };
    }
    if (normalizedNid && couple.bride.nid === normalizedNid) {
      return {
        applicantRole: "কনে",
        groom: cloneSpouse(couple.groom),
        bride: cloneSpouse(couple.bride),
      };
    }
  }

  // 3. Fallback for custom newly signed-up users:
  // Determine whether the logged-in user is the Bride or Groom, fill their side
  // with their own real data, and assign a deterministic partner from DEMO_COUPLES.
  const isBrideUser = user.preferredRole === "কনে" || (user.gender || "").toUpperCase() === "F";

  const hashSeed = (normalizedEmail || normalizedNid || "0")
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const assignedCouple = DEMO_COUPLES[hashSeed % DEMO_COUPLES.length] ?? defaultCouple;

  if (isBrideUser) {
    const customBride: SpouseFormInfo = {
      ...cloneSpouse(assignedCouple.bride),
      nameEn: user.nameEn || assignedCouple.bride.nameEn,
      nameBn: user.nameBn || user.nameEn || assignedCouple.bride.nameBn,
      nid: normalizedNid || assignedCouple.bride.nid,
      dob: user.dob || assignedCouple.bride.dob,
      email: normalizedEmail || assignedCouple.bride.email,
      mobile: user.mobile || assignedCouple.bride.mobile,
    };
    return {
      applicantRole: "কনে",
      groom: cloneSpouse(assignedCouple.groom),
      bride: customBride,
    };
  }

  const customGroom: SpouseFormInfo = {
    ...cloneSpouse(assignedCouple.groom),
    nameEn: user.nameEn || assignedCouple.groom.nameEn,
    nameBn: user.nameBn || user.nameEn || assignedCouple.groom.nameBn,
    nid: normalizedNid || assignedCouple.groom.nid,
    dob: user.dob || assignedCouple.groom.dob,
    email: normalizedEmail || assignedCouple.groom.email,
    mobile: user.mobile || assignedCouple.groom.mobile,
  };
  return {
    applicantRole: "বর",
    groom: customGroom,
    bride: cloneSpouse(assignedCouple.bride),
  };
}
