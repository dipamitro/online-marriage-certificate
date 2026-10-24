import type { AnyDeps, ApplicationRecord, EmailLink } from "../types";

/** services/applications. Dependencies: S, now. */
export function createServicesApplications(dependencies: AnyDeps) {
  function pushMail(
    to: string,
    toName: string,
    subject: string,
    body: string[],
    link: EmailLink,
  ): void {
    dependencies.S.emails.unshift({
      id: "m" + Date.now() + Math.random().toString(36).slice(2, 6),
      to,
      toName,
      subject,
      body,
      link,
      at: dependencies.now(),
      read: false,
    });
  }
  function hist(a: ApplicationRecord, by: string, text: string): void {
    (a.history = a.history || []).push({ at: dependencies.now(), by, text });
  }
  function activeMarriage(nid: string, exceptId?: string): ApplicationRecord | undefined {
    return dependencies.S.apps.find(
      (a: ApplicationRecord) =>
        a.status === "issued" &&
        a.id !== exceptId &&
        (a.f.groom.nid === nid || a.f.bride.nid === nid),
    );
  }
  return { pushMail, hist, activeMarriage };
}
