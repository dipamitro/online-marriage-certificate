import type { createLifecycle } from "./state/lifecycle";
import type { browserStorage } from "./state/browser-storage";
import type { RegistrationState } from "./state/repository";

export type Lifecycle = ReturnType<typeof createLifecycle>;
export type BrowserStorage = typeof browserStorage;

export interface AddressInfo {
  houseBn: string;
  houseEn: string;
  roadBn: string;
  roadEn: string;
  dist: string;
  upz: string;
  po: string;
  uni: string;
  ward: string;
  [key: string]: unknown;
}

export interface PersonFormInfo {
  nameBn: string;
  nameEn: string;
  fatherBn: string;
  fatherEn: string;
  motherBn: string;
  motherEn: string;
  addr: AddressInfo;
  [key: string]: unknown;
}

export interface SpouseFormInfo extends PersonFormInfo {
  dob: string;
  nid: string;
  marital: string;
  mobile: string;
  email: string;
}

export interface ApplicationForm {
  type: string;
  loc: {
    div: string;
    dist: string;
    upz: string;
    uni: string;
    ward: string;
    [key: string]: unknown;
  };
  registrar: string;
  applicantRole: string;
  groom: SpouseFormInfo;
  bride: SpouseFormInfo;
  ukil: {
    appointed: string;
    side: string;
    person: PersonFormInfo;
    w1: PersonFormInfo;
    w2: PersonFormInfo;
    [key: string]: unknown;
  };
  wit: {
    w1: PersonFormInfo;
    w2: PersonFormInfo;
    [key: string]: unknown;
  };
  off: PersonFormInfo;
  m: {
    settle: string;
    mohor: string;
    prompt: string;
    paid: string;
    c16: string;
    c16d: string;
    c17: string;
    c17o: string[];
    c17d: string;
    c18: string;
    c18d: string;
    c19: string;
    c19d: string;
    c20: string;
    c20d: string;
    c21: string;
    permNo: string;
    permDate: string;
    regDate: string;
    regTime: string;
    pay: string;
    contact: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface EkycInfo {
  at: string;
  score: number;
  method?: string;
  nameMatch?: boolean;
  oneName?: string;
  [key: string]: unknown;
}

export interface SignInfo {
  at: string;
  serial: string;
  [key: string]: unknown;
}

export interface PartySignature {
  ekyc: EkycInfo | null;
  sign: SignInfo | null;
  acceptedAt?: string | null;
  [key: string]: unknown;
}

export interface HistoryEntry {
  at: string;
  by: string;
  text: string;
  [key: string]: unknown;
}

export interface IssuedInfo {
  regNo: string;
  at: string;
  [key: string]: unknown;
}

export interface CertificateInfo {
  sn: string;
  at: string;
  vds: string;
}

export interface VaultInfo {
  at: string;
  groom: boolean;
  bride: boolean;
}

export type ApplicationStatus =
  "draft" | "esign" | "appraisal" | "reverted" | "approval" | "issued";

export interface ApplicationRecord {
  id: string;
  appNo: string;
  owner: string;
  createdAt?: string;
  submittedAt?: string;
  status: ApplicationStatus;
  revertReason?: string;
  paid?: boolean;
  f: ApplicationForm;
  esign: {
    groom: PartySignature;
    bride: PartySignature;
    [key: string]: unknown;
  };
  reg: PartySignature;
  history: HistoryEntry[];
  issued: IssuedInfo | null;
  vds: string;
  cert?: CertificateInfo;
  vault?: VaultInfo;
  [key: string]: unknown;
}

export interface EmailLink {
  type: string;
  nid?: string;
  appId?: string;
  lic?: string;
  uid?: string;
  invite?: boolean;
  [key: string]: unknown;
}

export interface EmailMessage {
  id: string;
  to: string;
  toName: string;
  subject: string;
  body: string[];
  at: string;
  read: boolean;
  link: EmailLink;
  [key: string]: unknown;
}

export interface PersonRecord {
  en: string;
  bn: string;
  g: string;
  dob: string;
  father?: string;
  mother?: string;
}

export interface RegistrarRecord {
  nid: string;
  dist: string;
  upz: string;
  uni: string;
  wards: string[];
  office: string;
  email: string;
  mobile: string;
  mobile2: string;
  status: string;
}

export interface EnlistedRegistrar {
  licenceNo: string;
  nid: string;
  nameEn: string;
  nameBn: string;
  dob: string;
  div: string;
  dist: string;
  upz: string;
  uni: string;
  wards: string[];
  office: string;
  email: string;
  mobile: string;
  status: string;
}

export interface OnboardingState {
  p: string;
  step: string;
  email: string;
  phone: string;
  agree: boolean;
  otp: string;
  code: string;
  sent: number;
  pw: string;
  pw2: string;
  show1: boolean;
  show2: boolean;
  country: string;
  vtype: string;
  nid: string;
  dob: string;
  first: string;
  last: string;
  lic: string;
  demo: string;
  err: string;
  via: string;
  hist: string[];
  tm?: ReturnType<typeof setTimeout>;
  iv?: ReturnType<typeof setInterval>;
  [key: string]: unknown;
}

export interface VerifyResult {
  ok: boolean;
  reason?: string;
  doc?: string;
  sn?: string;
  regNo?: string;
  sealed?: string;
  g?: string;
  g4?: string;
  b?: string;
  b4?: string;
  date?: string;
  lic?: string;
}

export interface PendingRedirect {
  p: string;
  nid: string;
  appId?: string | null;
  esign?: boolean;
  msg: string;
}

export interface RegistrationUIState {
  portal: string;
  home: {
    role: string;
    err: string;
    id?: string;
    pw?: string;
    acct: Record<string, string>;
  };
  wallet: {
    cat: string | null;
    doc: string | null;
    kind?: string;
    sb: boolean;
  };
  auth: Record<string, string | null>;
  page: Record<string, string>;
  open: Record<string, string | null>;
  draft: ApplicationRecord | null;
  tab: number;
  errors: Array<[number, string]> | null;
  inbox: { id: string | null };
  verify: { input: string; result: VerifyResult | null };
  doc: string | null;
  sb: boolean;
  accept?: boolean;
  onb?: OnboardingState | null;
  pending?: PendingRedirect | null;
  _mineE?: ApplicationRecord[];
  _pendE?: ApplicationRecord[];
  login: Record<string, string>;
}

export interface RegistrationController {
  ready: Promise<void>;
  error?: unknown;
  dispose(): void;
}

export interface ENLBridgeContract {
  init(): Promise<void>;
  show(role?: string, nid?: string | null, page?: string): void;
  signIn(role: string): void;
  hide(): void;
  getRole?(): string;
  syncUser?(user: {
    nid: string;
    name: string;
    nameBn?: string;
    dob?: string;
    email: string;
    mobile: string;
    ekycAt?: string;
  }): void;
  enlisted(): EnlistedRegistrar[];
  tree(): Record<string, Record<string, Record<string, Record<string, string[]>>>>;
  pendingFor(nid: string): unknown;
  reset(): void;
  render(): void;
}

export interface OMRBridgeContract {
  user(nid: string): {
    id: string;
    nid: string;
    name: string;
    email: string;
    mobile: string;
    ekycAt?: string;
    ekycMethod?: unknown;
  } | null;
  person(nid: string): PersonRecord | null;
  demoContact(nid: string): { email: string; mobile: string } | null;
  mail(to: string, toName: string, subject: string, body: string[]): void;
  home(signOutRole?: string): void;
  openDesk(nid: string): void;
  refresh(): void;
  getPortal?(): string;
  setPortal?(portal: string): void;
  getSignInRole?(): string;
  setSignInRole?(role: string): void;
  onPortalChange?: ((portal: string) => void) | undefined;
  onSignInRoleChange?: ((role: string) => void) | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyDeps = any;

export interface RegistrationBaseRuntime {
  lifecycle: Lifecycle;
  ls: BrowserStorage;
  $: (selector: string) => HTMLElement | null;
  S: RegistrationState;
  UI: RegistrationUIState;
}

declare global {
  interface Window {
    ENLBridge?: ENLBridgeContract;
    OMRBridge?: OMRBridgeContract;
    jspdf?: {
      jsPDF: new (options: { unit: string; format: string }) => {
        internal: { pageSize: { getWidth(): number; getHeight(): number } };
        addPage(): void;
        addImage(
          imageData: string,
          format: string,
          x: number,
          y: number,
          width: number,
          height: number,
        ): void;
        output(type: "blob"): Blob;
      };
    };
    claude?: {
      use?: (
        capability: string,
      ) => Promise<{ save(opts: { filename: string; data: Blob }): Promise<void> } | null>;
    };
  }

  const QRCode:
    | {
        new (
          element: Element,
          options: { text?: string; width: number; height: number; correctLevel: number },
        ): unknown;
        CorrectLevel: { M: number };
      }
    | undefined;

  const html2canvas:
    | ((
        element: Element | null,
        options: {
          scale: number;
          backgroundColor: string;
          useCORS: boolean;
          logging: boolean;
        },
      ) => Promise<HTMLCanvasElement>)
    | undefined;
}
