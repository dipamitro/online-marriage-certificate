import { MarriagePortal } from "@/components/MarriagePortal";

export function HomePage() {
  return <MarriagePortal initialPortal="home" />;
}

export function ApplicantSignInPage() {
  return <MarriagePortal initialPortal="home" initialSignInRole="applicant" />;
}

export function RegistrarSignInPage() {
  return <MarriagePortal initialPortal="home" initialSignInRole="registrar" />;
}

export function AdminSignInPage() {
  return <MarriagePortal initialPortal="home" initialSignInRole="admin" />;
}

export function SuperAdminSignInPage() {
  return <MarriagePortal initialPortal="home" initialSignInRole="super" />;
}
