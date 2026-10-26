import type { ENLBridgeContract } from "../registration/types";

export interface JurNode {
  id: string;
  name: string;
  level: number;
  parent: string | null;
  kids: string[];
  code?: string;
}

export interface EnlUser {
  id: string;
  role: string;
  nid: string;
  name: string;
  nameBn?: string;
  dob?: string;
  designation?: string;
  email: string;
  mobile: string;
  active: boolean;
  ekycAt?: string;
  ekycMethod?: unknown;
}

export interface EnlHistoryItem {
  at: string;
  by: string;
  text: string;
}

export interface EnlApplication {
  id: string | null;
  appNo: string;
  userId: string;
  status: string;
  createdAt: string;
  submittedAt?: string;
  approverTitle?: string;
  licenceNo?: string;
  approvedAt?: string;
  approvedBy?: string;
  validTo?: string;
  seal?: string;
  returnNote?: string;
  rejectNote?: string;
  p: {
    nameBn: string;
    nameEn: string;
    father: string;
    mother: string;
    dob: string;
    nid: string;
    gender: string;
  };
  c: {
    mobile: string;
    email: string;
    address: string;
  };
  q: {
    degree: string;
    institution: string;
    year: string;
    result: string;
  };
  j: {
    div: string;
    dist: string;
    upz: string;
    uni: string;
    wards: string[];
  };
  o: {
    name: string;
    address: string;
    phone: string;
  };
  docs: Record<string, string>;
  declare: boolean;
  history: EnlHistoryItem[];
}

export interface EnlAuditItem {
  at: string;
  by: string;
  text: string;
  appId: string | null;
}

export interface EnlEmailItem {
  id: string;
  to: string;
  toName: string;
  subject: string;
  body: string[];
  at: string;
  read: boolean;
}

export interface EnlExtraWard {
  id: string;
  name: string;
  parent: string;
}

export interface EnlState {
  users: EnlUser[];
  apps: EnlApplication[];
  audit: EnlAuditItem[];
  emails?: EnlEmailItem[];
  extraWards?: EnlExtraWard[];
  seq: {
    app: number;
    lic: Record<string, number>;
  };
  settings: {
    minAge: number;
    maxAge: number;
    reqDocs: string[];
    multiPerWard: boolean;
  };
}

export interface EnlUIState {
  role: string;
  auth: Record<string, string | boolean | null>;
  page: Record<string, string>;
  open: string | null;
  draft: EnlApplication | null;
  dirNode: string | null;
  dirOpen: Record<string, boolean>;
  dirQ: string;
  dirSt: string;
  inboxSel: string | null;
  sb: boolean;
  errs?: string[] | null;
  onb?: Record<string, unknown> | null;
  login: Record<string, string>;
}

export type { ENLBridgeContract };
