import { MarriagePortal } from "@/components/MarriagePortal";

export function ApplicantPage() {
  return <MarriagePortal initialPortal="applicant" />;
}

export function RegistrarPage() {
  return <MarriagePortal initialPortal="registrar" />;
}

export function EnlistmentPage() {
  return <MarriagePortal initialPortal="enl" initialEnlRole="applicant" />;
}

export function AdminPage() {
  return <MarriagePortal initialPortal="enl" initialEnlRole="admin" />;
}

export function SuperAdminPage() {
  return <MarriagePortal initialPortal="enl" initialEnlRole="super" />;
}

export function ESignPage() {
  return <MarriagePortal initialPortal="esign" />;
}

export function WalletPage() {
  return <MarriagePortal initialPortal="wallet" />;
}

export function VerifyPage() {
  return <MarriagePortal initialPortal="verify" />;
}

export function InboxPage() {
  return <MarriagePortal initialPortal="inbox" />;
}
