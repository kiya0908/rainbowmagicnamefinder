import test from "node:test";
import assert from "node:assert/strict";

import {
  MICROSOFT_CLARITY_PROJECT_ID,
  getMicrosoftClarityBootstrapScript,
} from "../../app/lib/analytics/clarity.js";

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
