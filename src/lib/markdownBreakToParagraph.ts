import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";

function isHardbreak(token: Token) {
  return (token.children || []).filter(
    child =>
      child.type === "hardbreak" ||
      (child.type === "text" && child.content === "\\")
  );
}

export default function(md: MarkdownIt) {
  // insert a new rule after the "inline" rules are parsed
  md.core.ruler.after("inline", "to-paragraph", state => {
    const { Token } = state;
    const tokens = state.tokens;

    // work backwards through the tokens and find text that looks like a br
    for (let i = tokens.length - 1; i > 0; i--) {
      const matches = isHardbreak(tokens[i]);

      if (matches.length) {
        const nodes = [];
        let token;
        const children = tokens[i].children.filter(
          c => c.type !== "hardbreak" && c.type !== "text"
        );

        let count = matches.length;
        if (!!children.length) count++;

        for (let i = 0; i < count; i++) {
          const isLast = i === count - 1;

          token = new Token("paragraph_open", "p", 1);
          nodes.push(token);

          const text = new Token("text", "", 0);
          text.content = "";

          token = new Token("inline", "", 0);
          token.children = isLast ? [text, ...children] : [text];
          token.content = "";
          nodes.push(token);

          token = new Token("paragraph_close", "p", -1);
          nodes.push(token);
        }

        tokens.splice(i - 1, 3, ...nodes);
      }
    }
  });
}
