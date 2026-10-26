import type { SpouseFormInfo, ApplicationForm } from "@/features/registration/types";

export interface DemoCouple {
  groom: {
    email: string;
    nameEn: string;
    nameBn: string;
    nid: string;
    mobile: string;
    dob: string;
    fatherBn: string;
    motherBn: string;
  };
  bride: {
    email: string;
    nameEn: string;
    nameBn: string;
    nid: string;
    mobile: string;
    dob: string;
    fatherBn: string;
    motherBn: string;
  };
}

export type { SpouseFormInfo, ApplicationForm };
