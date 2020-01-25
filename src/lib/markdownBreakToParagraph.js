// @flow

function isHardbreak(token) {
  return (token.children || []).filter(
    child =>
      child.type === "hardbreak" ||
      (child.type === "text" && child.content === "\\")
  );
}

export default function(md, options) {
  // insert a new rule after the "inline" rules are parsed
  md.core.ruler.after("inline", "to-paragraph", state => {
    const { Token } = state;
    let tokens = state.tokens;

    // work backwards through the tokens and find text that looks like a br
    for (let i = tokens.length - 1; i > 0; i--) {
      let matches = isHardbreak(tokens[i]);

      if (matches.length) {
        let nodes = [];
        let token;
        let children = tokens[i].children.filter(
          c => c.type !== "hardbreak" && c.type !== "text"
        );

        let count = matches.length;
        if (!!children.length) count++;

        for (let i = 0; i < count; i++) {
          let isLast = i === count - 1;

          token = new Token("paragraph_open", "p", 1);
          nodes.push(token);

          let text = new Token("text", "", 0);
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
