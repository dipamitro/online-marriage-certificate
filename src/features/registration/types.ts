import type { createLifecycle } from "./state/lifecycle";
import type { browserStorage } from "./state/browser-storage";
import type { RegistrationState } from "./state/repository";

export type Lifecycle = ReturnType<typeof createLifecycle>;
export type BrowserStorage = typeof browserStorage;

/**
 * Physical address details in both Bangla and English,
 * along with administrative jurisdiction fields.
 */
export interface AddressInfo {
  /** House / village name in Bangla */
  houseBn: string;
  /** House / village name in English */
  houseEn: string;
  /** Road / block / sector in Bangla */
  roadBn: string;
  /** Road / block / sector in English */
  roadEn: string;
  /** District name */
  dist: string;
  /** Upazila / City Corporation name */
  upz: string;
  /** Post office name and code */
  po: string;
  /** Union / Pourashava name */
  uni: string;
  /** Ward name / number */
  ward: string;
  [key: string]: unknown;
}

/**
 * Basic identity and parent details used for witnesses, ukil (representative),
 * and the person solemnizing the marriage.
 */
export interface PersonFormInfo {
  /** Full name in Bangla */
  nameBn: string;
  /** Full name in English */
  nameEn: string;
  /** Father's name in Bangla */
  fatherBn: string;
  /** Father's name in English */
  fatherEn: string;
  /** Mother's name in Bangla */
  motherBn: string;
  /** Mother's name in English */
  motherEn: string;
  /** Present address */
  addr: AddressInfo;
  [key: string]: unknown;
}

/**
 * Extended identity and contact details for the Groom (`groom`) and Bride (`bride`).
 */
export interface SpouseFormInfo extends PersonFormInfo {
  /** Date of birth in `YYYY-MM-DD` format */
  dob: string;
  /** 10, 13, or 17-digit National ID (NID) number */
  nid: string;
  /** Marital status (e.g., Unmarried, Widower/Widow, Divorced, Married) */
  marital: string;
  /** 11-digit Bangladesh mobile number (`01XXXXXXXXX`) */
  mobile: string;
  /** Email address used for eSign invitations and notifications */
  email: string;
}

/**
 * Complete 7-step Marriage Registration Application Form (`app.f`).
 * Maps directly to the statutory clauses of the Bangladesh Nikahnama (Form-D).
 */
