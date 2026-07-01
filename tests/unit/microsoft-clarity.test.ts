import test from "node:test";
import assert from "node:assert/strict";

import {
  MICROSOFT_CLARITY_BOOTSTRAP_SCRIPT_ID,
  MICROSOFT_CLARITY_PROJECT_ID,
  getMicrosoftClarityBootstrapScript,
} from "../../app/lib/analytics/clarity.js";

test("Microsoft Clarity: 延迟加载脚本使用稳定 DOM 标识", () => {
  assert.equal(
    MICROSOFT_CLARITY_BOOTSTRAP_SCRIPT_ID,
    "microsoft-clarity-bootstrap"
  );
});

test("Microsoft Clarity: bootstrap script targets the configured project id", () => {
  const script = getMicrosoftClarityBootstrapScript(
    MICROSOFT_CLARITY_PROJECT_ID
  );

  assert.match(script, /https:\/\/www\.clarity\.ms\/tag\//);
  assert.match(script, new RegExp(`"${MICROSOFT_CLARITY_PROJECT_ID}"`));
  assert.match(
    script,
    /window, document, "clarity", "script", "wpx83zcz3r"/
  );
});
