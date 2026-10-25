import type { AnyDeps } from "../types";

/**
 * Handles modal dialog buttons: closing the modal (`mclose`) and confirming (`mok`).
 */
export function createDialogsActions(dependencies: AnyDeps) {
  return async function handleDialogs(action: string, button: HTMLButtonElement): Promise<boolean> {
    switch (action) {
      case "mclose":
        dependencies.closeModal();
        break;

      case "mok": {
        if (!dependencies.mOk) break;
        button.disabled = true;
        try {
          const validationErrorOrStatus = await dependencies.mOk();
          if (validationErrorOrStatus === "pending") {
            break;
          }
          if (validationErrorOrStatus) {
            const errorElement = dependencies.$("#m-err") as HTMLElement | null;
            if (errorElement) {
              errorElement.textContent = validationErrorOrStatus;
            }
            button.disabled = false;
          } else {
            dependencies.closeModal();
          }
        } catch (error) {
          button.disabled = false;
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
