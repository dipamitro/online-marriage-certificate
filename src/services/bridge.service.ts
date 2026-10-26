import type { PortalKey, SignInRole, EnlistmentRole } from "@/types";

/**
 * Service to safely interact with window.OMRBridge and window.ENLBridge.
 */
export const bridgeService = {
  getOmrBridge() {
    return typeof window !== "undefined" ? window.OMRBridge : undefined;
  },

  getEnlBridge() {
    return typeof window !== "undefined" ? window.ENLBridge : undefined;
  },

  setPortal(portal: PortalKey) {
    const bridge = this.getOmrBridge();
    bridge?.setPortal?.(portal);
  },

  setSignInRole(role: SignInRole) {
    const bridge = this.getOmrBridge();
    bridge?.setSignInRole?.(role);
  },

  setEnlRole(role: EnlistmentRole) {
    const enlBridge = this.getEnlBridge();
    if (role === "admin" || role === "super") {
      enlBridge?.signIn?.(role);
    } else {
      enlBridge?.show?.("applicant");
    }
  },

  refreshPortal() {
    this.getOmrBridge()?.refresh?.();
    this.getEnlBridge()?.render?.();
  },
};
