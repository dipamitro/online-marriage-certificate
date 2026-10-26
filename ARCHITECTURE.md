# Developer Architecture & Readability Guide

This document provides a straightforward guide to understanding, navigating, and modifying the **Online Marriage Registration & Registrar Enlistment Portal**.

---

## 1. High-Level Architecture

The application is built with **React 19**, **TypeScript**, **TanStack Router**, and **Tailwind CSS**.

```text
src/
├── routes/                  # TanStack Router file-based routes (14 routes)
├── hooks/
│   └── use-marriage-portal.ts # Custom React hook syncing URL routes <-> portal state
├── components/
│   ├── MarriagePortal.tsx   # Main React component mounted by each route
│   └── portal/              # Error banner and DOM mount containers (#pills, #root, #eroot)
├── features/
│   └── registration/        # Modular Marriage Registration feature (pure TypeScript)
│       ├── types.ts         # Complete domain interfaces with JSDoc comments
│       ├── boot.ts          # Dependency-injection composition root
│       ├── state/           # Browser localStorage persistence, store, and lifecycle cleanup
│       ├── constants/       # Statutory Nikahnama options and status badges
│       ├── utils/           # Date/number/Bangla formatting and validation helpers
│       ├── validators/      # Marriage age, NID, and statutory form validation
│       ├── services/        # Business logic (sign-in, onboarding, issuance, PDF, VDS seal)
│       ├── components/      # Reusable HTML view builders (Nikahnama, Certificate, Dialogs)
│       ├── screens/         # Portal screen renderers (Sign-In, Applicant, Registrar, eSign, Inbox)
│       └── events/          # Delegated click/input event handlers grouped by domain
└── legacy/
    ├── enlistment-engine.ts # Marriage Registrar Enlistment, Admin & Super Admin engine
    ├── registration-engine.ts # Re-exports bootRegistration
    └── portal.css           # Shared design system styles
```

---

## 2. URL Routes & Portal Mapping

All routing is managed by [`useMarriagePortal`](src/hooks/use-marriage-portal.ts) and TanStack Router (`src/routes/`):

| URL Route                    | Route File                                 | Portal / Role               | Description                                                  |
| :--------------------------- | :----------------------------------------- | :-------------------------- | :----------------------------------------------------------- |
| `/applicant/sign-in`         | `src/routes/applicant.sign-in.tsx`         | `home` (`role="applicant"`) | Citizen Applicant Sign-In & OneID eKYC Sign-Up               |
| `/marriage_resistar/sign-in` | `src/routes/marriage_resistar.sign-in.tsx` | `home` (`role="registrar"`) | Marriage Registrar Sign-In & Enlistment Sign-Up              |
| `/admin/sign-in`             | `src/routes/admin.sign-in.tsx`             | `home` (`role="admin"`)     | Law & Justice Division Admin Sign-In                         |
| `/superadmin/sign-in`        | `src/routes/superadmin.sign-in.tsx`        | `home` (`role="super"`)     | Law & Justice Division Super Admin Sign-In                   |
| `/applicant`                 | `src/routes/applicant.tsx`                 | `applicant`                 | Marriage Registration Applicant Dashboard & 7-Step Form      |
| `/registrar`                 | `src/routes/registrar.tsx`                 | `registrar`                 | Enlisted Marriage Registrar Desk (Appraisal & Approval)      |
| `/enlistment`                | `src/routes/enlistment.tsx`                | `enl` (`role="applicant"`)  | Registrar Enlistment Application Portal                      |
| `/admin`                     | `src/routes/admin.tsx`                     | `enl` (`role="admin"`)      | Admin Console (Review & eSign Enlistment Applications)       |
| `/superadmin`                | `src/routes/superadmin.tsx`                | `enl` (`role="super"`)      | Super Admin Console (Approve, Suspend, Manage Jurisdictions) |
| `/esign`                     | `src/routes/esign.tsx`                     | `esign`                     | Bride & Groom Nikahnama Review & eSign Portal                |
| `/wallet`                    | `src/routes/wallet.tsx`                    | `wallet`                    | OneID Citizen Wallet & Marriage Documents Vault              |
| `/verify`                    | `src/routes/verify.tsx`                    | `verify`                    | Universal ECDSA Visible Digital Seal (VDS) Verifier          |
| `/inbox`                     | `src/routes/inbox.tsx`                     | `inbox`                     | Simulated Email Inbox (Invitations, Approvals, Vault Links)  |

---

## 3. Glossary of Common Shorthand Names in `src/features/registration/`

When reading modules inside `src/features/registration/`, you will see these shared dependencies on the `dependencies` object:

