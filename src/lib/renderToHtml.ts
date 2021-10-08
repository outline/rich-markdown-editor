import createMarkdown from "./markdown/rules";

export default function renderToHtml(markdown: string): string {
  return createMarkdown({})
    .render(markdown)
    .trim();
}
