import * as React from "react";
import clsx from "clsx";
import markdoc, { type RenderableTreeNodes } from "@markdoc/markdoc";

export * from "./TOC";

interface MarkdownArticleProps extends React.ComponentProps<"div"> {
  node: RenderableTreeNodes;
}
export function MarkdownArticle({
  node,
  className,
  ...props
}: Omit<MarkdownArticleProps, "children">) {
  return (
    <div
      className={clsx(
        "max-w-full text-on-surface leading-relaxed break-words",
        "[&>*:first-child]:mt-0",
        "[&_h1]:mt-10 [&_h1]:mb-6 [&_h1]:text-3xl md:[&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:leading-tight",
        "[&_h2]:mt-9 [&_h2]:mb-5 [&_h2]:text-2xl md:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:leading-tight",
        "[&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:text-xl md:[&_h3]:text-2xl [&_h3]:font-semibold",
        "[&_p]:my-4 [&_p]:text-base md:[&_p]:text-[1.05rem]",
        "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:my-1.5",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary-container",
        "[&_img]:my-6 [&_img]:w-full [&_img]:rounded-lg",
        "[&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-on-surface-variant",
        "[&_hr]:my-8 [&_hr]:border-outline-variant",
        "[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-outline-variant [&_th]:bg-surface-container-low [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border [&_td]:border-outline-variant [&_td]:px-3 [&_td]:py-2",
        className
      )}
      {...props}
    >
      {markdoc.renderers.react(node, React)}
    </div>
  );
}
