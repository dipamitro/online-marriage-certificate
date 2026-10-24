/** Own every browser callback created by one registration mount. */
export function createLifecycle() {
  let disposed = false;
  const cleanups = new Set<() => void>();
  const timeouts = new Set<ReturnType<typeof setTimeout>>();
  const intervals = new Set<ReturnType<typeof setInterval>>();
  const frames = new Set<number>();
  return {
    get disposed() {
      return disposed;
    },
    listen(target: EventTarget, type: string, callback: (event: Event) => void | Promise<void>) {
      const guarded: EventListener = (event) => {
        if (disposed) return;
        try {
          Promise.resolve(callback(event)).catch(reportError);
        } catch (error) {
          reportError(error);
        }
      };
      target.addEventListener(type, guarded);
      cleanups.add(() => target.removeEventListener(type, guarded));
    },
    timeout(callback: () => void, delay: number) {
      const id = setTimeout(() => {
        timeouts.delete(id);
        if (!disposed) callback();
      }, delay);
      timeouts.add(id);
      return id;
    },
    interval(callback: () => void, delay: number) {
      const id = setInterval(() => {
        if (!disposed) callback();
      }, delay);
      intervals.add(id);
      return id;
    },
    frame(callback: FrameRequestCallback) {
      const id = requestAnimationFrame((time) => {
        frames.delete(id);
        if (!disposed) callback(time);
      });
      frames.add(id);
      return id;
    },
    dispose() {
      disposed = true;
      cleanups.forEach((cleanup) => cleanup());
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      frames.forEach(cancelAnimationFrame);
      cleanups.clear();
      timeouts.clear();
      intervals.clear();
      frames.clear();
    },
  };
}

function reportError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "This action could not finish. Please try again.";
  const alert =
    document.querySelector<HTMLElement>("#m-err") ?? document.querySelector<HTMLElement>("#toast");
  if (alert) {
    alert.textContent = message;
    alert.classList.add("show");
  }
  document.querySelectorAll<HTMLButtonElement>('#modal [data-act="mok"]').forEach((button) => {
    button.disabled = false;
  });
}
