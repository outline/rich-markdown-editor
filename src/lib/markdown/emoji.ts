import customFence from "markdown-it-container";

export default function notice(md): void {
  return customFence(md, "emoji", {
    marker: ":",
    validate: () => true,
    render: function(tokens, idx) {
      console.log(tokens, idx)
      const { info } = tokens[idx];

      if (tokens[idx].nesting === 1) {
        // opening tag
        return `<div class="emoji emoji-${md.utils.escapeHtml(info)}">\n`;
      } else {
        // closing tag
        return "</div>\n";
      }
    },
  });
}
