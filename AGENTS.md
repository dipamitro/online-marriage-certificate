<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Registration lives in src/features/registration/ with isolated service, state, validation, screen and event factories composed by boot.js; keep the legacy re-export and window bridge contracts stable so enlistment and the original markup remain compatible.
- Existing portal HTML renderers remain browser-owned behind the React mount; preserve template markup and portal.css to avoid visual regressions while allowing incremental React migration.
- The registration repository validates stored records without overwriting unreadable data; lifecycle owns registration listeners and timers so remounts do not duplicate callbacks.
- Tailwind preflight is disabled in src/styles.css so portal.css base styles are not overridden.

