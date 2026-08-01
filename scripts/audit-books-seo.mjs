const DEFAULT_URL = "http://127.0.0.1:5173/books";
const MIN_DENSITY = 3.5;
const MAX_DENSITY = 5;

const targetPhrases = [
  "how many rainbow magic books are there",
  "rainbow magic books in order",
  "rainbow magic books checklist",
  "rainbow magic books list",
  "rainbow magic book series",
  "rainbow magic books",
].map((phrase) => ({ phrase, tokens: phrase.split(" ") }));

const decodeHtml = (value) => value
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&(nbsp|amp|quot|apos|lt|gt|middot);/gi, (entity, name) => ({
    nbsp: " ", amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", middot: "·",
  })[name.toLowerCase()] ?? entity);

const extractVisibleText = (html) => decodeHtml(html
  .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim());

const tokenize = (text) => text.toLowerCase().match(/[a-z]+(?:['’-][a-z]+)*/g) ?? [];

const phraseMatchesAt = (tokens, index, phraseTokens) =>
  phraseTokens.every((token, offset) => tokens[index + offset] === token);

const auditDensity = (text) => {
  const tokens = tokenize(text);
  const counts = Object.fromEntries(targetPhrases.map(({ phrase }) => [phrase, 0]));
  let coveredKeywordWords = 0;

  for (let index = 0; index < tokens.length;) {
    const match = targetPhrases.find(({ tokens: phraseTokens }) =>
      phraseMatchesAt(tokens, index, phraseTokens)
    );
    if (!match) {
      index += 1;
      continue;
    }
    counts[match.phrase] += 1;
    coveredKeywordWords += match.tokens.length;
    index += match.tokens.length;
  }

  return {
    totalWords: tokens.length,
    coveredKeywordWords,
    weightedDensity: Number(((coveredKeywordWords / tokens.length) * 100).toFixed(3)),
    counts,
  };
};

const url = process.argv[2] ?? DEFAULT_URL;
const response = await fetch(url);
if (!response.ok) throw new Error(`SEO audit could not load ${url}: HTTP ${response.status}`);

const report = auditDensity(extractVisibleText(await response.text()));
console.log(JSON.stringify({ url, range: [MIN_DENSITY, MAX_DENSITY], ...report }, null, 2));

if (report.weightedDensity < MIN_DENSITY || report.weightedDensity > MAX_DENSITY) {
  throw new Error(`Weighted keyword density ${report.weightedDensity}% is outside ${MIN_DENSITY}%-${MAX_DENSITY}%`);
}

for (const { phrase } of targetPhrases.slice(0, -1)) {
  if (report.counts[phrase] === 0) throw new Error(`Missing target phrase: ${phrase}`);
}
