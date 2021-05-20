import MarkdownIt from "markdown-it";
import customFence from "markdown-it-container";

export default function queryblock(md: MarkdownIt): void {
  return customFence(md, "query_block", {
    marker: ";",
    validate: () => true,
    render: function(tokens, idx) {
      console.log("QUERYBLOCK TOKENS: ", tokens);
      if (tokens[idx].nesting === 1) {
        // opening tag
        return `<div class="queryblock">\n`;
      } else {
        // closing tag
        return "</div>\n";
      }
    },
  });
}
