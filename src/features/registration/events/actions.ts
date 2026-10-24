import type { AnyDeps } from "../types";
import { createNavigationActions } from "./navigation-actions";
import { createApplicationActions } from "./application-actions";
import { createSigningActions } from "./signing-actions";
import { createWalletActions } from "./wallet-actions";
import { createDocumentsActions } from "./documents-actions";
import { createInboxActions } from "./inbox-actions";
import { createAccountActions } from "./account-actions";
import { createDialogsActions } from "./dialogs-actions";

/** Attach one dispatcher; each command group owns one workflow. */
export function createEventsActions(dependencies: AnyDeps) {
  const navigation = createNavigationActions(dependencies);
  const application = createApplicationActions(dependencies);
  const signing = createSigningActions(dependencies);
  const wallet = createWalletActions(dependencies);
  const documents = createDocumentsActions(dependencies);
  const inbox = createInboxActions(dependencies);
  const account = createAccountActions(dependencies);
  const dialogs = createDialogsActions(dependencies);
  const handlers = [navigation, application, signing, wallet, documents, inbox, account, dialogs];
  dependencies.lifecycle.listen(document, "click", async (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element) || target.closest("#eroot, #emodal")) return;
    const button = target.closest<HTMLButtonElement>("[data-act]");
    if (!button || button.disabled) return;
    const action = button.dataset["act"];
    if (!action) return;
    if (action.startsWith("ob-")) {
      dependencies.obAction(action, button);
      return;
    }
    for (const handle of handlers) {
      if (await handle(action, button)) return;
    }
  });
  return {};
}
