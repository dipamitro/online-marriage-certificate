import { createRepository, STORAGE_KEY, type RegistrationState } from "./repository";
import type { AnyDeps, ApplicationRecord, RegistrationUIState } from "../types";

function createDefaultUI(): RegistrationUIState {
  return {
    portal: "home",
    home: { role: "", err: "", acct: {} },
    wallet: { cat: null, doc: null, sb: false },
    auth: { applicant: null, esign: null, registrar: null, wallet: null },
    page: { applicant: "dash", esign: "dash", registrar: "dash", wallet: "vault" },
    open: { applicant: null, esign: null, registrar: null, wallet: null },
    draft: null,
    tab: 0,
    errors: null,
    inbox: { id: null, auth: null, emailInput: "", passwordInput: "", err: "" },
    verify: { input: "", result: null },
    doc: null,
    sb: false,
    login: {
      applicant: "5555555555",
      esign: "1990123456",
      registrar: "6111111111",
      wallet: "7012345678",
    },
  };
}

let sharedUI: RegistrationUIState = createDefaultUI();

/** state/store. Dependencies: ls. */
export function createStateStore(_dependencies: AnyDeps) {
  const repository = createRepository();
  const STORE = STORAGE_KEY;
  let S: RegistrationState | null = null,
    KEYS: { priv: CryptoKey; pub: CryptoKey } | null = null;

  // If storage was cleared (e.g., fresh session or test environment), reset UI session state
  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      sharedUI = createDefaultUI();
    }
  } catch {
    sharedUI = createDefaultUI();
  }

  const UI: RegistrationUIState = sharedUI;

  const save = () => {
    if (S) repository.write(S);
  };
  const readState = () => repository.read();
  const appById = (id: string | null | undefined): ApplicationRecord | undefined =>
    S?.apps.find((a) => a.id === id) as ApplicationRecord | undefined;
  return {
    STORE,
    get S() {
      return S;
    },
    set S(value) {
      S = value;
    },
    get KEYS() {
      return KEYS;
    },
    set KEYS(value) {
      KEYS = value;
    },
    UI,
    save,
    readState,
    appById,
  };
}
