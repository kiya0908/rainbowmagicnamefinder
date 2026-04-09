//提供共享 Markdown 解析能力，给详情页 loader 使用。
import markdoc from "@markdoc/markdoc";

export function parseMarkdown(markdown: string) {
  const ast = markdoc.parse(markdown);
  const node = markdoc.transform(ast, {
    tags: {},
  });

  return { ast, node };
}