export interface ApplicationForm {
  /** Marriage registration type (e.g., new marriage vs. registration of prior marriage) */
  type: string;
  /** Jurisdiction where the marriage takes place */
  loc: {
    div: string;
    dist: string;
    upz: string;
    uni: string;
    ward: string;
    [key: string]: unknown;
  };
  /** Selected Marriage Registrar's licence number (e.g., `"MR-DHK-2019-0118"`) */
  registrar: string;
  /** Who is submitting the application: `"বর"` (Groom), `"কনে"` (Bride), or `"প্রতিনিধি"` (Representative) */
  applicantRole: string;
  /** Groom's personal, identity, and contact details */
  groom: SpouseFormInfo;
  /** Bride's personal, identity, and contact details */
  bride: SpouseFormInfo;
  /** Ukil (representative) appointment and witness details */
  ukil: {
    appointed: string;
    side: string;
    person: PersonFormInfo;
    w1: PersonFormInfo;
    w2: PersonFormInfo;
    [key: string]: unknown;
  };
  /** The two primary marriage witnesses (`w1` and `w2`) */
  wit: {
    w1: PersonFormInfo;
    w2: PersonFormInfo;
    [key: string]: unknown;
  };
  /** Person who solemnized the marriage (`off`) */
  off: PersonFormInfo;
  /** Statutory Nikahnama clauses (Dower/Mahr, Clauses 16–21, dates, and fee payment) */
  m: {
    /** Date of marriage settlement */
    settle: string;
    /** Total dower (Mahr) amount in BDT */
    mohor: string;
    /** Prompt dower (Mu'ajjal) amount */
    prompt: string;
    /** Dower already paid at the time of marriage */
    paid: string;
    /** Clause 16: Whether any property was given in lieu of dower */
    c16: string;
    /** Clause 16 details */
    c16d: string;
    /** Clause 17: Special conditions, if any */
    c17: string;
    /** Selected preset conditions for Clause 17 */
    c17o: string[];
    /** Custom details for Clause 17 */
    c17d: string;
    /** Clause 18: Whether the husband has delegated the right of divorce (Talaq-e-Tafweez) to the wife */
    c18: string;
    /** Clause 18 conditions */
    c18d: string;
    /** Clause 19: Whether the husband's right of divorce is curtailed */
    c19: string;
    /** Clause 19 details */
    c19d: string;
    /** Clause 20: Whether a document on dower/maintenance was executed */
    c20: string;
    /** Clause 20 details */
    c20d: string;
    /** Clause 21: Whether the groom already has an existing wife */
    c21: string;
    /** Arbitration Council permission number (if Clause 21 is Yes) */
    permNo: string;
    /** Arbitration Council permission date */
    permDate: string;
    /** Marriage registration date (`YYYY-MM-DD`) */
    regDate: string;
    /** Marriage registration time */
    regTime: string;
    /** Payment method (`"online"` or `"office"`) */
    pay: string;
    /** Emergency contact mobile number */
    contact: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * OneID eKYC verification metadata recorded at sign-up or before signing.
 */
export interface EkycInfo {
  /** ISO timestamp when eKYC was completed */
  at: string;
  /** Biometric face match confidence score (e.g., `98.4`) */
  score: number;
  /** Verification method description (e.g., `"NID scan + face match"`) */
  method?: string;
  /** Whether the application name matched the OneID record */
  nameMatch?: boolean;
  /** Official English name from OneID */
  oneName?: string;
  [key: string]: unknown;
}

/**
 * Electronic signature certificate metadata recorded when a party signs.
 */
export interface SignInfo {
  /** ISO timestamp when the signature was applied */
  at: string;
  /** Certificate serial number (e.g., `"4A1F-9B02-C31E-8801"`) */
  serial: string;
  [key: string]: unknown;
}

/**
 * Combined eKYC + eSign state for a signing party (Groom, Bride, or Registrar).
 */
export interface PartySignature {
  ekyc: EkycInfo | null;
  sign: SignInfo | null;
  acceptedAt?: string | null;
  [key: string]: unknown;
}

/**
 * Single audit trail entry in an application's history log.
 */
export interface HistoryEntry {
  /** ISO timestamp of the event */
  at: string;
  /** Name of the actor (Applicant, Groom, Bride, or Registrar) */
  by: string;
  /** Human-readable description of what happened */
  text: string;
  [key: string]: unknown;
}

/**
 * Official registration number and timestamp assigned upon Registrar approval.
 */
export interface IssuedInfo {
  /** Official Nikahnama registration number (e.g., `"NK-2026-005121"`) */
  regNo: string;
  /** ISO timestamp when the registration was issued */
  at: string;
  [key: string]: unknown;
}

/**
 * Bilingual Marriage Certificate metadata issued alongside the Digital Nikahnama.
 */
export interface CertificateInfo {
  /** Certificate serial number (e.g., `"MC-2026-008814"`) */
  sn: string;
  /** ISO timestamp when the certificate was generated */
  at: string;
  /** Signed Visible Digital Seal (VDS) payload string */
  vds: string;
}

/**
 * OneID Wallet Vault delivery status for the Groom and Bride.
 */
export interface VaultInfo {
  /** ISO timestamp when documents were delivered to the OneID Vault */
  at: string;
  /** Whether the Groom has viewed the document in their OneID Wallet */
  groom: boolean;
  /** Whether the Bride has viewed the document in their OneID Wallet */
  bride: boolean;
}

/**
 * Lifecycle statuses of a Marriage Registration Application:
 * - `"draft"`: Being edited by the applicant; not yet submitted.
 * - `"esign"`: Submitted; waiting for both Groom and Bride to accept with eSign.
 * - `"appraisal"`: Both Groom and Bride have signed; waiting for Registrar review.
 * - `"reverted"`: Sent back by the Registrar for correction by the applicant.
 * - `"approval"`: Accepted by the Registrar; ready for Registrar eSign.
 * - `"issued"`: Approved with Registrar eSign; Digital Nikahnama & Certificate generated.
 */
export type ApplicationStatus =
  "draft" | "esign" | "appraisal" | "reverted" | "approval" | "issued";

/**
 * Complete Marriage Registration Application record stored in `S.apps`.
 */
export interface ApplicationRecord {
  /** Internal application ID (e.g., `"app-1"`) */
  id: string;
  /** Human-readable application tracking number (e.g., `"MR-2026-001042"`) */
  appNo: string;
  /** NID of the applicant who created the record */
  owner: string;
  /** Date the draft was created */
  createdAt?: string;
  /** Timestamp when the application was submitted */
  submittedAt?: string;
  /** Current workflow status */
  status: ApplicationStatus;
  /** Explanation provided by the Registrar when reverting the application */
  revertReason?: string;
  /** Whether the registration fee was paid online */
  paid?: boolean;
  /** Form data containing Groom, Bride, Witnesses, Jurisdiction, and Nikahnama clauses */
  f: ApplicationForm;
  /** Electronic signature records for Groom and Bride */
  esign: {
    groom: PartySignature;
    bride: PartySignature;
    [key: string]: unknown;
  };
  /** Electronic signature record for the Marriage Registrar */
  reg: PartySignature;
  /** Chronological audit history of the application */
  history: HistoryEntry[];
  /** Issuance metadata once approved by the Registrar */
  issued: IssuedInfo | null;
  /** Signed Visible Digital Seal (VDS) string for the Digital Nikahnama */
  vds: string;
  /** Marriage Certificate metadata once issued */
  cert?: CertificateInfo;
  /** OneID Wallet Vault delivery status */
  vault?: VaultInfo;
  [key: string]: unknown;
}

/**
 * Actionable deep-link attached to a simulated email in the portal inbox.
 */
export interface EmailLink {
  /** Target portal or action type (`"esign" | "doc" | "vault" | "registrar" | "applicant"`) */
  type: string;
  /** Recipient NID for eSign or Wallet links */
  nid?: string;
  /** Target application ID */
  appId?: string;
  /** Target registrar licence number */
  lic?: string;
  /** Target applicant user ID */
  uid?: string;
  /** Whether this email is an eSign invitation */
  invite?: boolean;
  [key: string]: unknown;
}

/**
 * Simulated email message stored in `S.emails` and displayed in the Email Inbox (`/inbox`).
 */
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

/**
 * Citizen identity record in the simulated OneID / NID registry (`PEOPLE`).
 */
export interface PersonRecord {
  /** Full name in English */
  en: string;
  /** Full name in Bangla */
  bn: string;
  /** Gender (`"M"` or `"F"`) */
  g: string;
  /** Date of birth (`YYYY-MM-DD`) */
  dob: string;
  /** Father's name in English */
  father?: string;
  /** Mother's name in English */
  mother?: string;
}

/**
 * Active Marriage Registrar directory entry indexed by licence number (`REGISTRARS`).
 */
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

/**
 * Registrar record returned by the Enlistment Engine (`window.ENLBridge.enlisted()`).
 */
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

/**
 * State for the multi-step OneID eKYC sign-up wizard (`UI.onb`).
 */
export interface OnboardingState {
  /** Target portal after sign-up completes (`"applicant" | "registrar" | "esign" | "wallet"`) */
  p: string;
  /** Active wizard step (`"register" | "otp" | "password" | "start" | "method" | "manual" | "scanFront" | "scanBack" | "confirm" | "face" | "done"`) */
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
  /** Verification document type (`"NID"` or `"PASSPORT"`) */
  vtype: string;
  nid: string;
  dob: string;
  first: string;
  last: string;
  lic: string;
  /** Pre-selected demo NID if the user clicked a demo quick-fill chip */
  demo: string;
  err: string;
  /** Verification channel used (`"scan" | "manual" | "passport"`) */
  via: string;
  /** Step history stack for the Back button */
  hist: string[];
  tm?: ReturnType<typeof setTimeout>;
  iv?: ReturnType<typeof setInterval>;
  [key: string]: unknown;
}

/**
 * Result of verifying a Digital Nikahnama or Marriage Certificate on `/verify`.
 */
export interface VerifyResult {
  ok: boolean;
  reason?: string;
  doc?: string;
  sn?: string;
  regNo?: string;
  sealed?: string;
  /** Groom's English name */
  g?: string;
  /** Last 4 digits of Groom's NID */
  g4?: string;
  /** Bride's English name */
  b?: string;
  /** Last 4 digits of Bride's NID */
  b4?: string;
  date?: string;
  lic?: string;
}

/**
 * Pending deep-link redirect when an email link requires the user to sign up first.
 */
export interface PendingRedirect {
  p: string;
  nid: string;
  appId?: string | null;
  esign?: boolean;
  msg: string;
}

/**
 * Ephemeral UI state for the Marriage Registration Portal (`UI`).
 */
export interface RegistrationUIState {
  /** Currently active portal view (`"home" | "applicant" | "registrar" | "esign" | "wallet" | "verify" | "inbox" | "doc" | "enl"`) */
  portal: string;
  /** State of the Sign-In screen (`/applicant/sign-in`, `/marriage_resistar/sign-in`, etc.) */
  home: {
    role: string;
    err: string;
    id?: string;
    pw?: string;
    acct: Record<string, string>;
  };
  /** State of the OneID Wallet portal (`/wallet`) */
  wallet: {
    cat: string | null;
    doc: string | null;
    kind?: string;
    sb: boolean;
  };
  /** Currently signed-in user NID or registrar licence per portal */
  auth: Record<string, string | null>;
  /** Active sub-page tab within each portal (e.g., `"dash"`, `"new"`, `"track"`) */
  page: Record<string, string>;
  /** Currently opened application ID within each portal */
  open: Record<string, string | null>;
  /** Active draft application being edited in the 7-tab form */
  draft: ApplicationRecord | null;
  /** Active tab index (0–6) in the marriage application form */
  tab: number;
  /** Validation errors `[tabIndex, errorMessage]` for the current draft */
  errors: Array<[number, string]> | null;
  /** State of the Email Inbox (`/inbox`), including per-user email sign-in */
  inbox: {
    id: string | null;
    auth?: string | null;
    emailInput?: string;
    passwordInput?: string;
    err?: string;
  };
  /** State of the Universal Verifier on `/verify` */
  verify: { input: string; result: VerifyResult | null };
  /** Application ID being viewed in full-page document preview (`doc`) */
  doc: string | null;
  /** Whether the mobile sidebar drawer is open */
  sb: boolean;
  /** Whether the Groom/Bride has ticked the review confirmation checkbox before eSign */
  accept?: boolean;
  /** Active OneID eKYC sign-up wizard state, or `null` when closed */
  onb?: OnboardingState | null;
  /** Pending deep-link redirect from an email invitation */
  pending?: PendingRedirect | null;
  /** Cached applications naming the current applicant as Groom/Bride */
  _mineE?: ApplicationRecord[];
  /** Cached applications awaiting the current applicant's eSign */
  _pendE?: ApplicationRecord[];
  /** Selected login account NID per portal */
  login: Record<string, string>;
}

/**
 * Controller returned by `bootRegistration()` to manage the portal lifecycle.
 */
export interface RegistrationController {
  ready: Promise<void>;
  error?: unknown;
  dispose(): void;
}

/**
 * Global bridge exposed by the Registrar Enlistment Engine (`window.ENLBridge`).
 */
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

/**
 * Global bridge exposed by the Marriage Registration Engine (`window.OMRBridge`).
 */
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
  resetDemo?(): Promise<void> | void;
  getPortal?(): string;
  setPortal?(portal: string): void;
  getSignInRole?(): string;
  setSignInRole?(role: string): void;
  onPortalChange?: ((portal: string) => void) | undefined;
  onSignInRoleChange?: ((role: string) => void) | undefined;
}

/**
 * Shared dependency bag injected into registration feature factory modules.
 */
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
