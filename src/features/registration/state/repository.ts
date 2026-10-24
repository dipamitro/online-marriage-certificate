import { z } from "zod";

export const STORAGE_KEY = "omr-merged-v2";
const record = z.record(z.unknown());
const person = z
  .object({
    nameBn: z.string(),
    nameEn: z.string(),
    fatherBn: z.string(),
    fatherEn: z.string(),
    motherBn: z.string(),
    motherEn: z.string(),
    addr: z
      .object({
        houseBn: z.string(),
        houseEn: z.string(),
        roadBn: z.string(),
        roadEn: z.string(),
        dist: z.string(),
        upz: z.string(),
        po: z.string(),
        uni: z.string(),
        ward: z.string(),
      })
      .passthrough(),
  })
  .passthrough();
const spouse = person.extend({
  dob: z.string(),
  nid: z.string(),
  marital: z.string(),
  mobile: z.string(),
  email: z.string(),
});
const signature = z.object({ ekyc: record.nullable(), sign: record.nullable() }).passthrough();
const application = z
  .object({
    id: z.string(),
    appNo: z.string(),
    owner: z.string(),
    status: z.enum(["draft", "esign", "appraisal", "reverted", "approval", "issued"]),
    f: z
      .object({
        type: z.string(),
        registrar: z.string(),
        applicantRole: z.string().default(""),
        loc: z
          .object({
            div: z.string(),
            dist: z.string(),
            upz: z.string(),
            uni: z.string(),
            ward: z.string(),
          })
          .passthrough(),
        groom: spouse,
        bride: spouse,
        ukil: z
          .object({ appointed: z.string(), side: z.string(), person, w1: person, w2: person })
          .passthrough(),
        wit: z.object({ w1: person, w2: person }).passthrough(),
        off: person,
        m: z
          .object({
            settle: z.string(),
            mohor: z.string(),
            prompt: z.string(),
            paid: z.string(),
            c16: z.string(),
            c16d: z.string(),
            c17: z.string(),
            c17o: z.array(z.string()),
            c17d: z.string(),
            c18: z.string(),
            c18d: z.string(),
            c19: z.string(),
            c19d: z.string(),
            c20: z.string(),
            c20d: z.string(),
            c21: z.string(),
            permNo: z.string(),
            permDate: z.string(),
            regDate: z.string(),
            regTime: z.string(),
            pay: z.string(),
            contact: z.string(),
          })
          .passthrough(),
      })
      .passthrough(),
    esign: z.object({ groom: signature, bride: signature }).passthrough(),
    reg: signature,
    history: z
      .array(z.object({ at: z.string(), by: z.string(), text: z.string() }).passthrough())
      .default([]),
    issued: z.object({ regNo: z.string(), at: z.string() }).passthrough().nullable(),
    vds: z.string(),
  })
  .passthrough();
const stateSchema = z
  .object({
    apps: z.array(application),
    emails: z
      .array(
        z
          .object({
            id: z.string(),
            to: z.string(),
            toName: z.string(),
            subject: z.string(),
            body: z.array(z.string()),
            at: z.string(),
            read: z.boolean(),
            link: z.object({ type: z.string() }).passthrough(),
          })
          .passthrough(),
      )
      .default([]),
    seq: z.object({ app: z.number().int().nonnegative(), reg: z.number().int().nonnegative() }),
    users: z
      .record(
        z
          .object({
            nid: z.string(),
            role: z.string(),
            email: z.string(),
            mobile: z.string(),
            ekyc: z.object({ at: z.string(), score: z.number() }).passthrough(),
          })
          .passthrough(),
      )
      .default({}),
    walletSeen: z.record(z.array(z.string())).optional(),
  })
  .passthrough();
export type RegistrationState = z.infer<typeof stateSchema>;

export class StorageRecoveryError extends Error {}

/** Never overwrite a corrupt record with seeded data; let the user choose reset. */
export function createRepository(storage?: Storage) {
  const getStorage = () => storage ?? window.localStorage;
  return {
    read(): RegistrationState | null {
      let raw: string | null;
      try {
        raw = getStorage().getItem(STORAGE_KEY);
      } catch {
        throw new StorageRecoveryError(
          "Browser storage is unavailable. Allow site storage and try again.",
        );
      }
      if (raw === null) return null;
      try {
        const result = stateSchema.safeParse(JSON.parse(raw));
        if (result.success) return result.data;
      } catch {
        /* Keep the original record intact for recovery. */
      }
      throw new StorageRecoveryError(
        "Saved registration data could not be read. Your original data has not been changed.",
      );
    },
    write(state: RegistrationState) {
      try {
        getStorage().setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        throw new StorageRecoveryError(
          "Your changes could not be saved. Check available browser storage and try again.",
        );
      }
    },
  };
}
