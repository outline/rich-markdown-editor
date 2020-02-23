import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";

function isInline(token: Token) {
  return token.type === "inline";
}

function isLinkOpen(token: Token) {
  return token.type === "link_open";
}

function isLinkClose(token: Token) {
  return token.type === "link_close";
}

export default function(getLinkComponent) {
  function isEmbed(token: Token, link: Token) {
    const href = link.attrs[0][1];
    const simpleLink = href === token.content;
    return true;

    // TODO: FLIP
    if (!simpleLink) return false;
    return getLinkComponent(href);
  }

  return function markdownEmbeds(md: MarkdownIt) {
    md.core.ruler.after("inline", "embeds", state => {
      const tokens = state.tokens;
      let nodes;
      let insideLink;

      for (let i = 0; i < tokens.length - 1; i++) {
        // once we find an inline token look through it's children for links
        if (isInline(tokens[i])) {
          for (let j = 0; j < tokens[i].children.length - 1; j++) {
            const current = tokens[i].children[j];
            if (!current) continue;

            if (isLinkOpen(current)) {
              insideLink = current;
              continue;
            }

            if (isLinkClose(current)) {
              insideLink = null;
              continue;
            }

            // of hey, we found a link – lets check to see if it should be
            // considered to be an embed
            if (insideLink) {
              const component = isEmbed(current, insideLink);
              if (component) {
                const { content } = current;

                // convert to embed token
                nodes = [];
                const token = new Token("embed", "iframe", 0);
                token.attrSet("href", content);
                token.attrSet("component", component);
                nodes.push(token);

                // delete the inline link
                tokens[i].children.splice(j - 1, 3);
              }
            }
          }
        }

        if (nodes && tokens[i].level === 0) {
          tokens.splice(i + 1, 0, ...nodes);
          nodes = null;
        }
      }

      console.log(tokens);
    });
  };
}