| Name          | Type / Meaning                                                                                                     | Where It Is Defined                      |
| :------------ | :----------------------------------------------------------------------------------------------------------------- | :--------------------------------------- |
| `S`           | **Persisted State** (`S.apps`, `S.users`, `S.emails`, `S.seq`) saved in `localStorage` under `"omr-merged-reg-v3"` | `state/store.ts` & `state/repository.ts` |
| `UI`          | **Active UI State** (`UI.portal`, `UI.auth`, `UI.page`, `UI.open`, `UI.draft`, `UI.home`, `UI.onb`)                | `state/store.ts` & `types.ts`            |
| `PEOPLE`      | **OneID Citizen Registry** mapping NID numbers to `{ en, bn, dob, g, father, mother }`                             | `services/reference-directory.ts`        |
| `REGISTRARS`  | **Active Marriage Registrars** indexed by licence number (e.g., `MR-DHK-2019-0118`)                                | `services/reference-directory.ts`        |
| `IC`          | **SVG Icons Dictionary** (`IC.user`, `IC.plus`, `IC.pen`, `IC.shield`, etc.)                                       | `components/symbols.ts`                  |
| `esc(value)`  | Escapes HTML special characters (`&`, `<`, `>`, `"`, `'`) for safe template rendering                              | `utils/formatting.ts`                    |
| `bn(value)`   | Converts English digits (`0-9`) to Bangla digits (`০-৯`)                                                           | `utils/formatting.ts`                    |
| `toEn(value)` | Converts Bangla digits (`০-৯`) to English digits (`0-9`)                                                           | `utils/formatting.ts`                    |
| `fD(iso)`     | Formats an ISO date as `"14 Mar 2026"`                                                                             | `utils/formatting.ts`                    |
| `fDT(iso)`    | Formats an ISO datetime as `"14 Mar 2026, 2:30 PM"`                                                                | `utils/formatting.ts`                    |
| `licOf(nid)`  | Returns the active registrar licence number for a given NID, or `null` if not enlisted                             | `services/reference-directory.ts`        |
| `userOf(nid)` | Looks up a signed-up user account in `S.users[nid]`                                                                | `services/contacts.ts`                   |
| `appById(id)` | Finds a marriage registration application in `S.apps` by its ID                                                    | `services/applications.ts`               |
| `render()`    | Re-renders the top navigation pills and active portal screen into `#root`                                          | `screens/portal-shell.ts`                |

---

## 4. End-to-End Workflows

### A. Signing Up a Real User (`OneID eKYC`)

1. Clicking **"Sign up with OneID eKYC"** (or **"Sign up with OneID eKYC to apply for enlistment"**) calls `startOnb(role)` in [`services/onboarding.ts`](src/features/registration/services/onboarding.ts).
2. The user enters their email, phone, OTP, password, and NID details (handled by [`events/onboarding-actions.ts`](src/features/registration/events/onboarding-actions.ts)).
3. On completion, [`obFinish()`](src/features/registration/services/onboarding-progress.ts) saves the user into `S.users[nid]` (and syncs to `window.ENLBridge.syncUser` for registrar enlistment applicants), persists to `localStorage`, and automatically logs the user in.

### B. Submitting & Approving a Marriage Registration Application

1. **Applicant (`/applicant`)**: Starts a draft (`startDraft`), fills the 7 tabs (or clicks **Fill with demo data**), and submits (`submitapp` in [`events/application-actions.ts`](src/features/registration/events/application-actions.ts)). Status becomes `"esign"`.
2. **Groom & Bride (`/esign` or Applicant `My eSign`)**: Both review the Nikahnama and accept with SMS OTP (`esign` in [`events/signing-actions.ts`](src/features/registration/events/signing-actions.ts)). Once both sign, status becomes `"appraisal"`.
3. **Marriage Registrar (`/registrar`)**: Reviews the application and clicks **Approve with eSign & send to OneID Vault** (`approve` in [`events/signing-actions.ts`](src/features/registration/events/signing-actions.ts)).
4. **Issuance & Vault Delivery (`/wallet` & `/verify`)**: [`issue()`](src/features/registration/services/issuance.ts) generates the official Registration Number (`NK-YYYY-XXXXXX`), Marriage Certificate (`MC-YYYY-XXXXXX`), and ECDSA Visible Digital Seals (`vds`), delivering both documents to the Groom's and Bride's OneID Wallet.

### C. Resetting Demo Data (`↺ Reset demo`)

Clicking **`↺ Reset demo`** in the top bar triggers `case "reset"` in [`events/navigation-actions.ts`](src/features/registration/events/navigation-actions.ts), which clears both `"omr-merged-reg-v3"` and `"omr-merged-enl-v3"` from `localStorage` and restores the default seed data.
