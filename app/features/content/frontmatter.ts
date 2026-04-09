//解析 Markdown frontmatter，读取每个内容页的元数据。
type FrontmatterValue = string | boolean | string[];

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

const parseScalar = (value: string): string | boolean => {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  return trimmed;
};

export function parseFrontmatter(raw: string): {
  data: Record<string, FrontmatterValue>;
  body: string;
} {
  const match = raw.match(FRONTMATTER_PATTERN);

  if (!match) {
    return {
      data: {},
      body: raw,
    };
  }

  const data: Record<string, FrontmatterValue> = {};
  let activeArrayKey: string | null = null;

  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (keyMatch) {
      const [, key, rawValue] = keyMatch;
      const value = rawValue.trim();

      if (!value) {
        data[key] = [];
        activeArrayKey = key;
      } else {
        data[key] = parseScalar(value);
        activeArrayKey = null;
      }

      continue;
    }

    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && activeArrayKey) {
      const nextItem = parseScalar(listMatch[1]);
      const current = data[activeArrayKey];

      if (!Array.isArray(current) || typeof nextItem !== "string") {
        throw new Error(`Invalid list value in frontmatter for key "${activeArrayKey}".`);
      }

      current.push(nextItem);
    }
  }

  return {
    data,
    body: raw.slice(match[0].length),
  };
}
