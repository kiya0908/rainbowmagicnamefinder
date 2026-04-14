import test from "node:test";
import assert from "node:assert/strict";

import {
  getFairyImageSrc,
  parseFairyImageSource,
} from "../../app/features/fairy-finder/utils/image.js";

test("Fairy image proxy: orchard cover urls are rewritten to the local proxy", () => {
  const source =
    "https://orchardseriesbooks.co.uk/wp-content/uploads/2018/11/9781843626343-197x300.jpg";

  assert.equal(
    getFairyImageSrc(source),
    `/api/fairy-image?src=${encodeURIComponent(source)}`
  );
});

test("Fairy image proxy: orchard uploads are accepted", () => {
  const source =
    "https://orchardseriesbooks.co.uk/wp-content/uploads/2018/11/9781843626343-197x300.jpg";

  assert.equal(parseFairyImageSource(source)?.toString(), source);
});

test("Fairy image proxy: non-whitelisted hosts are rejected", () => {
  const source = "https://example.com/wp-content/uploads/cover.jpg";

  assert.equal(parseFairyImageSource(source), null);
});

test("Fairy image proxy: non-upload orchard paths are rejected", () => {
  const source = "https://orchardseriesbooks.co.uk/assets/cover.jpg";

  assert.equal(parseFairyImageSource(source), null);
});
