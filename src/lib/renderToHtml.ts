import createMarkdown from "./markdown/rules";

export default function renderToHtml(markdown: string): string {
  return createMarkdown({ embeds: [], enableTemplatePlaceholder: false })
    .render(markdown)
    .trim();
}
