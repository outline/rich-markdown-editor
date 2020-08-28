import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";

export default function markdownTables(md: MarkdownIt) {
  // insert a new rule after the "inline" rules are parsed
  md.core.ruler.after("inline", "tables-pm", state => {
    const tokens = state.tokens;
    let inside = false;

    for (let i = tokens.length - 1; i > 0; i--) {
      if (inside) {
        tokens[i].level--;
      }

      // convert break line into br tag
      if (tokens[i].type === "inline" && tokens[i].content.includes("\\n")) {
        const nodes: Token[] = [];
        const breakParts = tokens[i].content.split("\\n");
        breakParts.forEach((part, index) => {
          const token = new Token("text", "", 1);
          token.content = part.trim();
          nodes.push(token);

          if (index < breakParts.length - 1) {
            const brToken = new Token("br", "br", 1);
            nodes.push(brToken);
          }
        });

        tokens.splice(i, 1, ...nodes);
      }

      // filter out incompatible tokens from markdown-it that we don't need
      // in prosemirror. thead/tbody do nothing.
      if (
        ["thead_open", "thead_close", "tbody_open", "tbody_close"].includes(
          tokens[i].type
        )
      ) {
        inside = !inside;
        tokens.splice(i, 1);
      }

      if (["th_open", "td_open"].includes(tokens[i].type)) {
        // markdown-it table parser does not return paragraphs inside the cells
        // but prosemirror requires them, so we add 'em in here.
        tokens.splice(i + 1, 0, new Token("paragraph_open", "p", 1));

        // markdown-it table parser stores alignment as html styles, convert
        // to a simple string here
        const tokenAttrs = tokens[i].attrs;
        if (tokenAttrs) {
          const style = tokenAttrs[0][1];
          tokens[i].info = style.split(":")[1];
        }
      }

      if (["th_close", "td_close"].includes(tokens[i].type)) {
        tokens.splice(i, 0, new Token("paragraph_close", "p", -1));
      }
    }

    return false;
  });
}
