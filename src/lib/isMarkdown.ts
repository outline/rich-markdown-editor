export default function isMarkdown(text: string): boolean {
  // code-ish
  if (text.includes("```")) return true;

  // link-ish
  if (text.match(/\[[^]]+\]\(https?:\/\/\S+\)/gm)) return true;

  // heading-ish
  if (text.match(/^#{1,6}\s+\S+/gm)) return true;

  return false;
}
