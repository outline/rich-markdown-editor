import createMarkdown from "./markdown/rules";

export default function renderToHtml(markdown: string): string {
  return createMarkdown({ embeds: [] })
    .render(markdown)
    .trim();
}
