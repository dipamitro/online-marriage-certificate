import { afterEach, describe, expect, it, vi } from "vitest";
import { createLifecycle } from "./lifecycle";
import { createRepository, STORAGE_KEY } from "./repository";

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

describe("Registration storage", () => {
  it("returns null for absent data", () => {
    expect(createRepository(localStorage).read()).toBeNull();
  });
  it("preserves malformed data rather than replacing it", () => {
    localStorage.setItem(STORAGE_KEY, "{invalid");
    expect(() => createRepository(localStorage).read()).toThrow();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("{invalid");
  });
  it("rejects structurally invalid stored values", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ apps: "invalid" }));
    expect(() => createRepository(localStorage).read()).toThrow();
  });
  it("round trips records and retains integration extension fields", () => {
    const repository = createRepository(localStorage);
    repository.write({
      apps: [],
      emails: [],
      seq: { app: 10030, reg: 5120 },
      users: {},
      custom: { retained: true },
    });
    expect(repository.read()).toEqual({
      apps: [],
      emails: [],
      seq: { app: 10030, reg: 5120 },
      users: {},
      custom: { retained: true },
    });
  });
  it("reports write failures", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("Quota");
      },
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    };
    expect(() =>
      createRepository(storage).write({ apps: [], emails: [], seq: { app: 0, reg: 0 }, users: {} }),
    ).toThrow("could not be saved");
  });
});

describe("Registration lifecycle", () => {
  it("removes listeners and cancels timers on disposal", () => {
    vi.useFakeTimers();
    const lifecycle = createLifecycle(),
      callback = vi.fn(),
      target = new EventTarget();
    lifecycle.listen(target, "registration", callback);
    lifecycle.timeout(callback, 10);
    lifecycle.interval(callback, 10);
    target.dispatchEvent(new Event("registration"));
    expect(callback).toHaveBeenCalledTimes(1);
    lifecycle.dispose();
    target.dispatchEvent(new Event("registration"));
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(lifecycle.disposed).toBe(true);
  });
});
