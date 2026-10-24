import type { AnyDeps } from "../types";

/** Dialogs commands, isolated from other portal actions. */
export function createDialogsActions(dependencies: AnyDeps) {
  return async function handleDialogs(act: string, b: HTMLButtonElement): Promise<boolean> {
    switch (act) {
      case "mclose":
        dependencies.closeModal();
        break;
      case "mok": {
        if (!dependencies.mOk) break;
        b.disabled = true;
        try {
          const r = await dependencies.mOk();
          if (r === "pending") break;
          if (r) {
            const el = dependencies.$("#m-err") as HTMLElement | null;
            if (el) el.textContent = r;
            b.disabled = false;
          } else dependencies.closeModal();
        } catch (error) {
          b.disabled = false;
          throw error;
        }
        break;
      }
      default:
        return false;
    }
    return true;
  };
}
