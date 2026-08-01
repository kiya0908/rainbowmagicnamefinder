import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

import { FAIRY_LIST } from "../../app/features/fairy-finder/data/fairies.js";
import {
  FAIRY_COVER_ASSET_PREFIX,
  getFairyCoverAssetPath,
} from "../../app/features/fairy-finder/utils/cover-assets.js";

test("Fairy cover assets: official source URLs map to versioned same-origin paths", () => {
  const source =
    "https://orchardseriesbooks.co.uk/wp-content/uploads/2018/11/9781843626343-197x300.jpg";

  assert.equal(
    getFairyCoverAssetPath(source),
    `${FAIRY_COVER_ASSET_PREFIX}9781843626343-197x300.jpg`
  );
  assert.equal(getFairyCoverAssetPath("https://example.com/cover.jpg"), null);
  assert.equal(getFairyCoverAssetPath("not-a-url"), null);
});

test("Fairy cover assets: all catalog entries have one valid local JPEG", async () => {
  const assetDirectory = "public/assets/fairy-covers/v1";
  const files = await readdir(assetDirectory);
  const expectedPaths = FAIRY_LIST.map((fairy) =>
    getFairyCoverAssetPath(fairy.imageUrl)
  );

  assert.equal(FAIRY_LIST.length, 324);
  assert.equal(files.length, FAIRY_LIST.length);
  assert.equal(new Set(expectedPaths).size, FAIRY_LIST.length);

  for (const assetPath of expectedPaths) {
    assert.ok(assetPath);
    const bytes = await readFile(`public${assetPath}`);
    assert.ok(bytes.length > 1_000, `${assetPath} is unexpectedly small`);
    assert.deepEqual([...bytes.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }
});

test("Fairy cover assets: immutable cache headers cover the versioned directory", async () => {
  const headers = await readFile("public/_headers", "utf8");

  assert.match(headers, /\/assets\/fairy-covers\/v1\/\*/);
  assert.match(headers, /Cache-Control: public, max-age=31556952, immutable/);
});
