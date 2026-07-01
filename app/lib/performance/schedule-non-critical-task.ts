export interface NonCriticalTaskHost {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number }
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
  setTimeout: (callback: () => void, delay: number) => number;
  clearTimeout: (handle: number) => void;
}

interface NonCriticalTaskOptions {
  timeoutMs?: number;
  host?: NonCriticalTaskHost;
}

const getBrowserHost = (): NonCriticalTaskHost => ({
  requestIdleCallback: window.requestIdleCallback?.bind(window),
  cancelIdleCallback: window.cancelIdleCallback?.bind(window),
  setTimeout: window.setTimeout.bind(window),
  clearTimeout: window.clearTimeout.bind(window),
});

export const scheduleNonCriticalTask = (
  task: () => void,
  { timeoutMs = 3000, host = getBrowserHost() }: NonCriticalTaskOptions = {}
) => {
  let active = true;

  const runOnce = () => {
    if (!active) return;
    active = false;
    task();
  };

  if (host.requestIdleCallback) {
    const idleHandle = host.requestIdleCallback(runOnce, { timeout: timeoutMs });

    return () => {
      if (!active) return;
      active = false;
      host.cancelIdleCallback?.(idleHandle);
    };
  }

  const timeoutHandle = host.setTimeout(runOnce, timeoutMs);

  return () => {
    if (!active) return;
    active = false;
    host.clearTimeout(timeoutHandle);
  };
};
