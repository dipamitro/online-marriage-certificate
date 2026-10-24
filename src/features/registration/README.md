# Registration feature

The previous registration engine is now a compatibility re-export. `boot.js` composes focused modules, publishes the existing `OMRBridge`, initializes enlistment and signing keys, restores existing registration records, and returns a ready promise and disposal function.

## Boundaries

- `state/`: browser storage, validated record repository, mutable session state, disposable browser callbacks.
- `services/`: forms, account lookup, registrar projection, fees, submission, issuance, crypto, onboarding progress, downloads and existing fixtures.
- `validators/`: application validation and appraisal checks.
- `components/`: reusable field, summary, document, icon and dialog HTML renderers.
- `screens/`: portal views and original screen markup.
- `events/`: field events and separate command groups for each workflow.
- `constants/` and `utils/`: shared form options, status and formatting.

Factories receive explicit live dependency references rather than importing mutable global state. This preserves replacement of the state object and identity of the registrar directory while avoiding circular module imports. Templates retain the original CSS classes, identifiers, action attributes and markup. They are HTML renderers, not React components; the React wrapper owns mounting and startup/error presentation. A full JSX migration is not claimed.

## Compatibility

The storage keys remain `omr-merged-v2`, `omr-keys`, and the enlistment-owned key. Existing fixtures and all seven bridge methods are retained. Unreadable stored registration data is left untouched and reported; it is never silently replaced with fixtures. Authentication, eKYC, OTP, payment, email and vault integrations retain their original simulated behavior. ECDSA seals still use browser WebCrypto. This refactor does not turn those simulations into secure production integrations.

## Verification

Run `bunx vitest run` for routing, repository, lifecycle and registration behavior tests. The shell-based browser journey exercises signup, draft reload, validation, payment, both signatures, registrar approval, wallets, and seal verification. No new dependencies or backend services are required.
