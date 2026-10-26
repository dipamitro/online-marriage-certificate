export const PEOPLE: Record<
  string,
  { en: string; bn: string; dob: string; g: string; father?: string; mother?: string }
> = {
  "1985123401": {
    en: "Md. Abdur Rahim",
    bn: "মোঃ আব্দুর রহিম",
    dob: "1985-03-14",
    g: "M",
    father: "Md. Abdul Karim",
    mother: "Rahima Khatun",
  },
  "1988123402": {
    en: "Md. Nurul Amin",
    bn: "মোঃ নুরুল আমিন",
    dob: "1988-07-22",
    g: "M",
    father: "Md. Shafiqul Amin",
    mother: "Nurjahan Begum",
  },
  "1990123403": {
    en: "Md. Habibur Rahman",
    bn: "মোঃ হাবিবুর রহমান",
    dob: "1990-11-02",
    g: "M",
    father: "Md. Lutfur Rahman",
    mother: "Hosne Ara",
  },
  "1984123404": {
    en: "Md. Zakir Hossain",
    bn: "মোঃ জাকির হোসেন",
    dob: "1984-01-30",
    g: "M",
    father: "Md. Idris Ali",
    mother: "Saleha Begum",
  },
  "1992123405": {
    en: "Md. Mizanur Rahman",
    bn: "মোঃ মিজানুর রহমান",
    dob: "1992-05-09",
    g: "M",
    father: "Md. Ataur Rahman",
    mother: "Rokeya Begum",
  },
  "1979000001": { en: "Md. Rafiqul Islam", bn: "মোঃ রফিকুল ইসলাম", dob: "1979-06-01", g: "M" },
  "1986000002": { en: "Farhana Akter", bn: "ফারহানা আক্তার", dob: "1986-09-12", g: "F" },
};

export const SIGNUP_DEMOS = ["1990123403", "1992123405"];

export const ST: Record<string, [string, string]> = {
  DRAFT: ["Draft", "c-dr"],
  SUBMITTED: ["Awaiting review and approval", "c-sub"],
  RETURNED: ["Returned for correction", "c-ret"],
  FORWARDED: ["Awaiting Super Admin approval", "c-fwd"],
  ENLISTED: ["Enlisted", "c-ok"],
  REJECTED: ["Rejected", "c-rej"],
  SUSPENDED: ["Suspended", "c-sus"],
  CANCELLED: ["Cancelled", "c-rej"],
};

export const DOCS: Array<[string, string]> = [
  ["photo", "Passport-size photograph"],
  ["degree", "Kamil / Fazil (or equivalent) certificate"],
  ["character", "Character certificate (UP Chairman / Councillor)"],
  ["residence", "Proof of residence in the requested area"],
];
