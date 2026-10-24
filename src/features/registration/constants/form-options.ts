import type { AnyDeps } from "../types";

/** constants/form-options. Dependencies: IC. */
export function createConstantsFormOptions(dependencies: AnyDeps) {
  const REG_TYPES: Array<[string, string]> = [
    [
      "muslim",
      "১। মুসলিম বিবাহ ও তালাক (নিবন্ধন) বিধিমালা ২০০৯ এর বিধি ২৮ (১) (ক) অনুযায়ী বিবাহ নিবন্ধন",
    ],
    ["hindu", "২। হিন্দু বিবাহ নিবন্ধন বিধিমালা ২০১৩ এর বিধি ২২(১) (ক) অনুযায়ী বিবাহ নিবন্ধন"],
    ["special", "৩। বিশেষ বিবাহ আইন ১৮৭২ অনুযায়ী বিবাহ নিবন্ধন"],
  ];
  const MARITAL_G = ["অবিবাহিত", "বিবাহিত", "বিপত্নীক", "তালাকপ্রাপ্ত"];
  const MARITAL_B = ["কুমারী", "বিধবা", "তালাকপ্রাপ্তা"];
  const C17OPTS = [
    "স্বামী স্ত্রীকে তালাক প্রদানের ক্ষমতা অর্পণ করিয়াছে কি না",
    "স্বামী যদি তার স্ত্রী প্রয়োজনীয় ভরন-পোষণ দিতে না পারে",
    "স্বামী স্ত্রীর মধ্যে পরস্পর সমঝোতা না থাকলে",
    "অন্যান্য",
  ];
  const TABS = [
    "বিবাহের ধরন ও স্থান",
    "বরের তথ্য",
    "কনের তথ্য",
    "উকিলের তথ্য",
    "বিবাহের সাক্ষীদের তথ্য",
    "বিবাহ পড়ানো ব্যক্তির তথ্য",
    "বিবাহ সংক্রান্ত তথ্য",
  ];
  const STEPS: Array<[string, string, string]> = [
    ["Online Application", "Applicant submits", dependencies.IC.globe],
    ["Groom eSign", "eKYC done at sign-up", dependencies.IC.tab],
    ["Bride eSign", "eKYC done at sign-up", dependencies.IC.tab],
    ["Registrar Approval with eSign", "Review, then approve or revert", dependencies.IC.pen],
    ["Sent to OneID Vault", "Automatic on approval", dependencies.IC.wallet],
  ];
  return { REG_TYPES, MARITAL_G, MARITAL_B, C17OPTS, TABS, STEPS };
}
