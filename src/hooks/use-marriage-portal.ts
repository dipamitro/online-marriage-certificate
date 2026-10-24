import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { bootEnlistment } from "@/legacy/enlistment-engine";
import { bootRegistration, type RegistrationController } from "@/legacy/registration-engine";
import { loadVendorScripts } from "@/legacy/load-vendor";

export type PortalKey =
  "home" | "wallet" | "verify" | "inbox" | "applicant" | "registrar" | "esign" | "enl";

export type SignInRole = "applicant" | "registrar" | "admin" | "super";
export type EnlistmentRole = "applicant" | "admin" | "super";

export type PortalRoutePath =
  | "/"
  | "/applicant/sign-in"
  | "/marriage_resistar/sign-in"
  | "/admin/sign-in"
  | "/superadmin/sign-in"
  | "/wallet"
  | "/verify"
  | "/inbox"
  | "/applicant"
  | "/registrar"
  | "/esign"
  | "/enlistment"
  | "/admin"
  | "/superadmin";

export const SIGNIN_ROLE_TO_PATH: Record<SignInRole, PortalRoutePath> = {
  applicant: "/applicant/sign-in",
  registrar: "/marriage_resistar/sign-in",
  admin: "/admin/sign-in",
  super: "/superadmin/sign-in",
};

export const PATH_TO_SIGNIN_ROLE: Record<string, SignInRole> = {
  "/applicant/sign-in": "applicant",
  "/marriage_resistar/sign-in": "registrar",
  "/admin/sign-in": "admin",
  "/superadmin/sign-in": "super",
};

export const ENL_ROLE_TO_PATH: Record<EnlistmentRole, PortalRoutePath> = {
  applicant: "/enlistment",
  admin: "/admin",
  super: "/superadmin",
};

export const PATH_TO_ENL_ROLE: Record<string, EnlistmentRole> = {
  "/enlistment": "applicant",
  "/admin": "admin",
  "/superadmin": "super",
};

export const PORTAL_TO_PATH: Record<string, PortalRoutePath> = {
  home: "/applicant/sign-in",
  wallet: "/wallet",
  verify: "/verify",
  inbox: "/inbox",
  doc: "/inbox",
  applicant: "/applicant",
  registrar: "/registrar",
  esign: "/esign",
  enl: "/enlistment",
};

export const PATH_TO_PORTAL: Record<string, PortalKey> = {
  "/": "home",
  "/applicant/sign-in": "home",
  "/marriage_resistar/sign-in": "home",
  "/admin/sign-in": "home",
  "/superadmin/sign-in": "home",
  "/wallet": "wallet",
  "/verify": "verify",
  "/inbox": "inbox",
  "/applicant": "applicant",
  "/registrar": "registrar",
  "/esign": "esign",
  "/enlistment": "enl",
  "/admin": "enl",
  "/superadmin": "enl",
};

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

let enlistmentInitialized = false;

export interface UseMarriagePortalOptions {
  initialPortal?: PortalKey;
  initialSignInRole?: SignInRole;
  initialEnlRole?: EnlistmentRole;
}

export interface UseMarriagePortalResult {
  activePortal: PortalKey;
  error: string;
  switchPortal: (portal: PortalKey) => void;
  retry: () => void;
}

/**
 * Custom React hook that manages the Marriage Registration & Enlistment portal
 * lifecycle, synchronous loading-free initialization, and two-way URL route synchronization.
 */
