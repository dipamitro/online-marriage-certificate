/**
 * Portal navigation and routing type definitions.
 */
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

export interface PortalRouteMeta {
  path: PortalRoutePath;
  portal: PortalKey;
  title: string;
  description: string;
  requiresAuth?: boolean;
}
