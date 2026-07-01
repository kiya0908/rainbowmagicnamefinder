import test from "node:test";
import assert from "node:assert/strict";

import { scheduleNonCriticalTask } from "../../app/lib/performance/schedule-non-critical-task.js";

test("非关键任务：支持空闲回调并传递最长等待时间", () => {
  let idleCallback: (() => void) | undefined;
  let receivedTimeout = 0;

  scheduleNonCriticalTask(() => undefined, {
    timeoutMs: 2500,
    host: {
      requestIdleCallback(callback, options) {
        idleCallback = callback;
        receivedTimeout = options?.timeout ?? 0;
        return 7;
      },
      cancelIdleCallback() {},
      setTimeout() {
        throw new Error("不应使用定时器回退");
      },
      clearTimeout() {},
    },
  });

  assert.equal(typeof idleCallback, "function");
  assert.equal(receivedTimeout, 2500);
});

test("非关键任务：任务即使被重复触发也只执行一次", () => {
  let idleCallback: (() => void) | undefined;
  let executionCount = 0;

  scheduleNonCriticalTask(() => {
    executionCount += 1;
  }, {
    host: {
      requestIdleCallback(callback) {
        idleCallback = callback;
        return 3;
      },
      cancelIdleCallback() {},
      setTimeout() {
        throw new Error("不应使用定时器回退");
      },
      clearTimeout() {},
    },
  });

  idleCallback?.();
  idleCallback?.();
  assert.equal(executionCount, 1);
});

test("非关键任务：缺少空闲 API 时按最长等待时间回退", () => {
  let timeoutCallback: (() => void) | undefined;
  let receivedDelay = 0;
  let executionCount = 0;

  scheduleNonCriticalTask(() => {
    executionCount += 1;
  }, {
    timeoutMs: 1800,
    host: {
      setTimeout(callback, delay) {
        timeoutCallback = callback;
        receivedDelay = delay;
        return 9;
      },
      clearTimeout() {},
    },
  });

  assert.equal(receivedDelay, 1800);
  timeoutCallback?.();
  assert.equal(executionCount, 1);
});

test("非关键任务：取消后不会执行等待中的空闲任务", () => {
  let idleCallback: (() => void) | undefined;
  let cancelledHandle = 0;
  let executionCount = 0;

  const cancel = scheduleNonCriticalTask(() => {
    executionCount += 1;
  }, {
    host: {
      requestIdleCallback(callback) {
        idleCallback = callback;
        return 11;
      },
      cancelIdleCallback(handle) {
        cancelledHandle = handle;
      },
      setTimeout() {
        throw new Error("不应使用定时器回退");
      },
      clearTimeout() {},
    },
  });

  cancel();
  idleCallback?.();
  assert.equal(cancelledHandle, 11);
  assert.equal(executionCount, 0);
});

test("非关键任务：取消定时器回退会清理句柄", () => {
  let clearedHandle = 0;

  const cancel = scheduleNonCriticalTask(() => undefined, {
    host: {
      setTimeout() {
        return 13;
      },
      clearTimeout(handle) {
        clearedHandle = handle;
      },
    },
  });

  cancel();
  assert.equal(clearedHandle, 13);
});
