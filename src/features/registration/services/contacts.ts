import type { AnyDeps } from "../types";

/** services/contacts. Dependencies: PEOPLE, REGISTRARS, licOf. */
export function createServicesContacts(dependencies: AnyDeps) {
  const DEMO_MOBILE: Record<string, string> = {
    5555555555: "01755555555",
    7012345678: "01711000101",
    7123456789: "01811000102",
    8012345678: "01711000103",
    8123456789: "01811000104",
    8223456789: "01811000104",
    9012345678: "01711000105",
    9123456789: "01811000106",
    1990123456: "01712345601",
    2001987654: "01812345602",
    5678901234: "01812345603",
    1985123401: "01712340101",
    1988123402: "01712340102",
    1990123403: "01712340103",
    1984123404: "01712340104",
    1992123405: "01712340105",
  };
  const demoEmail = (n: string): string => {
    const L =
      dependencies.licOf(n) ||
      Object.keys(dependencies.REGISTRARS).find((l) => dependencies.REGISTRARS[l]?.nid === n);
    return L
      ? dependencies.REGISTRARS[L].email
      : (dependencies.PEOPLE[n]?.en ?? n)
          .toLowerCase()
          .replace(/[^a-z]+/g, ".")
          .replace(/^\.|\.$/g, "") + "@mail.com";
  };
  const demoMobile = (n: string): string => {
    const L = Object.keys(dependencies.REGISTRARS).find(
      (l) => dependencies.REGISTRARS[l]?.nid === n,
    );
    return L ? dependencies.REGISTRARS[L].mobile : DEMO_MOBILE[n] || "017" + n.slice(-8);
  };
  return { DEMO_MOBILE, demoEmail, demoMobile };
}