export function useMarriagePortal(options?: UseMarriagePortalOptions): UseMarriagePortalResult {
  const location = useLocation();
  const navigate = useNavigate();

  const resolvedPortal: PortalKey =
    options?.initialPortal ?? PATH_TO_PORTAL[location.pathname] ?? "home";
  const resolvedSignInRole: SignInRole | undefined =
    options?.initialSignInRole ?? PATH_TO_SIGNIN_ROLE[location.pathname];
  const resolvedEnlRole: EnlistmentRole | undefined =
    options?.initialEnlRole ?? PATH_TO_ENL_ROLE[location.pathname];

  const [activePortal, setActivePortal] = useState<PortalKey>(resolvedPortal);
  const [error, setError] = useState<string>("");

  useIsomorphicLayoutEffect(() => {
    let cancelled = false;
    let controller: RegistrationController | undefined;

    document.body.classList.add(`p-${resolvedPortal === "enl" ? "registrar" : resolvedPortal}`);

    try {
      if (!enlistmentInitialized || !window.ENLBridge) {
        bootEnlistment();
        enlistmentInitialized = true;
      }

      controller = bootRegistration({
        initialPortal: resolvedPortal,
        ...(resolvedSignInRole !== undefined ? { initialSignInRole: resolvedSignInRole } : {}),
        ...(resolvedEnlRole !== undefined ? { initialEnlRole: resolvedEnlRole } : {}),
      });

      if (window.OMRBridge) {
        window.OMRBridge.onSignInRoleChange = (nextRole: string) => {
          if (cancelled) return;
          const roleKey = (nextRole as SignInRole) || "applicant";
          const targetPath = SIGNIN_ROLE_TO_PATH[roleKey] ?? "/applicant/sign-in";
          if (window.location.pathname !== targetPath) {
            void navigate({ to: targetPath });
          }
        };

        window.OMRBridge.onPortalChange = (nextPortal: string) => {
          if (cancelled) return;
          const mappedPortal: PortalKey =
            nextPortal === "doc" ? "inbox" : (nextPortal as PortalKey) || "home";
          setActivePortal(mappedPortal);

          if (nextPortal === "home") {
            const currentPath = window.location.pathname;
            if (currentPath === "/" || PATH_TO_SIGNIN_ROLE[currentPath]) {
              return;
            }
            const roleKey =
              (window.OMRBridge?.getSignInRole?.() as SignInRole | undefined) || "applicant";
            const targetSignInPath = SIGNIN_ROLE_TO_PATH[roleKey] ?? "/applicant/sign-in";
            if (currentPath !== targetSignInPath) {
              void navigate({ to: targetSignInPath });
            }
            return;
          }

          if (nextPortal === "enl") {
            const enlRole =
              (window.ENLBridge?.getRole?.() as EnlistmentRole | undefined) || "applicant";
            const targetEnlPath = ENL_ROLE_TO_PATH[enlRole] ?? "/enlistment";
            if (window.location.pathname !== targetEnlPath) {
              void navigate({ to: targetEnlPath });
            }
            return;
          }

          const targetPath = PORTAL_TO_PATH[nextPortal] ?? "/";
          if (window.location.pathname !== targetPath) {
            void navigate({ to: targetPath });
          }
        };
      }

      void controller.ready
        .then(() => {
          if (cancelled) return;
          return loadVendorScripts();
        })
        .then(() => {
          if (cancelled) return;
          window.OMRBridge?.refresh();
          window.ENLBridge?.render();
        })
        .catch((cause: unknown) => {
          if (!cancelled) {
            setError(
              cause instanceof Error
                ? cause.message
                : "The portal could not load. Please try again.",
            );
          }
        });
    } catch (cause: unknown) {
      controller?.dispose();
      if (!cancelled) {
        setError(
          cause instanceof Error ? cause.message : "The portal could not load. Please try again.",
        );
      }
    }

    return () => {
      cancelled = true;
      if (window.OMRBridge) {
        window.OMRBridge.onPortalChange = undefined;
        window.OMRBridge.onSignInRoleChange = undefined;
      }
      controller?.dispose();
    };
  }, [resolvedPortal, resolvedSignInRole, resolvedEnlRole, navigate]);

  useEffect(() => {
    const signInRole = PATH_TO_SIGNIN_ROLE[location.pathname];
    if (signInRole) {
      setActivePortal("home");
      window.OMRBridge?.setSignInRole?.(signInRole);
      return;
    }
    const enlRole = PATH_TO_ENL_ROLE[location.pathname];
    if (enlRole) {
      setActivePortal("enl");
      if (enlRole === "admin" || enlRole === "super") {
        window.ENLBridge?.signIn(enlRole);
      } else {
        window.ENLBridge?.show("applicant");
      }
      window.OMRBridge?.setPortal?.("enl");
      return;
    }
    const targetPortal = PATH_TO_PORTAL[location.pathname];
    if (
      targetPortal &&
      window.OMRBridge?.getPortal &&
      window.OMRBridge.getPortal() !== targetPortal
    ) {
      setActivePortal(targetPortal);
      window.OMRBridge.setPortal?.(targetPortal);
    }
  }, [location.pathname]);

  const switchPortal = useCallback(
    (portal: PortalKey) => {
      setActivePortal(portal);
      window.OMRBridge?.setPortal?.(portal);
      const targetPath = PORTAL_TO_PATH[portal] ?? "/";
      if (window.location.pathname !== targetPath) {
        void navigate({ to: targetPath });
      }
    },
    [navigate],
  );

  const retry = useCallback(() => {
    setError("");
    window.location.reload();
  }, []);

  return {
    activePortal,
    error,
    switchPortal,
    retry,
  };
}
