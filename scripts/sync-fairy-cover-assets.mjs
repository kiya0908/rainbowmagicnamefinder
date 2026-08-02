import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_FILE = "app/features/fairy-finder/data/fairies.ts";
const OUTPUT_DIRECTORY = "public/assets/fairy-covers/v1";
const EXPECTED_COVER_COUNT = 299;
const CONCURRENCY = 6;
const MAX_ATTEMPTS = 3;
const SOURCE_URL_PATTERN = /imageUrl:\s*"(https:\/\/orchardseriesbooks\.co\.uk\/wp-content\/uploads\/[^"]+\.jpe?g)"/gi;

const source = await readFile(SOURCE_FILE, "utf8");
const urls = [...source.matchAll(SOURCE_URL_PATTERN)].map((match) => match[1]);
const entries = urls.map((url) => ({
  url,
  filename: path.posix.basename(new URL(url).pathname),
}));

if (entries.length !== EXPECTED_COVER_COUNT) {
  throw new Error(`Expected ${EXPECTED_COVER_COUNT} cover URLs, found ${entries.length}`);
}

if (new Set(entries.map(({ url }) => url)).size !== entries.length) {
  throw new Error("Cover source URLs must be unique");
}

if (new Set(entries.map(({ filename }) => filename)).size !== entries.length) {
  throw new Error("Cover asset filenames must be unique");
}

await mkdir(OUTPUT_DIRECTORY, { recursive: true });

const isValidJpeg = async (filePath) => {
  try {
    const info = await stat(filePath);
    if (info.size <= 1_000) return false;
    const bytes = await readFile(filePath);
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  } catch {
    return false;
  }
};

const download = async ({ url, filename }, index) => {
  const destination = path.join(OUTPUT_DIRECTORY, filename);
  if (await isValidJpeg(destination)) return "cached";

  const temporary = `${destination}.download`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "image/jpeg" },
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const bytes = Buffer.from(await response.arrayBuffer());
      if (
        bytes.length <= 1_000 ||
        bytes[0] !== 0xff ||
        bytes[1] !== 0xd8 ||
        bytes[2] !== 0xff
      ) {
        throw new Error("Response is not a valid JPEG");
      }

      await writeFile(temporary, bytes);
      await rename(temporary, destination);
      return "downloaded";
    } catch (error) {
      await rm(temporary, { force: true });
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(`${filename}: ${error instanceof Error ? error.message : String(error)}`);
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 750));
    }
  }

  throw new Error(`${filename}: retry loop exhausted`);
};

let cursor = 0;
let downloaded = 0;
let cached = 0;

const worker = async () => {
  while (cursor < entries.length) {
    const index = cursor;
    cursor += 1;
    const result = await download(entries[index], index);
    if (result === "downloaded") downloaded += 1;
    else cached += 1;

    const completed = downloaded + cached;
    if (completed % 25 === 0 || completed === entries.length) {
      process.stdout.write(`covers ${completed}/${entries.length}\n`);
    }
  }
};

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
process.stdout.write(`complete downloaded=${downloaded} cached=${cached}\n`);
